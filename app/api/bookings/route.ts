import { requireUser, rateLimit } from '@/lib/server/auth'
import {
  bookingRows,
  createBooking,
  getBooking,
  visibleBooking,
} from '@/lib/server/bookings'
import { body, failure, HttpError, json, sameOrigin } from '@/lib/server/http'
import { initializePayment } from '@/lib/server/payments'
import { parseDraft } from '@/lib/booking-rules'

export const runtime = 'nodejs'
export const maxDuration = 30
export async function GET() {
  try {
    const user = await requireUser()
    return json({
      bookings: (await bookingRows(user)).map((row) =>
        visibleBooking(row, user)
      ),
    })
  } catch (error) {
    return failure(error)
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const user = await requireUser()
    await rateLimit(`booking:${user.id}`, 40, 60)
    const data = await body(request)
    let draft
    try {
      draft = parseDraft(data.draft)
    } catch (error) {
      throw new HttpError(
        400,
        error instanceof Error ? error.message : 'Data tidak valid.'
      )
    }
    const row = await createBooking(
      user,
      draft,
      request.headers.get('Idempotency-Key') || ''
    )
    const order = visibleBooking(row, user)
    await initializePayment(order)
    return json(
      { booking: visibleBooking(await getBooking(row.id, user), user) },
      201
    )
  } catch (error) {
    return failure(error)
  }
}
