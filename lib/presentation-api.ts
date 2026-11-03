import { SessionUser } from '@/types/auth'
import { estimateCarbon } from './carbon'
import {
  BookingDraft,
  BookingVoucher,
  ItineraryStop,
  MarketProduct,
  TravelBooking,
} from '@/types/marketplace'
import {
  DEFAULT_DEMO_LOGIN_TEMPLATE,
  DEMO_ACCOUNT_EMAILS,
  DEMO_ACCOUNT_NAME,
} from './demo-accounts'
import {
  addDays,
  CULINARY_PLACES,
  HOTELS,
  MARKET_PRODUCTS,
  todayISO,
} from './marketplace-data'
import {
  bookingQuote,
  defaultDraft,
  nightsBetween,
  parseDraft,
  validDate,
  validateBooking,
} from './booking-rules'

const STORE = 'silaq.presentation.v1'
const SESSION = 'silaq.presentation.session.v1'
type Account = { user: SessionUser; salt: string; passwordHash: string }
type Order = {
  userId: string
  key: string
  fingerprint: string
  booking: TravelBooking
}
type State = { version: 1; accounts: Account[]; orders: Order[] }
const presets: SessionUser[] = (
  ['consumer', 'admin', 'superadmin'] as const
).map((role) => ({
  id: `presentation-${role}`,
  name: DEMO_ACCOUNT_NAME,
  email: DEMO_ACCOUNT_EMAILS[role],
  role,
  partnerProducts:
    role === 'admin' ? MARKET_PRODUCTS.map((product) => product.id) : [],
}))
const productById = (id: string) =>
  MARKET_PRODUCTS.find((product) => product.id === id)
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

function read(): State {
  try {
    const saved = localStorage.getItem(STORE)
    if (!saved) return { version: 1, accounts: [], orders: [] }
    const data = JSON.parse(saved) as State
    if (
      data.version !== 1 ||
      !Array.isArray(data.accounts) ||
      !Array.isArray(data.orders)
    )
      throw new Error()
    return data
  } catch {
    throw new Error(
      'Penyimpanan demo tidak dapat dibaca. Izinkan penyimpanan situs pada browser ini.'
    )
  }
}
function save(data: State) {
  try {
    localStorage.setItem(STORE, JSON.stringify(data))
  } catch {
    throw new Error(
      'Data demo tidak dapat disimpan. Periksa ruang dan izin penyimpanan browser.'
    )
  }
}
function currentUser(data: State) {
  const id = sessionStorage.getItem(SESSION)
  return (
    presets.find((user) => user.id === id) ??
    data.accounts.find((account) => account.user.id === id)?.user ??
    null
  )
}
function requireUser(data: State) {
  const user = currentUser(data)
  if (!user) throw new Error('Silakan masuk kembali.')
  return user
}
async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bytes = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 100000,
      salt: new TextEncoder().encode(salt),
    },
    key,
    256
  )
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

type Slot = { key: string; quantity: number; capacity: number }
function allocations(product: MarketProduct, draft: BookingDraft): Slot[] {
  const slots: Slot[] = []
  const add = (
    id: string,
    date: string,
    quantity: number,
    suffix = '',
    capacity = productById(id)!.capacity
  ) => slots.push({ key: `${id}:${date}:${suffix}`, quantity, capacity })
  if (product.category === 'Hotel') {
    for (let day = draft.date; day < draft.endDate; day = addDays(day, 1))
      add(product.id, day, draft.quantity)
  } else {
    add(
      product.id,
      draft.date,
      draft.quantity,
      product.category === 'Tiket Kapal' ? draft.departure : ''
    )
    product.destinationIds?.forEach((id, index) =>
      add(
        id,
        addDays(draft.date, Math.min(index, (product.durationDays ?? 1) - 1)),
        draft.quantity
      )
    )
    const variant = product.variants?.find(
      (item) => item.id === draft.variantId
    )
    if (variant)
      add(
        product.id,
        draft.date,
        draft.quantity,
        `variant-${variant.id}`,
        variant.capacity
      )
  }
  if (draft.hotelId) {
    const end = addDays(draft.date, bookingQuote(product, draft).nights)
    for (let day = draft.date; day < end; day = addDays(day, 1))
      add(draft.hotelId, day, draft.rooms)
  }
  return slots
}
function remaining(data: State, slots: Slot[]) {
  const used = new Map<string, number>()
  for (const order of data.orders) {
    if (!['pending', 'paid'].includes(order.booking.status)) continue
    const product = productById(order.booking.productId)
    if (product)
      for (const slot of allocations(product, order.booking.draft))
        used.set(slot.key, (used.get(slot.key) || 0) + slot.quantity)
  }
  return Math.min(
    ...slots.map((slot) => slot.capacity - (used.get(slot.key) || 0))
  )
}
function issueTickets(booking: TravelBooking) {
  const product = productById(booking.productId)!
  const draft = booking.draft
  const vouchers: BookingVoucher[] = []
  const add = (
    id: string,
    date: string,
    quantity: number,
    endDate?: string
  ) => {
    const item = productById(id)!
    vouchers.push({
      id: `V-${crypto.randomUUID()}`,
      productId: id,
      category: item.category,
      title: item.name,
      date,
      endDate,
      quantity,
      checkedIn: false,
    })
  }
  if (product.destinationIds)
    product.destinationIds.forEach((id, index) =>
      add(
        id,
        addDays(draft.date, Math.min(index, (product.durationDays ?? 1) - 1)),
        draft.quantity
      )
    )
  else
    add(
      product.id,
      draft.date,
      draft.quantity,
      product.category === 'Hotel' ? draft.endDate : undefined
    )
  if (draft.hotelId)
    add(
      draft.hotelId,
      draft.date,
      draft.rooms,
      addDays(draft.date, bookingQuote(product, draft).nights)
    )
  const itinerary: ItineraryStop[] = []
  // Illustrative presentation schedule, separate from the real server itinerary.
  product.destinationIds?.forEach((id, index) => {
    const place = productById(id)!
    const day = Math.min(index, (product.durationDays ?? 1) - 1) + 1
    itinerary.push({
      day,
      time: day > 1 ? '09:00' : ['09:00', '13:30', '16:00'][index] || '16:00',
      title: place.name,
      address: place.address,
      description:
        'Saran kunjungan mandiri. Tunjukkan voucher kawasan saat kedatangan. Jadwal ini merupakan contoh presentasi.',
      type: 'wisata',
      included: true,
    })
  })
  const food = CULINARY_PLACES.find((place) =>
    product.culinaryIds?.includes(place.id)
  )
  if (food)
    itinerary.push({
      day: 1,
      time: '12:00',
      title: food.name,
      address: food.address,
      description:
        'Saran singgah kuliner. Makanan dipilih dan dibayar langsung di tempat, di luar harga paket.',
      type: 'kuliner',
      included: false,
    })
  const hotel = HOTELS.find((place) => place.id === product.hotelId)
  if (hotel)
    itinerary.push({
      day: 1,
      time: (product.durationDays ?? 1) > 1 ? '14:00' : '18:00',
      title: hotel.name,
      address: hotel.address,
      description: draft.hotelId
        ? 'Hotel ditambahkan dalam pesanan demo ini.'
        : 'Pilihan menginap opsional. Hotel belum dipesan dan biayanya terpisah.',
      type: 'hotel',
      included: Boolean(draft.hotelId),
    })
  booking.vouchers = vouchers
  booking.itinerary = itinerary.sort(
    (a, b) => a.day - b.day || a.time.localeCompare(b.time)
  )
}
function canView(order: Order, user: SessionUser) {
  return user.role === 'consumer'
    ? order.userId === user.id
    : user.role === 'superadmin' ||
        order.booking.vouchers.some((voucher) =>
          user.partnerProducts.includes(voucher.productId || '')
        ) ||
        user.partnerProducts.includes(order.booking.productId)
}
function checkIn(
  data: State,
  user: SessionUser,
  code: string,
  orderId?: string
) {
  if (user.role === 'consumer')
    throw new Error('Hanya petugas yang dapat memvalidasi voucher.')
  const order = data.orders.find(
    (item) =>
      (!orderId || item.booking.id === orderId) &&
      item.booking.status === 'paid' &&
      item.booking.vouchers.some((voucher) => voucher.id === code)
  )
  const voucher = order?.booking.vouchers.find((item) => item.id === code)
  if (!order || !voucher) throw new Error('Voucher aktif tidak ditemukan.')
  if (
    user.role === 'admin' &&
    !user.partnerProducts.includes(voucher.productId || '')
  )
    throw new Error('Voucher di luar wewenang mitra.')
  if (voucher.checkedIn)
    throw new Error('Voucher sudah digunakan. Check-in ganda ditolak.')
  if (voucher.date !== todayISO())
    throw new Error('Voucher hanya berlaku pada tanggal kunjungan / check-in.')
  voucher.checkedIn = true
  save(data)
  return {
    message: `Check-in berhasil: ${voucher.title} · ${voucher.quantity} ${voucher.category === 'Hotel' ? 'kamar' : 'orang'}.`,
  }
}

async function perform(url: string, options?: RequestInit): Promise<unknown> {
  const method = options?.method?.toUpperCase() || 'GET'
  const path = new URL(url, location.origin)
  if (path.origin !== location.origin)
    throw new Error('Alamat layanan demo tidak valid.')
  const input = options?.body ? JSON.parse(String(options.body)) : {}
  const data = read()
  let expired = false
  for (const order of data.orders) {
    if (
      order.booking.status === 'pending' &&
      Date.parse(order.booking.expiresAt || '') <= Date.now()
    ) {
      order.booking.status = 'expired'
      expired = true
    }
  }
  if (expired) save(data)
  if (path.pathname === '/api/auth') {
    if (method === 'GET') return { user: currentUser(data) }
    if (method === 'DELETE') {
      sessionStorage.removeItem(SESSION)
      return { ok: true }
    }
    if (
      method !== 'POST' ||
      typeof input.email !== 'string' ||
      typeof input.password !== 'string'
    )
      throw new Error('Data akun tidak valid.')
    const email = input.email.trim().toLowerCase()
    let user: SessionUser | undefined
    if (input.action === 'register') {
      if (
        typeof input.name !== 'string' ||
        input.name.trim().length < 3 ||
        input.name.length > 100 ||
        email.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
        throw new Error('Nama atau email tidak valid.')
      if (input.password.length < 12 || input.password.length > 128)
        throw new Error('Kata sandi harus 12–128 karakter.')
      if (
        presets.some((item) => item.email === email) ||
        data.accounts.some((item) => item.user.email === email)
      )
        throw new Error('Email sudah terdaftar. Silakan masuk.')
      user = {
        id: `presentation-${crypto.randomUUID()}`,
        name: input.name.trim(),
        email,
        role: 'consumer',
        partnerProducts: [],
      }
      const salt = crypto.randomUUID()
      data.accounts.push({
        user,
        salt,
        passwordHash: await passwordHash(input.password, salt),
      })
      save(data)
    } else if (input.action === 'login') {
      const preset = presets.find((item) => item.email === email)
      if (preset && input.password === DEFAULT_DEMO_LOGIN_TEMPLATE.password)
        user = preset
      const account = data.accounts.find((item) => item.user.email === email)
      if (
        account &&
        (await passwordHash(input.password, account.salt)) ===
          account.passwordHash
      )
        user = account.user
      if (!user) throw new Error('Email atau kata sandi tidak sesuai.')
    } else throw new Error('Aksi tidak dikenal.')
    sessionStorage.setItem(SESSION, user!.id)
    return { user }
  }
  const user = requireUser(data)
  if (path.pathname === '/api/availability' && method === 'GET') {
    const product = productById(path.searchParams.get('productId') || '')
    const date = path.searchParams.get('date') || ''
    if (
      !product ||
      !validDate(date) ||
      date < todayISO() ||
      date > addDays(todayISO(), 365)
    )
      throw new Error('Produk atau tanggal tidak valid.')
    const draft = {
      ...defaultDraft(product, date),
      endDate: path.searchParams.get('endDate') || addDays(date, 1),
      departure: path.searchParams.get('departure') || '',
      variantId: path.searchParams.get('variantId') || '',
    }
    if (
      product.category === 'Hotel' &&
      (!validDate(draft.endDate) ||
        nightsBetween(date, draft.endDate) < 1 ||
        nightsBetween(date, draft.endDate) > 30)
    )
      throw new Error('Rentang menginap tidak valid.')
    if (product.departures && !product.departures.includes(draft.departure))
      throw new Error('Jadwal tidak valid.')
    return {
      available: Math.max(0, remaining(data, allocations(product, draft))),
      checkedAt: new Date().toISOString(),
    }
  }
  if (path.pathname === '/api/vouchers/validate' && method === 'POST')
    return checkIn(data, user, input.code)
  if (path.pathname === '/api/bookings') {
    if (method === 'GET')
      return {
        bookings: data.orders
          .filter((order) => canView(order, user))
          .map((order) => clone(order.booking))
          .reverse(),
      }
    if (method === 'POST') {
      if (user.role !== 'consumer')
        throw new Error('Pemesanan dilakukan melalui akun wisatawan.')
      const draft = parseDraft(input.draft)
      const product = productById(draft.productId)
      if (!product) throw new Error('Layanan tidak ditemukan.')
      const invalid = validateBooking(product, draft)
      if (invalid) throw new Error(invalid)
      const key = new Headers(options?.headers).get('Idempotency-Key') || ''
      if (!/^[a-zA-Z0-9_-]{16,100}$/.test(key))
        throw new Error('Kunci pemesanan tidak valid.')
      const fingerprint = JSON.stringify(draft)
      const existing = data.orders.find(
        (order) => order.userId === user.id && order.key === key
      )
      if (existing) {
        if (existing.fingerprint !== fingerprint)
          throw new Error('Kunci pemesanan sudah dipakai untuk detail berbeda.')
        return { booking: clone(existing.booking) }
      }
      const slots = allocations(product, draft)
      if (slots.some((slot) => remaining(data, [slot]) < slot.quantity))
        throw new Error(
          'Ketersediaan tidak mencukupi. Pilih tanggal atau jumlah lain.'
        )
      const quote = bookingQuote(product, draft)
      const booking: TravelBooking = {
        id: `SLQ-${crypto.randomUUID()}`,
        productId: product.id,
        category: product.category,
        title: product.name,
        image: product.image,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 20 * 60000).toISOString(),
        status: 'pending',
        paymentMode: 'demo',
        draft,
        subtotal: quote.subtotal,
        hotelTotal: quote.hotelTotal,
        fee: quote.fee,
        total: quote.total,
        carbon: estimateCarbon(product, draft, MARKET_PRODUCTS),
        vouchers: [],
        itinerary: [],
      }
      data.orders.push({ userId: user.id, key, fingerprint, booking })
      save(data)
      return { booking: clone(booking) }
    }
  }
  const match = path.pathname.match(/^\/api\/bookings\/([^/]+)$/)
  if (match) {
    const order = data.orders.find(
      (item) => item.booking.id === decodeURIComponent(match[1])
    )
    if (!order || !canView(order, user))
      throw new Error('Pesanan tidak ditemukan.')
    const booking = order.booking
    if (method === 'POST' && input.action === 'checkin')
      return checkIn(data, user, input.code, booking.id)
    if (method === 'POST' && input.action === 'demo-payment') {
      if (user.role !== 'consumer' || order.userId !== user.id)
        throw new Error('Pembayaran hanya dapat dilakukan pemesan.')
      if (typeof input.success !== 'boolean')
        throw new Error('Hasil simulasi tidak valid.')
      if (booking.status !== 'paid') {
        if (booking.status !== 'pending')
          throw new Error(
            'Pesanan tidak lagi menunggu pembayaran. Buat pesanan baru.'
          )
        booking.status = input.success ? 'paid' : 'cancelled'
        if (input.success) issueTickets(booking)
        save(data)
      }
    } else if (
      method !== 'GET' &&
      !(method === 'POST' && input.action === 'refresh-payment')
    )
      throw new Error('Aksi tidak dikenal.')
    return { booking: clone(booking) }
  }
  throw new Error('Layanan demo tidak ditemukan.')
}

export async function presentationApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const run = () => perform(url, options) as Promise<T>
  return navigator.locks
    ? navigator.locks.request('silaq-presentation-state', run)
    : run()
}
