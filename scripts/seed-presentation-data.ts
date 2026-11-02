import { writeFile } from 'node:fs/promises'
import { presentationApi } from '../lib/presentation-api'
import { DEFAULT_DEMO_LOGIN_TEMPLATE } from '../lib/demo-accounts'
import { addDays, MARKET_PRODUCTS, todayISO } from '../lib/marketplace-data'
import { defaultDraft } from '../lib/booking-rules'
import { TravelBooking } from '../types/marketplace'

async function main() {
  if (
    !process.env.PRESENTATION_FIXTURE_PATH ||
    process.env.CAPTURE_FIXTURE !== 'true'
  )
    throw new Error(
      'Fixture presentasi memerlukan direktori screenshot sementara.'
    )
  const values = new Map<string, string>()
  const store = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
  Object.defineProperties(globalThis, {
    localStorage: { value: store, configurable: true },
    sessionStorage: { value: store, configurable: true },
    location: { value: { origin: 'http://localhost' }, configurable: true },
    navigator: { value: {}, configurable: true },
  })
  await presentationApi('/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: DEFAULT_DEMO_LOGIN_TEMPLATE.emails.consumer,
      password: DEFAULT_DEMO_LOGIN_TEMPLATE.password,
    }),
  })
  for (const [id, quantity, hotelId, pay] of [
    ['bundle-utara', 2, 'hotel-senaru', true],
    ['hotel-kuta', 1, '', true],
    ['boat-padangbai', 2, '', true],
    ['bundle-selatan', 2, '', false],
  ] as const) {
    const product = MARKET_PRODUCTS.find((item) => item.id === id)!
    const draft = {
      ...defaultDraft(product, addDays(todayISO(), 1)),
      quantity,
      hotelId,
      customerName: DEFAULT_DEMO_LOGIN_TEMPLATE.name,
      email: DEFAULT_DEMO_LOGIN_TEMPLATE.emails.consumer,
      phone: '081234567890',
    }
    const { booking } = await presentationApi<{ booking: TravelBooking }>(
      '/api/bookings',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ draft }),
      }
    )
    if (pay)
      await presentationApi(`/api/bookings/${booking.id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'demo-payment', success: true }),
      })
  }
  await writeFile(
    process.env.PRESENTATION_FIXTURE_PATH,
    values.get('silaq.presentation.v1')!
  )
  console.log(
    'Fixture presentasi siap: 3 pesanan lunas dan 1 menunggu, tanpa database.'
  )
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
