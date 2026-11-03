import {
  BookingDraft,
  CarbonEstimate,
  CarbonLeg,
  CarbonTransport,
  CarbonTravelInput,
  MarketProduct,
  TravelBooking,
} from '@/types/marketplace'

// Coarse area centres, not navigation pins. Road lengths are indicative only:
// Haversine between area centres x 1.35. Sea lengths use straight-line distance.
// No external routing service receives a visitor's coordinates.
type Point = {
  id: string
  label: string
  lat: number
  lng: number
  island?: 'bali'
}
export const CARBON_ORIGINS: Point[] = [
  { id: 'airport', label: 'Bandara Lombok', lat: -8.757, lng: 116.277 },
  { id: 'mataram', label: 'Pusat Mataram', lat: -8.584, lng: 116.117 },
  { id: 'senggigi', label: 'Kawasan Senggigi', lat: -8.499, lng: 116.048 },
  { id: 'kuta', label: 'Kawasan Kuta Mandalika', lat: -8.891, lng: 116.278 },
  { id: 'bangsal', label: 'Pelabuhan Bangsal', lat: -8.393, lng: 116.099 },
  { id: 'lembar', label: 'Pelabuhan Lembar', lat: -8.731, lng: 116.074 },
  { id: 'senaru', label: 'Kawasan Senaru', lat: -8.294, lng: 116.405 },
  { id: 'sembalun', label: 'Kawasan Sembalun', lat: -8.362, lng: 116.533 },
  {
    id: 'padangbai',
    label: 'Pelabuhan Padangbai (Bali)',
    lat: -8.533,
    lng: 115.508,
    island: 'bali',
  },
]

export const CARBON_MODES: {
  id: CarbonTransport
  label: string
  capacity: number
}[] = [
  { id: 'car', label: 'Mobil bensin', capacity: 4 },
  { id: 'motorbike', label: 'Motor bensin', capacity: 2 },
  { id: 'coach', label: 'Bus / coach bersama', capacity: 1 },
  { id: 'walk', label: 'Jalan kaki / sepeda', capacity: 1 },
]

export const CARBON_FACTOR_SOURCE =
  'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'
// DESNZ 2026 revised July flat file; operational factors, no upstream fuel.
// 25_301_3070_4_1 average petrol car; 25_302_3077_4_1 small motorbike;
// 25_314_3146_11_1 coach; 23_318_3188_11_1 ferry foot passenger;
// 29_600_4021_13_1 Indonesia hotel room/night. UK transport factors are proxies,
// not verified measurements of Lombok operators. Fast boats have no factor.
export const CARBON_FACTORS = {
  car: 0.16152,
  motorbike: 0.08319,
  coach: 0.03948,
  ferry: 0.01871,
  hotel: 62.7,
} as const

const locations: Record<string, [number, number]> = {
  'dest-gili': [-8.354, 116.043],
  'dest-rinjani': [-8.362, 116.533],
  'dest-mandalika': [-8.891, 116.278],
  'dest-sade': [-8.839, 116.291],
  'dest-sendanggile': [-8.313, 116.408],
  'dest-giliair': [-8.36, 116.083],
  'dest-gilimeno': [-8.352, 116.058],
  'dest-gilinanggu': [-8.72, 116.009],
  'dest-tanjungaan': [-8.91, 116.321],
  'dest-senggigi': [-8.499, 116.048],
  'dest-batupayung': [-8.916, 116.329],
  'dest-pinkbeach': [-8.856, 116.562],
  'dest-sukarara': [-8.693, 116.212],
  'dest-batubolong': [-8.512, 116.054],
  'dest-tiupupus': [-8.289, 116.27],
  'dest-selongbelanak': [-8.873, 116.167],
  'dest-mawun': [-8.899, 116.224],
  'dest-benangkelambu': [-8.533, 116.341],
  'dest-bukitselong': [-8.365, 116.54],
  'dest-purameru': [-8.588, 116.13],
  'dest-tamannarmada': [-8.595, 116.203],
  'dest-gilisudak': [-8.728, 116.025],
  'dest-gilikondo': [-8.401, 116.731],
  'dest-pantaisire': [-8.361, 116.123],
  'hotel-kuta': [-8.891, 116.278],
  'hotel-senaru': [-8.294, 116.405],
  'hotel-senggigi': [-8.499, 116.048],
}
const islandPorts: Record<string, [number, number]> = {
  'dest-gili': [-8.393, 116.099],
  'dest-giliair': [-8.393, 116.099],
  'dest-gilimeno': [-8.393, 116.099],
  'dest-gilinanggu': [-8.758, 116.014],
  'dest-gilisudak': [-8.758, 116.014],
  'dest-gilikondo': [-8.408, 116.704],
}
const boatRoutes: Record<
  string,
  [string, [number, number], string, [number, number]]
> = {
  'boat-gili': [
    'Pelabuhan Bangsal',
    [-8.393, 116.099],
    'Gili Trawangan',
    [-8.354, 116.043],
  ],
  'boat-padangbai': [
    'Pelabuhan Padangbai',
    [-8.533, 115.508],
    'Pelabuhan Bangsal',
    [-8.393, 116.099],
  ],
  'boat-lembar': [
    'Pelabuhan Padangbai',
    [-8.533, 115.508],
    'Pelabuhan Lembar',
    [-8.731, 116.074],
  ],
}
const round = (n: number) => Math.round(n * 100) / 100
export const carbonNumber = (n: number) =>
  n.toLocaleString('id-ID', { maximumFractionDigits: 1 })

export function distanceKm(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180
  const h =
    Math.sin(((b[0] - a[0]) * rad) / 2) ** 2 +
    Math.cos(a[0] * rad) *
      Math.cos(b[0] * rad) *
      Math.sin(((b[1] - a[1]) * rad) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))))
}

export function nearestCarbonOrigin(lat: number, lng: number) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  )
    return null
  const closest = CARBON_ORIGINS.map((origin) => ({
    origin,
    distance: distanceKm([lat, lng], [origin.lat, origin.lng]),
  })).sort((a, b) => a.distance - b.distance)[0]
  return closest.distance <= 35 ? closest.origin : null
}

export function parseCarbonTravel(value: unknown): CarbonTravelInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Pilihan perjalanan tidak valid.')
  const input = value as Record<string, unknown>
  if (
    typeof input.originId !== 'string' ||
    (input.originId !== '' &&
      !CARBON_ORIGINS.some((o) => o.id === input.originId))
  )
    throw new Error('Pilih titik keberangkatan yang tersedia.')
  const mode = CARBON_MODES.find((m) => m.id === input.mode)
  if (
    !mode ||
    !Number.isInteger(input.occupants) ||
    (input.occupants as number) < 1 ||
    (input.occupants as number) > mode.capacity
  )
    throw new Error(
      'Pilihan kendaraan atau jumlah orang per kendaraan tidak valid.'
    )
  if (typeof input.returnToOrigin !== 'boolean')
    throw new Error('Pilihan perjalanan pulang tidak valid.')
  return {
    originId: input.originId,
    mode: mode.id,
    occupants: input.occupants as number,
    returnToOrigin: input.returnToOrigin,
  }
}

export function estimateCarbon(
  product: MarketProduct,
  draft: BookingDraft,
  products: MarketProduct[]
): CarbonEstimate {
  const travel = draft.travel ? parseCarbonTravel(draft.travel) : null
  const origin = CARBON_ORIGINS.find((o) => o.id === travel?.originId)
  const legs: CarbonLeg[] = []
  const missing: string[] = [
    'Penerbangan, makanan, dan aktivitas di lokasi belum dihitung.',
  ]
  let last: [number, number] | undefined = origin && [origin.lat, origin.lng]
  let lastLabel = origin?.label ?? ''
  let seaUnknown = false
  const leg = (
    to: [number, number],
    toLabel: string,
    mode: 'road' | 'sea' = 'road'
  ) => {
    if (last)
      legs.push({
        from: lastLabel,
        to: toLabel,
        distanceKm: round(distanceKm(last, to) * (mode === 'road' ? 1.35 : 1)),
        mode,
      })
    last = to
    lastLabel = toLabel
  }
  const boat = boatRoutes[product.id]
  // A Lombok departure cannot be connected to Bali by an invented road leg.
  const originCompatible =
    !origin ||
    (boat
      ? product.id === 'boat-gili'
        ? !origin.island
        : origin.island === 'bali'
      : !origin.island)
  if (!originCompatible) {
    last = undefined
    lastLabel = ''
    missing.push('Akses dari titik keberangkatan lintas pulau belum dihitung.')
  }
  if (!origin)
    missing.push(
      'Perjalanan menuju titik awal belum dihitung; pilih titik keberangkatan saat memesan.'
    )
  if (boat) {
    leg(boat[1], boat[0])
    leg(boat[3], boat[2], 'sea')
    seaUnknown = product.id !== 'boat-lembar'
  } else {
    for (const id of product.destinationIds ?? [product.id]) {
      const point = locations[id]
      const place = products.find((p) => p.id === id)
      if (!point || !place) {
        missing.push('Sebagian titik rute belum tersedia.')
        continue
      }
      const port = islandPorts[id]
      if (port) {
        leg(port, 'Dermaga akses pulau')
        leg(point, place.name, 'sea')
        leg(port, 'Dermaga akses pulau', 'sea')
        seaUnknown = true
      } else leg(point, place.name)
    }
    if (draft.hotelId && locations[draft.hotelId])
      leg(
        locations[draft.hotelId],
        products.find((p) => p.id === draft.hotelId)?.name ?? 'Hotel'
      )
  }
  // The boat ticket is one-way. Only its road access may be configured here.
  if (!boat && origin && originCompatible && travel?.returnToOrigin)
    leg([origin.lat, origin.lng], origin.label)
  const roadKm = round(
    legs.filter((l) => l.mode === 'road').reduce((n, l) => n + l.distanceKm, 0)
  )
  const seaKm = round(
    legs.filter((l) => l.mode === 'sea').reduce((n, l) => n + l.distanceKm, 0)
  )
  const people =
    product.category === 'Hotel' ? draft.quantity * 2 : draft.quantity
  const occupants = travel?.occupants ?? 1
  let roadKg = 0
  if (roadKm > 0) {
    if (!travel) missing.push('Moda transportasi darat belum dipilih.')
    else if (travel.mode === 'coach')
      roadKg = roadKm * CARBON_FACTORS.coach * people
    else if (travel.mode !== 'walk')
      roadKg =
        roadKm * CARBON_FACTORS[travel.mode] * Math.ceil(people / occupants)
  }
  if (seaUnknown)
    missing.push(
      'Emisi kapal cepat / kapal lokal menunggu data operator; jarak laut tetap ditampilkan.'
    )
  const seaKg =
    product.id === 'boat-lembar' ? seaKm * CARBON_FACTORS.ferry * people : 0
  const requestedNights = Math.round(
    (Date.parse(draft.endDate) - Date.parse(draft.date)) / 86400000
  )
  const nights =
    product.category === 'Hotel'
      ? Number.isFinite(requestedNights)
        ? Math.max(0, requestedNights)
        : 0
      : Math.max(1, (product.durationDays ?? 1) - 1)
  const rooms =
    product.category === 'Hotel'
      ? draft.quantity
      : draft.hotelId
        ? draft.rooms
        : 0
  const accommodationKg = round(rooms * nights * CARBON_FACTORS.hotel)
  const transportKg = round(roadKg + seaKg)
  return {
    version: 'silaq-distance-v1',
    originLabel: origin?.label ?? null,
    mode: travel?.mode ?? null,
    occupants,
    people,
    legs,
    roadKm,
    seaKm,
    distanceKm: round(roadKm + seaKm),
    transportKg,
    accommodationKg,
    totalKg: round(transportKg + accommodationKg),
    missing: Array.from(new Set(missing)),
  }
}

export function summarizeCarbon(
  bookings: TravelBooking[],
  products: MarketProduct[]
) {
  // Only settled orders contribute. Pending previews are shown separately.
  const orders = bookings
    .filter((b) => b.status === 'paid')
    .flatMap((booking) => {
      const product = products.find((p) => p.id === booking.productId)
      return product
        ? [
            {
              booking,
              estimate:
                booking.carbon ??
                estimateCarbon(product, booking.draft, products),
            },
          ]
        : []
    })
  return {
    orders,
    totalKg: round(orders.reduce((n, o) => n + o.estimate.totalKg, 0)),
    distanceKm: round(orders.reduce((n, o) => n + o.estimate.distanceKm, 0)),
    transportKg: round(orders.reduce((n, o) => n + o.estimate.transportKg, 0)),
    accommodationKg: round(
      orders.reduce((n, o) => n + o.estimate.accommodationKg, 0)
    ),
  }
}
