import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import {
  BookingDraft,
  BookingVoucher,
  ItineraryStop,
  TravelBooking,
} from '@/types/marketplace'
import { SessionUser } from '@/types/auth'
import { addDays, HOTELS, MARKET_PRODUCTS, todayISO } from '../marketplace-data'
import { bookingQuote, validateBooking } from '../booking-rules'
import { query, Sql, transaction } from './db'
import { appOrigin, HttpError, paymentMode } from './http'
import { PRIVATE_ITINERARIES } from './itineraries'
import { estimateCarbon } from '../carbon'

type StoredBooking = TravelBooking & {
  voucherPlan: BookingVoucher[]
  itineraryPlan: ItineraryStop[]
  paymentStarted?: boolean
}
type Row = Record<string, unknown> & {
  id: string
  user_id: string
  request_hash: string
  status: TravelBooking['status']
  data: StoredBooking
  expires_at: string
  allocations_released: boolean
}
const productById = (id: string) => MARKET_PRODUCTS.find((p) => p.id === id)

export function visibleBooking(row: Row, user: SessionUser): TravelBooking {
  const {
    voucherPlan: _v,
    itineraryPlan: _i,
    paymentStarted: _p,
    ...booking
  } = row.data
  const allowed = user.role === 'admin' ? new Set(user.partnerProducts) : null
  const paid = row.status === 'paid'
  return {
    ...booking,
    status: row.status,
    vouchers: paid
      ? booking.vouchers.filter(
          (v) => !allowed || allowed.has(v.productId || '')
        )
      : [],
    itinerary: paid && !allowed ? booking.itinerary : [],
  }
}

async function releaseInventory(sql: Sql, row: Row) {
  if (row.allocations_released) return
  const allocations = await sql.query<{
    inventory_key: string
    quantity: number
  }>(
    'SELECT inventory_key,quantity FROM silaq_allocations WHERE booking_id=$1 ORDER BY inventory_key',
    [row.id]
  )
  for (const allocation of allocations.rows)
    await sql.query(
      'UPDATE silaq_inventory SET reserved=GREATEST(0,reserved-$2) WHERE key=$1',
      [allocation.inventory_key, allocation.quantity]
    )
  await sql.query(
    'UPDATE silaq_bookings SET allocations_released=true WHERE id=$1',
    [row.id]
  )
}

async function setStatus(sql: Sql, row: Row, status: TravelBooking['status']) {
  const data = {
    ...row.data,
    status,
    vouchers: status === 'paid' ? row.data.voucherPlan : [],
    itinerary: status === 'paid' ? row.data.itineraryPlan : [],
  }
  await sql.query('UPDATE silaq_bookings SET status=$2,data=$3 WHERE id=$1', [
    row.id,
    status,
    JSON.stringify(data),
  ])
  return { ...row, data, status }
}

export async function expireBookings() {
  await transaction(async (sql) => {
    const rows = await sql.query<Row>(
      "SELECT * FROM silaq_bookings WHERE status='pending' AND expires_at < $1 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 100",
      [Date.now()]
    )
    const unreleased = rows.rows
      .filter((row) => !row.allocations_released)
      .map((row) => row.id)
    if (unreleased.length) {
      // Lock every shared inventory row in one order, even across a batch of bookings.
      const allocations = await sql.query<{
        inventory_key: string
        quantity: number
      }>(
        'SELECT inventory_key,sum(quantity)::int as quantity FROM silaq_allocations WHERE booking_id=ANY($1::text[]) GROUP BY inventory_key ORDER BY inventory_key',
        [unreleased]
      )
      for (const allocation of allocations.rows)
        await sql.query(
          'UPDATE silaq_inventory SET reserved=GREATEST(0,reserved-$2) WHERE key=$1',
          [allocation.inventory_key, allocation.quantity]
        )
      await sql.query(
        'UPDATE silaq_bookings SET allocations_released=true WHERE id=ANY($1::text[])',
        [unreleased]
      )
    }
    for (const row of rows.rows) {
      await setStatus(sql, row, 'expired')
    }
  })
}

export async function bookingRows(user: SessionUser) {
  await expireBookings()
  if (user.role === 'superadmin')
    return (
      await query<Row>(
        'SELECT * FROM silaq_bookings ORDER BY created_at DESC LIMIT 200'
      )
    ).rows
  if (user.role === 'consumer')
    return (
      await query<Row>(
        'SELECT * FROM silaq_bookings WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200',
        [user.id]
      )
    ).rows
  const rows = await query<Row>(
    `SELECT DISTINCT b.* FROM silaq_bookings b JOIN silaq_allocations a ON a.booking_id=b.id JOIN silaq_inventory i ON i.key=a.inventory_key WHERE i.product_id=ANY($1::text[]) ORDER BY b.created_at DESC LIMIT 200`,
    [user.partnerProducts]
  )
  return rows.rows
}

function plan(productId: string, draft: BookingDraft, id: string) {
  const product = productById(productId)!
  const slots: {
    key: string
    productId: string
    day: string
    quantity: number
    capacity: number
  }[] = []
  const vouchers: BookingVoucher[] = []
  const addSlot = (pid: string, day: string, quantity: number, suffix = '') => {
    const item = productById(pid)!
    slots.push({
      key: `${pid}:${day}:${suffix}`,
      productId: pid,
      day,
      quantity,
      capacity: item.capacity,
    })
  }
  const addVoucher = (
    pid: string,
    date: string,
    quantity: number,
    endDate?: string
  ) => {
    const item = productById(pid)!
    vouchers.push({
      id: `V-${randomUUID()}`,
      productId: pid,
      title: item.name,
      category: item.category,
      date,
      endDate,
      quantity,
      checkedIn: false,
    })
  }
  if (product.destinationIds) {
    addSlot(product.id, draft.date, draft.quantity)
    product.destinationIds.forEach((pid, index) => {
      const day = addDays(
        draft.date,
        Math.min(index, (product.durationDays ?? 1) - 1)
      )
      addSlot(pid, day, draft.quantity)
      addVoucher(pid, day, draft.quantity)
    })
  } else if (product.category === 'Hotel') {
    for (let day = draft.date; day < draft.endDate; day = addDays(day, 1))
      addSlot(product.id, day, draft.quantity)
    addVoucher(product.id, draft.date, draft.quantity, draft.endDate)
  } else {
    addSlot(
      product.id,
      draft.date,
      draft.quantity,
      product.category === 'Tiket Kapal' ? draft.departure : ''
    )
    if (product.variants) {
      const variant = product.variants.find((v) => v.id === draft.variantId)!
      slots.push({
        key: `${product.id}:${draft.date}:variant-${variant.id}`,
        productId: product.id,
        day: draft.date,
        quantity: draft.quantity,
        capacity: variant.capacity,
      })
    }
    addVoucher(product.id, draft.date, draft.quantity)
  }
  if (draft.hotelId) {
    const end = addDays(draft.date, bookingQuote(product, draft).nights)
    for (let day = draft.date; day < end; day = addDays(day, 1))
      addSlot(draft.hotelId, day, draft.rooms)
    addVoucher(draft.hotelId, draft.date, draft.rooms, end)
  }
  return { slots: slots.sort((a, b) => a.key.localeCompare(b.key)), vouchers }
}

export async function createBooking(
  user: SessionUser,
  draft: BookingDraft,
  key: string
) {
  if (user.role !== 'consumer')
    throw new HttpError(403, 'Pemesanan dilakukan melalui akun wisatawan.')
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(key))
    throw new HttpError(400, 'Kunci pemesanan tidak valid.')
  const product = productById(draft.productId)
  if (!product) throw new HttpError(404, 'Layanan tidak ditemukan.')
  const invalid = validateBooking(product, draft)
  if (invalid) throw new HttpError(400, invalid)
  const mode = paymentMode()
  if (mode === 'production' && process.env.CATALOG_APPROVED !== 'true')
    throw new HttpError(
      503,
      'Pemesanan nyata belum dibuka. Inventori dan perjanjian mitra perlu diverifikasi pengelola.'
    )
  if (mode !== 'demo' && (!process.env.MIDTRANS_SERVER_KEY || !appOrigin()))
    throw new HttpError(503, 'Pembayaran belum dikonfigurasi oleh pengelola.')
  const quote = bookingQuote(product, draft)
  const hash = createHash('sha256').update(JSON.stringify(draft)).digest('hex')
  const id = `SLQ-${randomUUID()}`
  const now = Date.now()
  const expires = now + 20 * 60000
  const { slots, vouchers } = plan(product.id, draft, id)
  const data: StoredBooking = {
    id,
    productId: product.id,
    category: product.category,
    title: product.name,
    image: product.image,
    createdAt: new Date(now).toISOString(),
    status: 'pending',
    paymentMode: mode,
    expiresAt: new Date(expires).toISOString(),
    draft,
    ...quote,
    carbon: estimateCarbon(product, draft, MARKET_PRODUCTS),
    vouchers: [],
    itinerary: [],
    voucherPlan: vouchers,
    itineraryPlan: (PRIVATE_ITINERARIES[product.id] || []).map((stop) => ({
      ...stop,
      included: stop.type === 'hotel' ? Boolean(draft.hotelId) : stop.included,
    })),
  }
  await expireBookings()
  return transaction(async (sql) => {
    const inserted = await sql.query<Row>(
      `INSERT INTO silaq_bookings(id,user_id,idempotency_key,request_hash,status,data,expires_at,created_at) VALUES($1,$2,$3,$4,'pending',$5,$6,$7) ON CONFLICT(user_id,idempotency_key) DO NOTHING RETURNING *`,
      [id, user.id, key, hash, JSON.stringify(data), expires, now]
    )
    if (!inserted.rows[0]) {
      const existing = (
        await sql.query<Row>(
          'SELECT * FROM silaq_bookings WHERE user_id=$1 AND idempotency_key=$2',
          [user.id, key]
        )
      ).rows[0]
      if (existing.request_hash !== hash)
        throw new HttpError(
          409,
          'Kunci pemesanan sudah dipakai untuk detail berbeda. Mulai pesanan baru.'
        )
      return existing
    }
    for (const slot of slots) {
      await sql.query(
        'INSERT INTO silaq_inventory(key,product_id,day,capacity) VALUES($1,$2,$3,$4) ON CONFLICT(key) DO NOTHING',
        [slot.key, slot.productId, slot.day, slot.capacity]
      )
      const reserved = await sql.query<{ key: string }>(
        'UPDATE silaq_inventory SET reserved=reserved+$2 WHERE key=$1 AND reserved+$2 <= capacity RETURNING key',
        [slot.key, slot.quantity]
      )
      if (!reserved.rows.length)
        throw new HttpError(
          409,
          `Ketersediaan ${productById(slot.productId)?.name} tidak mencukupi. Pilih tanggal atau jumlah lain.`
        )
      await sql.query(
        'INSERT INTO silaq_allocations(booking_id,inventory_key,quantity) VALUES($1,$2,$3)',
        [id, slot.key, slot.quantity]
      )
    }
    return inserted.rows[0]
  })
}

export async function getBooking(id: string, user: SessionUser) {
  const row = (
    await query<Row>('SELECT * FROM silaq_bookings WHERE id=$1', [id])
  ).rows[0]
  if (!row || (user.role === 'consumer' && row.user_id !== user.id))
    throw new HttpError(404, 'Pesanan tidak ditemukan.')
  if (
    user.role === 'admin' &&
    !row.data.voucherPlan.some((v) =>
      user.partnerProducts.includes(v.productId || '')
    )
  )
    throw new HttpError(403, 'Pesanan di luar wewenang mitra.')
  return row
}

export async function updatePayment(
  id: string,
  amount: number,
  status: string,
  mode: TravelBooking['paymentMode']
) {
  return transaction(async (sql) => {
    const row = (
      await sql.query<Row>(
        'SELECT * FROM silaq_bookings WHERE id=$1 FOR UPDATE',
        [id]
      )
    ).rows[0]
    if (!row) throw new HttpError(404, 'Pesanan tidak ditemukan.')
    if (row.data.total !== amount || row.data.paymentMode !== mode)
      throw new HttpError(
        400,
        'Nominal atau lingkungan pembayaran tidak sesuai.'
      )
    if (['settlement', 'capture'].includes(status)) {
      if (row.status === 'paid' || row.status === 'payment_review') return row
      if (row.status !== 'pending' || Number(row.expires_at) < Date.now()) {
        await releaseInventory(sql, row)
        return setStatus(sql, row, 'payment_review')
      }
      return setStatus(sql, row, 'paid')
    }
    if (status === 'refund' && row.status === 'paid') {
      await releaseInventory(sql, row)
      return setStatus(sql, row, 'cancelled')
    }
    if (status === 'partial_refund' && row.status === 'paid')
      return setStatus(sql, row, 'payment_review')
    if (
      ['deny', 'cancel', 'expire'].includes(status) &&
      row.status === 'pending'
    ) {
      await releaseInventory(sql, row)
      return setStatus(sql, row, status === 'expire' ? 'expired' : 'cancelled')
    }
    return row
  })
}

export async function demoPayment(
  user: SessionUser,
  id: string,
  success: boolean
) {
  if (paymentMode() !== 'demo')
    throw new HttpError(403, 'Simulasi pembayaran dinonaktifkan.')
  const row = await getBooking(id, user)
  if (row.user_id !== user.id)
    throw new HttpError(403, 'Pesanan bukan milik akun ini.')
  return updatePayment(
    id,
    row.data.total,
    success ? 'settlement' : 'deny',
    'demo'
  )
}

export async function checkIn(user: SessionUser, id: string, code: string) {
  if (user.role === 'consumer')
    throw new HttpError(403, 'Hanya petugas yang dapat memvalidasi voucher.')
  return transaction(async (sql) => {
    const row = (
      await sql.query<Row>(
        'SELECT * FROM silaq_bookings WHERE id=$1 FOR UPDATE',
        [id]
      )
    ).rows[0]
    if (!row || row.status !== 'paid')
      throw new HttpError(404, 'Voucher aktif tidak ditemukan.')
    const voucher = row.data.vouchers.find((v) => v.id === code)
    if (!voucher) throw new HttpError(404, 'Kode voucher tidak ditemukan.')
    if (
      user.role === 'admin' &&
      !user.partnerProducts.includes(voucher.productId || '')
    )
      throw new HttpError(403, 'Voucher ini di luar wewenang mitra.')
    if (voucher.checkedIn)
      throw new HttpError(
        409,
        'Voucher sudah digunakan. Check-in ganda ditolak.'
      )
    if (voucher.date !== todayISO())
      throw new HttpError(
        409,
        'Voucher hanya berlaku pada tanggal kunjungan / check-in.'
      )
    const data = {
      ...row.data,
      vouchers: row.data.vouchers.map((v) =>
        v.id === code ? { ...v, checkedIn: true } : v
      ),
    }
    await sql.query('UPDATE silaq_bookings SET data=$2 WHERE id=$1', [
      id,
      JSON.stringify(data),
    ])
    return `Check-in berhasil: ${voucher.title} · ${voucher.quantity} ${voucher.category === 'Hotel' ? 'kamar' : 'orang'}.`
  })
}

export async function claimPaymentCreation(id: string) {
  return transaction(async (sql) => {
    const row = (
      await sql.query<Row>(
        'SELECT * FROM silaq_bookings WHERE id=$1 FOR UPDATE',
        [id]
      )
    ).rows[0]
    if (!row || row.status !== 'pending' || row.data.paymentStarted) return null
    await sql.query('UPDATE silaq_bookings SET data=$2 WHERE id=$1', [
      id,
      JSON.stringify({ ...row.data, paymentStarted: true }),
    ])
    return row
  })
}

export async function savePaymentUrl(id: string, url: string) {
  await transaction(async (sql) => {
    const row = (
      await sql.query<Row>(
        'SELECT * FROM silaq_bookings WHERE id=$1 FOR UPDATE',
        [id]
      )
    ).rows[0]
    if (row)
      await sql.query('UPDATE silaq_bookings SET data=$2 WHERE id=$1', [
        id,
        JSON.stringify({ ...row.data, paymentUrl: url }),
      ])
  })
}
