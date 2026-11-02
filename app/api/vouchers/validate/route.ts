import { requireUser, rateLimit } from '@/lib/server/auth'
import { checkIn } from '@/lib/server/bookings'
import { query } from '@/lib/server/db'
import { body, failure, HttpError, json, sameOrigin } from '@/lib/server/http'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const user = await requireUser()
    if (user.role === 'consumer')
      throw new HttpError(403, 'Hanya petugas yang dapat memvalidasi voucher.')
    await rateLimit(`validate:${user.id}`, 120, 15)
    const data = await body(request)
    if (typeof data.code !== 'string' || !/^V-[a-f0-9-]{36}$/.test(data.code))
      throw new HttpError(400, 'Format kode voucher tidak valid.')
    const row = (
      await query<{ id: string }>(
        "SELECT id FROM silaq_bookings WHERE status='paid' AND data->'vouchers' @> $1::jsonb",
        [JSON.stringify([{ id: data.code }])]
      )
    ).rows[0]
    if (!row) throw new HttpError(404, 'Voucher aktif tidak ditemukan.')
    return json({ message: await checkIn(user, row.id, data.code) })
  } catch (error) {
    return failure(error)
  }
}
