import { requireUser, rateLimit } from '@/lib/server/auth'
import {
  checkIn,
  demoPayment,
  expireBookings,
  getBooking,
  visibleBooking,
} from '@/lib/server/bookings'
import { body, failure, HttpError, json, sameOrigin } from '@/lib/server/http'
import { reconcilePayment } from '@/lib/server/payments'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }
export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireUser()
    await expireBookings()
    const { id } = await context.params
    return json({ booking: visibleBooking(await getBooking(id, user), user) })
  } catch (error) {
    return failure(error)
  }
}
export async function POST(request: Request, context: Context) {
  try {
    sameOrigin(request)
    const user = await requireUser()
    const { id } = await context.params
    const data = await body(request)
    await rateLimit(`actions:${user.id}`, 120, 15)
    if (data.action === 'checkin') {
      if (typeof data.code !== 'string')
        throw new HttpError(400, 'Kode voucher wajib diisi.')
      return json({ message: await checkIn(user, id, data.code) })
    }
    if (data.action === 'demo-payment') {
      if (typeof data.success !== 'boolean')
        throw new HttpError(400, 'Hasil simulasi tidak valid.')
      return json({
        booking: visibleBooking(
          await demoPayment(user, id, data.success),
          user
        ),
      })
    }
    if (data.action === 'refresh-payment') {
      const row = await getBooking(id, user)
      if (row.data.paymentMode !== 'demo')
        await reconcilePayment(id, row.data.paymentMode)
      await expireBookings()
      return json({ booking: visibleBooking(await getBooking(id, user), user) })
    }
    throw new HttpError(400, 'Aksi tidak dikenal.')
  } catch (error) {
    return failure(error)
  }
}
