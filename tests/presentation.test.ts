import test from 'node:test'
import assert from 'node:assert/strict'
import { presentationApi } from '../lib/presentation-api'
import { presentationEnabled } from '../lib/server/presentation'
import {
  DEFAULT_DEMO_LOGIN_TEMPLATE,
  DEMO_ACCOUNT_EMAILS,
} from '../lib/demo-accounts'
import { addDays, MARKET_PRODUCTS, todayISO } from '../lib/marketplace-data'
import { defaultDraft } from '../lib/booking-rules'
import { TravelBooking } from '../types/marketplace'
import { SessionUser } from '../types/auth'

function storage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    key: (index) => Array.from(map.keys())[index] ?? null,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, String(value))
    },
    removeItem: (key) => {
      map.delete(key)
    },
    clear: () => map.clear(),
  }
}

test('presentation works without a server database', async (t) => {
  const keys = ['localStorage', 'sessionStorage', 'location', 'navigator']
  const descriptors = keys.map(
    (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const
  )
  Object.defineProperties(globalThis, {
    localStorage: { value: storage(), configurable: true },
    sessionStorage: { value: storage(), configurable: true },
    location: { value: { origin: 'https://demo.example' }, configurable: true },
    navigator: { value: {}, configurable: true },
  })
  const call = <T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ) =>
    presentationApi<T>(
      url,
      data ? { method: 'POST', body: JSON.stringify(data), headers } : undefined
    )
  const login = (role: keyof typeof DEMO_ACCOUNT_EMAILS) =>
    call<{ user: SessionUser }>('/api/auth', {
      action: 'login',
      email: DEMO_ACCOUNT_EMAILS[role],
      password: DEFAULT_DEMO_LOGIN_TEMPLATE.password,
    })
  const draft = (id: string) => ({
    ...defaultDraft(
      MARKET_PRODUCTS.find((product) => product.id === id)!,
      todayISO()
    ),
    customerName: 'Gilang Khaerul Afan',
    email: DEMO_ACCOUNT_EMAILS.consumer,
    phone: '081234567890',
  })
  const create = (id: string) =>
    call<{ booking: TravelBooking }>(
      '/api/bookings',
      { draft: draft(id) },
      { 'Idempotency-Key': crypto.randomUUID() }
    )
  const settle = (id: string, success = true) =>
    call<{ booking: TravelBooking }>(`/api/bookings/${id}`, {
      action: 'demo-payment',
      success,
    })
  let paid: TravelBooking
  try {
    await t.test(
      'all Gilang roles login automatically and logout clears the session',
      async () => {
        for (const role of ['consumer', 'admin', 'superadmin'] as const) {
          const result = await login(role)
          assert.equal(result.user.role, role)
          assert.equal(result.user.name, 'Gilang Khaerul Afan')
          assert.equal(
            (await call<{ user: SessionUser }>('/api/auth')).user.id,
            result.user.id
          )
          await presentationApi('/api/auth', { method: 'DELETE' })
        }
        assert.equal((await call<{ user: null }>('/api/auth')).user, null)
        await assert.rejects(
          () =>
            call('/api/auth', {
              action: 'login',
              email: DEMO_ACCOUNT_EMAILS.admin,
              password: 'wrong-password',
            }),
          /tidak sesuai/
        )
        await assert.rejects(() => call('/api/bookings'), /masuk kembali/)
      }
    )
    await t.test(
      'new accounts are consumers and passwords are not stored as plaintext',
      async () => {
        const password = 'Example-password-123'
        const result = await call<{ user: SessionUser }>('/api/auth', {
          action: 'register',
          name: 'Akun Lain',
          email: 'other@example.test',
          password,
          role: 'superadmin',
        })
        assert.equal(result.user.role, 'consumer')
        assert(
          !localStorage.getItem('silaq.presentation.v1')!.includes(password)
        )
      }
    )
    await t.test(
      'bundle checkout recomputes price and hides tickets until payment succeeds',
      async () => {
        await login('consumer')
        const bundle = {
          ...draft('bundle-utara'),
          quantity: 2,
          hotelId: 'hotel-senaru',
          travel: { originId: 'bangsal', mode: 'car', occupants: 2, returnToOrigin: true },
        }
        const key = crypto.randomUUID()
        const first = await call<{ booking: TravelBooking }>(
          '/api/bookings',
          { draft: bundle, total: 1 },
          { 'Idempotency-Key': key }
        )
        assert.equal(first.booking.total, 535000)
        assert.equal(first.booking.carbon!.originLabel, 'Pelabuhan Bangsal')
        assert.ok(first.booking.carbon!.distanceKm > 0)
        assert.equal(first.booking.carbon!.accommodationKg, 62.7)
        assert.deepEqual(first.booking.vouchers, [])
        assert.deepEqual(first.booking.itinerary, [])
        assert.equal(
          (
            await call<{ booking: TravelBooking }>(
              '/api/bookings',
              { draft: bundle },
              { 'Idempotency-Key': key }
            )
          ).booking.id,
          first.booking.id
        )
        await assert.rejects(
          () =>
            call(
              '/api/bookings',
              { draft: { ...bundle, quantity: 3, rooms: 2 } },
              { 'Idempotency-Key': key }
            ),
          /detail berbeda/
        )
        paid = (await settle(first.booking.id)).booking
        assert.equal(paid.status, 'paid')
        assert.deepEqual(paid.carbon, first.booking.carbon)
        assert.equal(paid.vouchers.length, 3)
        assert(paid.itinerary.find((stop) => stop.type === 'hotel')!.included)
        assert(
          !paid.itinerary.find((stop) => stop.type === 'kuliner')!.included
        )
        assert.deepEqual(
          (await settle(first.booking.id)).booking.vouchers,
          paid.vouchers
        )
      }
    )
    await t.test(
      'failed payments have no QR tickets and reservations expire',
      async () => {
        const failed = await create('hotel-kuta')
        assert.equal(
          (await settle(failed.booking.id, false)).booking.status,
          'cancelled'
        )
        assert.deepEqual(
          (
            await call<{ booking: TravelBooking }>(
              `/api/bookings/${failed.booking.id}`
            )
          ).booking.vouchers,
          []
        )
        const pending = await create('boat-gili')
        const data = JSON.parse(localStorage.getItem('silaq.presentation.v1')!)
        data.orders.find(
          (order: { booking: TravelBooking }) =>
            order.booking.id === pending.booking.id
        ).booking.expiresAt = '2000-01-01T00:00:00.000Z'
        localStorage.setItem('silaq.presentation.v1', JSON.stringify(data))
        assert.equal(
          (
            await call<{ booking: TravelBooking }>(
              `/api/bookings/${pending.booking.id}`
            )
          ).booking.status,
          'expired'
        )
      }
    )
    await t.test(
      'hotel, boat, destination and bundle tickets have distinct persistent QR codes',
      async () => {
        const codes = paid.vouchers.map((voucher) => voucher.id)
        for (const id of [
          'hotel-kuta',
          'boat-gili',
          'dest-sade',
          'bundle-selatan',
        ]) {
          const first = (await settle((await create(id)).booking.id)).booking
          const second = (await settle((await create(id)).booking.id)).booking
          codes.push(
            ...first.vouchers.map((voucher) => voucher.id),
            ...second.vouchers.map((voucher) => voucher.id)
          )
          assert.deepEqual(
            (
              await call<{ booking: TravelBooking }>(
                `/api/bookings/${first.id}`
              )
            ).booking.vouchers,
            first.vouchers
          )
        }
        assert.equal(codes.length, new Set(codes).size)
      }
    )
    await t.test(
      'consumer accounts see only their orders; demo operators can validate once',
      async () => {
        await call('/api/auth', {
          action: 'login',
          email: 'other@example.test',
          password: 'Example-password-123',
        })
        assert.deepEqual(
          (await call<{ bookings: TravelBooking[] }>('/api/bookings')).bookings,
          []
        )
        await assert.rejects(
          () => call(`/api/bookings/${paid.id}`),
          /tidak ditemukan/
        )
        await login('admin')
        assert(
          (
            await call<{ bookings: TravelBooking[] }>('/api/bookings')
          ).bookings.some((booking) => booking.id === paid.id)
        )
        const voucher = paid.vouchers[0]
        assert.match(
          (
            await call<{ message: string }>('/api/vouchers/validate', {
              code: voucher.id,
            })
          ).message,
          /Check-in berhasil/
        )
        await assert.rejects(
          () => call('/api/vouchers/validate', { code: voucher.id }),
          /sudah digunakan/
        )
        const future = paid.vouchers.find(
          (item) => item.date === addDays(todayISO(), 1)
        )!
        await assert.rejects(
          () => call('/api/vouchers/validate', { code: future.id }),
          /tanggal kunjungan/
        )
        await login('superadmin')
        assert(
          (await call<{ bookings: TravelBooking[] }>('/api/bookings')).bookings
            .length > 0
        )
        await login('consumer')
        assert(
          (
            await call<{ bookings: TravelBooking[] }>('/api/bookings')
          ).bookings.find((booking) => booking.id === paid.id)!.vouchers[0]
            .checkedIn
        )
      }
    )
  } finally {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
})

test('presentation never silently replaces a configured production service', () => {
  const keys = [
    'PRESENTATION_MODE',
    'DATABASE_URL',
    'LOCAL_DATABASE',
    'VERCEL',
    'MIDTRANS_SERVER_KEY',
    'PAYMENT_MODE',
    'CATALOG_APPROVED',
  ] as const
  const values = keys.map((key) => [key, process.env[key]] as const)
  try {
    keys.forEach((key) => delete process.env[key])
    assert(presentationEnabled())
    process.env.DATABASE_URL = 'postgresql://example'
    assert(!presentationEnabled())
    process.env.PRESENTATION_MODE = 'true'
    assert(presentationEnabled())
    process.env.PAYMENT_MODE = 'production'
    assert(!presentationEnabled())
    delete process.env.PAYMENT_MODE
    process.env.CATALOG_APPROVED = 'true'
    assert(!presentationEnabled())
    delete process.env.CATALOG_APPROVED
    process.env.PRESENTATION_MODE = 'false'
    assert(!presentationEnabled())
  } finally {
    for (const [key, value] of values) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
