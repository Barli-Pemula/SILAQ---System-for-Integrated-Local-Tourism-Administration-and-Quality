import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CARBON_ORIGINS,
  estimateCarbon,
  nearestCarbonOrigin,
  parseCarbonTravel,
  summarizeCarbon,
} from '../lib/carbon'
import { defaultDraft, parseDraft } from '../lib/booking-rules'
import { MARKET_PRODUCTS } from '../lib/marketplace-data'
import { TravelBooking } from '../types/marketplace'

const product = (id: string) => MARKET_PRODUCTS.find((p) => p.id === id)!
const draft = (id: string) => ({
  ...defaultDraft(product(id)),
  customerName: 'Pengujian Karbon',
  email: 'carbon@example.test',
  phone: '081234567890',
})

test('carbon input rejects malformed data and discards coordinates and client estimates', () => {
  const travel = {
    originId: 'airport',
    mode: 'car',
    occupants: 2,
    returnToOrigin: false,
  }
  const parsed = parseDraft({
    ...draft('bundle-selatan'),
    travel: {
      ...travel,
      latitude: -8.75,
      longitude: 116.27,
      distanceKm: 0,
      totalKg: -100,
    },
    carbon: { totalKg: -100 },
  })
  assert.deepEqual(parsed.travel, travel)
  assert.equal('carbon' in parsed, false)
  for (const value of [
    null,
    [],
    'airport',
    { ...travel, originId: '__proto__' },
    { ...travel, mode: '__proto__' },
    { ...travel, occupants: 0 },
    { ...travel, occupants: 5 },
    { ...travel, occupants: NaN },
    { ...travel, occupants: 1.5 },
    { ...travel, returnToOrigin: 'false' },
  ]) {
    assert.throws(() => parseCarbonTravel(value))
  }
  const legacy = draft('bundle-selatan')
  delete legacy.travel
  assert.equal(parseDraft(legacy).travel, undefined)
})

test('bundle distance includes each stop once, with optional departure and return', () => {
  const p = product('bundle-selatan')
  const d = draft(p.id)
  const base = estimateCarbon(p, d, MARKET_PRODUCTS)
  assert.equal(base.legs.length, 2)
  assert.ok(base.distanceKm > 0)
  assert.ok(base.missing.some((note) => note.includes('titik awal')))
  const outbound = estimateCarbon(
    p,
    { ...d, travel: { ...d.travel!, originId: 'airport' } },
    MARKET_PRODUCTS
  )
  assert.equal(outbound.legs.length, 3)
  assert.equal(outbound.legs[0].from, 'Bandara Lombok')
  assert.equal(outbound.legs[0].to, product('dest-sade').name)
  const roundTrip = estimateCarbon(
    p,
    {
      ...d,
      travel: { ...d.travel!, originId: 'airport', returnToOrigin: true },
    },
    MARKET_PRODUCTS
  )
  assert.equal(roundTrip.legs.length, 4)
  assert.equal(roundTrip.legs[3].to, 'Bandara Lombok')
  assert.ok(roundTrip.distanceKm > outbound.distanceKm)
})

test('sharing vehicles reduces group emissions without multiplying route distance', () => {
  const p = product('bundle-selatan')
  const d = { ...draft(p.id), quantity: 4 }
  const separate = estimateCarbon(p, d, MARKET_PRODUCTS)
  const shared = estimateCarbon(
    p,
    { ...d, travel: { ...d.travel!, occupants: 4 } },
    MARKET_PRODUCTS
  )
  assert.equal(separate.distanceKm, shared.distanceKm)
  assert.ok(shared.transportKg < separate.transportKg / 3.9)
  const walking = estimateCarbon(
    p,
    { ...d, travel: { ...d.travel!, mode: 'walk', occupants: 1 } },
    MARKET_PRODUCTS
  )
  assert.equal(walking.transportKg, 0)
  assert.ok(walking.distanceKm > 0)
})

test('hotel emissions scale by rooms and nights, and partial date input stays finite', () => {
  const p = product('hotel-kuta')
  const d = {
    ...draft(p.id),
    date: '2026-12-01',
    endDate: '2026-12-03',
    quantity: 2,
  }
  assert.equal(estimateCarbon(p, d, MARKET_PRODUCTS).accommodationKg, 250.8)
  assert.equal(
    estimateCarbon(p, { ...d, endDate: '' }, MARKET_PRODUCTS).accommodationKg,
    0
  )
  const bundle = product('bundle-utara')
  const withHotel = estimateCarbon(
    bundle,
    { ...draft(bundle.id), hotelId: 'hotel-senaru', rooms: 2 },
    MARKET_PRODUCTS
  )
  assert.equal(withHotel.accommodationKg, 125.4)
})

test('sea distances are separated from roads and unknown fast boat emissions stay disclosed', () => {
  const p = product('boat-padangbai')
  const d = draft(p.id)
  const fastBoat = estimateCarbon(
    p,
    {
      ...d,
      travel: { ...d.travel!, originId: 'airport', returnToOrigin: true },
    },
    MARKET_PRODUCTS
  )
  assert.equal(fastBoat.roadKm, 0)
  assert.ok(fastBoat.seaKm > 50)
  assert.ok(fastBoat.missing.some((note) => note.includes('lintas pulau')))
  assert.ok(fastBoat.missing.some((note) => note.includes('data operator')))
  assert.equal(fastBoat.legs.length, 1)
  const ferry = product('boat-lembar')
  const footPassenger = estimateCarbon(ferry, draft(ferry.id), MARKET_PRODUCTS)
  assert.ok(footPassenger.transportKg > 0)
  assert.ok(
    !footPassenger.missing.some((note) => note.includes('data operator'))
  )
  const island = product('dest-gili')
  const gili = estimateCarbon(
    island,
    {
      ...draft(island.id),
      travel: { ...draft(island.id).travel!, originId: 'bangsal' },
    },
    MARKET_PRODUCTS
  )
  assert.equal(gili.legs.filter((l) => l.mode === 'sea').length, 2)
})

test('geolocation only selects a nearby known area, with bounds and service-area checks', () => {
  const airport = CARBON_ORIGINS.find((o) => o.id === 'airport')!
  assert.equal(nearestCarbonOrigin(airport.lat, airport.lng)?.id, 'airport')
  assert.equal(nearestCarbonOrigin(-6.2, 106.8), null)
  assert.equal(nearestCarbonOrigin(NaN, 116), null)
  assert.equal(nearestCarbonOrigin(91, 116), null)
})

test('all catalogue entries calculate finite estimates, and totals include settled orders only', () => {
  for (const p of MARKET_PRODUCTS) {
    const estimate = estimateCarbon(p, draft(p.id), MARKET_PRODUCTS)
    assert.ok(Number.isFinite(estimate.totalKg) && estimate.totalKg >= 0, p.id)
    assert.ok(Number.isFinite(estimate.distanceKm), p.id)
  }
  const p = product('bundle-selatan')
  const d = draft(p.id)
  const carbon = estimateCarbon(p, d, MARKET_PRODUCTS)
  const base: TravelBooking = {
    id: 'paid',
    productId: p.id,
    category: p.category,
    title: p.name,
    image: p.image,
    createdAt: new Date().toISOString(),
    status: 'paid',
    draft: d,
    subtotal: 0,
    hotelTotal: 0,
    fee: 0,
    total: 0,
    vouchers: [],
    itinerary: [],
    carbon,
  }
  const summary = summarizeCarbon(
    [
      base,
      ...(['pending', 'expired', 'cancelled', 'payment_review'] as const).map(
        (status) => ({ ...base, id: status, status })
      ),
    ],
    MARKET_PRODUCTS
  )
  assert.equal(summary.orders.length, 1)
  assert.equal(summary.totalKg, carbon.totalKg)
  assert.equal(summary.distanceKm, carbon.distanceKm)
  assert.equal(summarizeCarbon([], MARKET_PRODUCTS).totalKg, 0)
  assert.equal(
    summarizeCarbon([{ ...base, carbon: undefined }], MARKET_PRODUCTS).orders
      .length,
    1
  )
})
