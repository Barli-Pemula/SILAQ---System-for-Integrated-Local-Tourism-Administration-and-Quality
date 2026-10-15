export type Role = 'consumer' | 'admin' | 'superadmin'

export interface Destination {
  id: string
  name: string
  category: 'Pantai' | 'Gunung' | 'Budaya' | 'Gili' | 'Air Terjun'
  location: string
  region: 'Lombok Utara' | 'Lombok Tengah' | 'Lombok Timur' | 'Lombok Barat' | 'Kota Mataram'
  address: string
  mapsUrl: string
  price: number
  originalPrice?: number
  rating: number
  reviewsCount: number
  image: string
  description: string
  highlights: string[]
  isPopular?: boolean
  discount?: string
  ticketTiers: TicketTier[]
}

export interface TicketTier {
  id: string
  name: string
  price: number
  description: string
  quotaPerDay: number
  quotaRemaining: number
  badge?: string
}

export interface TourismEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: 'Budaya' | 'Musik' | 'Olahraga' | 'Kuliner' | 'Religi'
  price: number | 'Gratis'
  image: string
  description: string
  schedule: { time: string; activity: string }[]
}

export interface Partner {
  id: string
  name: string
  contactPerson: string
  destination: string
  region: string
  status: 'Online' | 'Offline' | 'Review' | 'Pending'
  visitorsMonthly: number
  uptimeRate: string
  rating: number
  totalRevenue: string
  phone: string
  email: string
  joinedDate: string
}

export interface Transaction {
  id: string
  customerName: string
  destination: string
  partnerName: string
  ticketType: string
  quantity: number
  totalAmount: number
  status: 'Berhasil' | 'Diproses' | 'Check-in' | 'Dibatalkan'
  timestamp: string
  paymentMethod: 'QRIS' | 'GoPay' | 'BCA Virtual Account' | 'Mandiri VA' | 'Kartu Kredit' | 'Tunai / Kasir'
  channel: 'Online App' | 'Loket Destinasi (POS)'
  qrCode: string
}

export interface CarbonOffsetProject {
  id: string
  title: string
  location: string
  price: number
  co2OffsetKg: number
  icon: string
  description: string
  participants: number
}

export interface AIMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  suggestedActions?: string[]
}
