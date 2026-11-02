import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { TravelBooking } from '@/types/marketplace'
import { claimPaymentCreation, savePaymentUrl, updatePayment } from './bookings'
import { appOrigin, HttpError, paymentMode } from './http'

function gateway(mode: TravelBooking['paymentMode']) {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key)
    throw new HttpError(503, 'Pembayaran belum dikonfigurasi oleh pengelola.')
  const production = mode === 'production'
  return {
    key,
    auth: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
    api: production
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com',
    snap: production
      ? 'https://app.midtrans.com'
      : 'https://app.sandbox.midtrans.com',
  }
}

export function verifyNotification(
  payload: Record<string, unknown>,
  serverKey: string
) {
  const { order_id, status_code, gross_amount, signature_key } = payload
  if (
    [order_id, status_code, gross_amount, signature_key].some(
      (v) => typeof v !== 'string'
    )
  )
    return false
  const signature = signature_key as string
  if (!/^[a-f0-9]{128}$/i.test(signature)) return false
  const expected = createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest()
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

export async function initializePayment(order: TravelBooking) {
  if (
    order.paymentMode === 'demo' ||
    order.status !== 'pending' ||
    order.paymentUrl
  )
    return
  const config = gateway(order.paymentMode)
  const appUrl = appOrigin()
  if (!appUrl) throw new HttpError(503, 'APP_URL belum dikonfigurasi.')
  const claimed = await claimPaymentCreation(order.id)
  if (!claimed) return
  // The same order is never submitted twice, including when a gateway response times out.
  const response = await fetch(`${config.snap}/snap/v1/transactions`, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: config.auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      transaction_details: { order_id: order.id, gross_amount: order.total },
      customer_details: {
        first_name: order.draft.customerName,
        email: order.draft.email,
        phone: order.draft.phone,
      },
      enabled_payments:
        order.draft.paymentMethod === 'QRIS'
          ? ['other_qris']
          : ['bank_transfer'],
      callbacks: {
        finish: `${new URL(appUrl).origin}/?order=${encodeURIComponent(order.id)}`,
      },
      expiry: {
        start_time: `${order.createdAt.slice(0, 19).replace('T', ' ')} +0000`,
        unit: 'minute',
        duration: 15,
      },
      page_expiry: { unit: 'minute', duration: 15 },
    }),
  })
  if (!response.ok) {
    if (response.status >= 400 && response.status < 500)
      await updatePayment(order.id, order.total, 'cancel', order.paymentMode)
    throw new HttpError(
      502,
      'Halaman pembayaran belum dapat dibuat. Buka Tiket Saya untuk memeriksa pesanan sebelum mencoba lagi.'
    )
  }
  const result = (await response.json()) as { redirect_url?: string }
  const redirect = result.redirect_url ? new URL(result.redirect_url) : null
  if (!redirect || redirect.origin !== config.snap)
    throw new HttpError(502, 'Alamat pembayaran dari penyedia tidak valid.')
  await savePaymentUrl(order.id, redirect.href)
}

export async function reconcilePayment(
  id: string,
  mode: TravelBooking['paymentMode']
) {
  if (mode === 'demo')
    throw new HttpError(403, 'Pesanan demo tidak memiliki transaksi Midtrans.')
  const config = gateway(mode)
  const response = await fetch(
    `${config.api}/v2/${encodeURIComponent(id)}/status`,
    {
      headers: { Authorization: config.auth, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    }
  )
  if (response.status === 404) return null
  if (!response.ok)
    throw new HttpError(
      502,
      'Status pembayaran belum dapat diperiksa. Silakan coba lagi.'
    )
  const data = (await response.json()) as Record<string, unknown>
  if (
    data.order_id !== id ||
    data.currency !== 'IDR' ||
    !Number.isFinite(Number(data.gross_amount))
  )
    throw new HttpError(400, 'Data transaksi dari penyedia tidak sesuai.')
  const status = data.transaction_status
  if (typeof status !== 'string')
    throw new HttpError(502, 'Status pembayaran tidak valid.')
  if (status === 'capture' && data.fraud_status !== 'accept') return null
  return updatePayment(id, Number(data.gross_amount), status, mode)
}

export async function paymentNotification(payload: Record<string, unknown>) {
  const mode = paymentMode()
  if (mode === 'demo')
    throw new HttpError(403, 'Webhook tidak tersedia dalam mode demo.')
  const config = gateway(mode)
  if (!verifyNotification(payload, config.key))
    throw new HttpError(403, 'Tanda tangan notifikasi tidak valid.')
  // Authenticate again with Midtrans; browser redirects and forged body fields cannot issue tickets.
  const result = await reconcilePayment(payload.order_id as string, mode)
  if (!result)
    throw new HttpError(
      503,
      'Status penyedia belum final atau belum tersedia. Notifikasi dapat dicoba ulang.'
    )
  return result
}
