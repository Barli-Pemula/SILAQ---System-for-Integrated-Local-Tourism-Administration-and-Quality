export type MarketCategory =
  'Destinasi' | 'Paket Wisata' | 'Hotel' | 'Tiket Kapal' | 'Kuliner'
export type BookableCategory = Exclude<MarketCategory, 'Kuliner'>

export interface ItineraryStop {
  day: number
  time: string
  title: string
  description: string
  address: string
  type: 'wisata' | 'kuliner' | 'hotel'
  included: boolean
}

export interface MarketProduct {
  id: string
  category: BookableCategory
  name: string
  location: string
  address: string
  image: string
  description: string
  price: number
  unit: string
  highlights: string[]
  variants?: { id: string; name: string; price: number; capacity: number }[]
  destinationIds?: string[]
  durationDays?: number
  itinerary?: ItineraryStop[]
  hotelId?: string
  culinaryIds?: string[]
  departures?: string[]
  arrival?: string
  duration?: string
  capacity: number
}

export interface CulinaryPlace {
  id: string
  name: string
  location: string
  address: string
  image: string
  description: string
  specialty: string
}

export interface BookingDraft {
  productId: string
  variantId: string
  date: string
  endDate: string
  quantity: number
  departure: string
  hotelId: string
  rooms: number
  customerName: string
  email: string
  phone: string
  paymentMethod: 'QRIS' | 'Virtual Account'
}

export interface BookingVoucher {
  id: string
  productId?: string
  title: string
  category: BookableCategory
  quantity: number
  date: string
  endDate?: string
  checkedIn: boolean
}

export interface TravelBooking {
  id: string
  productId: string
  category: BookableCategory
  title: string
  image: string
  createdAt: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'payment_review'
  paymentMode?: 'demo' | 'sandbox' | 'production'
  paymentUrl?: string
  expiresAt?: string
  draft: BookingDraft
  subtotal: number
  hotelTotal: number
  fee: number
  total: number
  vouchers: BookingVoucher[]
  itinerary: ItineraryStop[]
}
