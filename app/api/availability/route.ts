import { requireUser } from '@/lib/server/auth'
import { expireBookings } from '@/lib/server/bookings'
import { query } from '@/lib/server/db'
import { failure, HttpError, json } from '@/lib/server/http'
import { validDate, nightsBetween } from '@/lib/booking-rules'
import { addDays, MARKET_PRODUCTS, todayISO } from '@/lib/marketplace-data'

export const runtime = 'nodejs'
export async function GET(request: Request) {
  try {
    await requireUser()
    const search = new URL(request.url).searchParams
    const product = MARKET_PRODUCTS.find(
      (p) => p.id === search.get('productId')
    )
    const date = search.get('date') || ''
    const end = search.get('endDate') || ''
    const departure = search.get('departure') || ''
    if (
      !product ||
      !validDate(date) ||
      date < todayISO() ||
      date > addDays(todayISO(), 365)
    )
      throw new HttpError(400, 'Produk atau tanggal tidak valid.')
    if (
      product.category === 'Hotel' &&
      (!validDate(end) ||
        nightsBetween(date, end) < 1 ||
        nightsBetween(date, end) > 30)
    )
      throw new HttpError(400, 'Rentang menginap tidak valid.')
    if (product.departures && !product.departures.includes(departure))
      throw new HttpError(400, 'Jadwal tidak valid.')
    const slots: { key: string; capacity: number }[] = []
    const add = (pid: string, day: string, suffix = '') => {
      slots.push({
        key: `${pid}:${day}:${suffix}`,
        capacity: MARKET_PRODUCTS.find((p) => p.id === pid)!.capacity,
      })
    }
    if (product.category === 'Hotel')
      for (let day = date; day < end; day = addDays(day, 1))
        add(product.id, day)
    else
      add(product.id, date, product.category === 'Tiket Kapal' ? departure : '')
    product.destinationIds?.forEach((id, index) =>
      add(id, addDays(date, Math.min(index, (product.durationDays ?? 1) - 1)))
    )
    if (product.variants) {
      const variant = product.variants.find(
        (v) => v.id === search.get('variantId')
      )
      if (!variant) throw new HttpError(400, 'Jenis tiket tidak valid.')
      slots.push({
        key: `${product.id}:${date}:variant-${variant.id}`,
        capacity: variant.capacity,
      })
    }
    await expireBookings()
    const result = await query<{
      key: string
      capacity: number
      reserved: number
    }>(
      'SELECT key,capacity,reserved FROM silaq_inventory WHERE key=ANY($1::text[])',
      [slots.map((s) => s.key)]
    )
    const available = Math.min(
      ...slots.map((slot) => {
        const row = result.rows.find((r) => r.key === slot.key)
        return row ? row.capacity - row.reserved : slot.capacity
      })
    )
    return json({ available, checkedAt: new Date().toISOString() })
  } catch (error) {
    return failure(error)
  }
}
