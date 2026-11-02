import { loadEnvConfig } from '@next/env'
import { createUser } from '../lib/server/auth'
import { closeDatabase, ensureDatabase } from '../lib/server/db'
import { createBooking, demoPayment } from '../lib/server/bookings'
import { defaultDraft } from '../lib/booking-rules'
import { addDays, MARKET_PRODUCTS, todayISO } from '../lib/marketplace-data'
import { DEMO_ACCOUNT_EMAILS, DEMO_ACCOUNT_NAME } from '../lib/demo-accounts'
import { Role } from '../types/smart-tourism'
import { randomUUID } from 'node:crypto'

async function main() {
  loadEnvConfig(process.cwd(), true)
  if (
    process.env.CAPTURE_FIXTURE !== 'true' ||
    process.env.LOCAL_DATABASE !== 'true' ||
    process.env.VERCEL
  )
    throw new Error(
      'Fixture hanya boleh dijalankan pada database lokal khusus screenshot.'
    )
  const password = process.env.DEMO_LOGIN_PASSWORD
  if (!password)
    throw new Error('Password template screenshot belum dikonfigurasi.')
  await ensureDatabase()
  const users = []
  for (const role of ['consumer', 'admin', 'superadmin'] as Role[]) {
    users.push(
      await createUser(
        DEMO_ACCOUNT_NAME,
        DEMO_ACCOUNT_EMAILS[role],
        password,
        role,
        role === 'admin' ? MARKET_PRODUCTS.map((p) => p.id) : []
      )
    )
  }
  const buyer = users[0]
  for (const [id, quantity, hotel, pay] of [
    ['bundle-utara', 2, 'hotel-senaru', true],
    ['hotel-kuta', 1, '', true],
    ['boat-padangbai', 2, '', true],
    ['bundle-selatan', 2, '', false],
  ] as const) {
    const product = MARKET_PRODUCTS.find((p) => p.id === id)!
    const draft = {
      ...defaultDraft(product, addDays(todayISO(), 1)),
      customerName: DEMO_ACCOUNT_NAME,
      email: DEMO_ACCOUNT_EMAILS.consumer,
      phone: '081234567890',
      quantity,
      hotelId: hotel,
    }
    const order = await createBooking(buyer, draft, randomUUID())
    if (pay) await demoPayment(buyer, order.id, true)
  }
  console.log(
    'Fixture screenshot siap: 3 akun Gilang, 3 pesanan lunas, 1 pesanan menunggu.'
  )
}
main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => closeDatabase())
