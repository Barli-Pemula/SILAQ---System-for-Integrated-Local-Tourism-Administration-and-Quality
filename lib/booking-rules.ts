import { BookingDraft, MarketProduct } from '@/types/marketplace'
import { addDays, HOTELS, todayISO } from './marketplace-data'
import { parseCarbonTravel } from './carbon'

export const nightsBetween = (start: string, end: string) =>
  Math.round(
    (Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) /
      86400000
  )

export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  )
}

export function defaultDraft(
  product: MarketProduct,
  date = addDays(todayISO(), 1)
): BookingDraft {
  return {
    productId: product.id,
    variantId: product.variants?.[0]?.id ?? '',
    date,
    endDate: addDays(date, 1),
    quantity: 1,
    departure: product.departures?.[0] ?? '',
    hotelId: '',
    rooms: 1,
    customerName: '',
    email: '',
    phone: '',
    paymentMethod: 'QRIS',
    travel: { originId: '', mode: 'car', occupants: 1, returnToOrigin: false },
  }
}

export function bookingQuote(product: MarketProduct, draft: BookingDraft) {
  const requested = nightsBetween(draft.date, draft.endDate)
  const nights =
    product.category === 'Hotel'
      ? Number.isFinite(requested)
        ? Math.max(0, requested)
        : 0
      : Math.max(1, (product.durationDays ?? 1) - 1)
  const unitPrice =
    product.variants?.find((v) => v.id === draft.variantId)?.price ??
    product.price
  const subtotal =
    unitPrice * draft.quantity * (product.category === 'Hotel' ? nights : 1)
  const hotel = HOTELS.find((h) => h.id === draft.hotelId)
  const hotelTotal =
    product.category === 'Paket Wisata' && hotel
      ? hotel.price * draft.rooms * nights
      : 0
  return {
    subtotal,
    hotelTotal,
    nights,
    fee: 5000,
    total: subtotal + hotelTotal + 5000,
  }
}

export function validateBooking(
  product: MarketProduct,
  draft: BookingDraft
): string | null {
  if (draft.productId !== product.id) return 'Produk pemesanan tidak sesuai.'
  if (
    !validDate(draft.date) ||
    draft.date < todayISO() ||
    draft.date > addDays(todayISO(), 365)
  )
    return 'Pilih tanggal antara hari ini dan 365 hari ke depan.'
  if (
    !Number.isInteger(draft.quantity) ||
    draft.quantity < 1 ||
    draft.quantity > 10
  )
    return 'Jumlah pemesanan harus antara 1 dan 10.'
  if (
    product.variants &&
    !product.variants.some((v) => v.id === draft.variantId)
  )
    return 'Pilih jenis tiket yang tersedia.'
  if (
    product.category === 'Hotel' &&
    (!validDate(draft.endDate) ||
      nightsBetween(draft.date, draft.endDate) < 1 ||
      nightsBetween(draft.date, draft.endDate) > 30)
  )
    return 'Tanggal check-out harus 1–30 malam setelah check-in.'
  if (product.departures && !product.departures.includes(draft.departure))
    return 'Pilih jam keberangkatan kapal.'
  if (draft.hotelId) {
    if (
      product.category !== 'Paket Wisata' ||
      draft.hotelId !== product.hotelId ||
      !HOTELS.some((h) => h.id === draft.hotelId)
    )
      return 'Pilihan hotel tidak tersedia untuk paket ini.'
    if (
      !Number.isInteger(draft.rooms) ||
      draft.rooms < Math.ceil(draft.quantity / 2) ||
      draft.rooms > 5
    )
      return 'Pilih kamar yang cukup untuk seluruh peserta (2 tamu per kamar).'
  }
  if (draft.customerName.trim().length < 3 || draft.customerName.length > 100)
    return 'Nama pemesan harus 3–100 karakter.'
  if (
    draft.email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
  )
    return 'Masukkan alamat email yang valid.'
  if (
    !/^\+?[\d\s()-]{8,20}$/.test(draft.phone.trim()) ||
    draft.phone.replace(/\D/g, '').length < 8
  )
    return 'Masukkan nomor telepon yang valid.'
  if (!['QRIS', 'Virtual Account'].includes(draft.paymentMethod))
    return 'Pilih metode pembayaran.'
  if (draft.travel !== undefined) {
    try {
      parseCarbonTravel(draft.travel)
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Pilihan perjalanan tidak valid.'
    }
  }
  return null
}

export function parseDraft(value: unknown): BookingDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Data pemesanan tidak valid.')
  const raw = value as Record<string, unknown>
  const stringKeys = [
    'productId',
    'variantId',
    'date',
    'endDate',
    'departure',
    'hotelId',
    'customerName',
    'email',
    'phone',
    'paymentMethod',
  ] as const
  for (const key of stringKeys)
    if (typeof raw[key] !== 'string' || (raw[key] as string).length > 200)
      throw new Error('Data pemesanan tidak lengkap.')
  if (typeof raw.quantity !== 'number' || typeof raw.rooms !== 'number')
    throw new Error('Jumlah pemesanan tidak valid.')
  return Object.fromEntries([
    ...stringKeys.map((key) => [key, raw[key]]),
    ['quantity', raw.quantity],
    ['rooms', raw.rooms],
    ...(raw.travel === undefined
      ? []
      : [['travel', parseCarbonTravel(raw.travel)]]),
  ]) as unknown as BookingDraft
}
