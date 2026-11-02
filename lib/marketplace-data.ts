import { INITIAL_DESTINATIONS } from './smart-tourism-data'
import { CulinaryPlace, MarketProduct } from '@/types/marketplace'

// Illustrative inventory for the prototype; no live rates, schedules, or availability.
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?w=1000&h=700&fit=crop&auto=format`
export const mapLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
export const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
export const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
export const addDays = (date: string, days: number) => {
  const result = new Date(`${date}T12:00:00Z`)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  })

export const CULINARY_PLACES: CulinaryPlace[] = [
  {
    id: 'food-kuta',
    name: 'Dapur Pesisir Kuta',
    location: 'Kuta, Lombok Tengah',
    address: 'Kawasan Jl. Pariwisata Pantai Kuta, Pujut, Lombok Tengah, NTB',
    image: photo('photo-1547592180-85f173990554'),
    description:
      'Inspirasi tempat bersantap setelah menjelajahi Mandalika. Cicipi masakan rumahan Sasak dengan suasana pesisir yang santai.',
    specialty: 'Ayam taliwang · Plecing kangkung',
  },
  {
    id: 'food-senaru',
    name: 'Warung Rimbun Senaru',
    location: 'Senaru, Lombok Utara',
    address: 'Kawasan Jl. Pariwisata Senaru, Bayan, Lombok Utara, NTB',
    image: photo('photo-1512621776951-a57141f2eefd'),
    description:
      'Inspirasi persinggahan makan siang di kaki Rinjani. Hidangan hangat dan sayuran lokal untuk melengkapi perjalanan ke air terjun.',
    specialty: 'Nasi campur Sasak · Kopi lokal',
  },
  {
    id: 'food-senggigi',
    name: 'Pasar Kuliner Pesisir',
    location: 'Senggigi, Lombok Barat',
    address: 'Kawasan Jl. Raya Senggigi, Batu Layar, Lombok Barat, NTB',
    image: photo('photo-1555939594-58d7cb561ad1'),
    description:
      'Inspirasi kawasan kuliner untuk menikmati hidangan laut dan jajanan lokal. Cocok sebagai penutup perjalanan di pesisir barat.',
    specialty: 'Ikan bakar · Sate rembiga',
  },
]

export const HOTELS: MarketProduct[] = [
  {
    id: 'hotel-kuta',
    category: 'Hotel',
    name: 'Sagara Stay Kuta',
    location: 'Kuta, Lombok Tengah',
    address: 'Kawasan Jl. Pariwisata Pantai Kuta, Pujut, Lombok Tengah, NTB',
    image: photo('photo-1571896349842-33c89424de2d'),
    description:
      'Penginapan bernuansa tropis untuk menjelajahi pantai selatan. Kamar untuk dua tamu dengan area bersantai yang tenang.',
    price: 650000,
    unit: 'kamar / malam',
    highlights: [
      '2 tamu / kamar',
      'Sarapan',
      'Wi-Fi',
      'Check-in 14.00 · check-out 12.00',
    ],
    capacity: 8,
  },
  {
    id: 'hotel-senaru',
    category: 'Hotel',
    name: 'Rimbun Lodge Senaru',
    location: 'Senaru, Lombok Utara',
    address: 'Kawasan Jl. Pariwisata Senaru, Bayan, Lombok Utara, NTB',
    image: photo('photo-1445019980597-93fa8acb246c'),
    description:
      'Lodge yang hangat di kawasan Senaru. Beristirahat dekat alam sebelum melanjutkan perjalanan ke air terjun.',
    price: 420000,
    unit: 'kamar / malam',
    highlights: [
      '2 tamu / kamar',
      'Sarapan',
      'Teras taman',
      'Check-in 14.00 · check-out 12.00',
    ],
    capacity: 6,
  },
  {
    id: 'hotel-senggigi',
    category: 'Hotel',
    name: 'Senja Suites Senggigi',
    location: 'Senggigi, Lombok Barat',
    address: 'Kawasan Jl. Raya Senggigi, Batu Layar, Lombok Barat, NTB',
    image: photo('photo-1566073771259-6a8506099945'),
    description:
      'Pilihan menginap di pesisir barat dengan kamar lapang dan kolam renang. Untuk perjalanan santai bersama pasangan atau keluarga.',
    price: 850000,
    unit: 'kamar / malam',
    highlights: [
      '2 tamu / kamar',
      'Kolam renang',
      'Sarapan',
      'Check-in 14.00 · check-out 12.00',
    ],
    capacity: 10,
  },
]

export const BOATS: MarketProduct[] = [
  {
    id: 'boat-padangbai',
    category: 'Tiket Kapal',
    name: 'Padangbai → Bangsal',
    location: 'Bali → Lombok Utara',
    address: 'Pelabuhan Padangbai, Karangasem, Bali',
    arrival: 'Pelabuhan Bangsal, Pemenang, Lombok Utara',
    image: photo('photo-1544551763-46a013bb70d5'),
    description:
      'Penyeberangan fast boat sekali jalan menuju Lombok. Pilih tanggal, jam keberangkatan, dan jumlah penumpang dalam satu pemesanan.',
    price: 375000,
    unit: 'penumpang',
    highlights: [
      'Sekali jalan',
      'Kursi penumpang',
      'Bagasi 15 kg',
      'Tiba 45 menit sebelum berangkat',
    ],
    departures: ['09:00', '13:00'],
    duration: '± 2 jam 30 menit',
    capacity: 30,
  },
  {
    id: 'boat-gili',
    category: 'Tiket Kapal',
    name: 'Bangsal → Gili Trawangan',
    location: 'Lombok Utara → Gili',
    address: 'Pelabuhan Bangsal, Pemenang, Lombok Utara, NTB',
    arrival: 'Dermaga Gili Trawangan, Lombok Utara',
    image: INITIAL_DESTINATIONS[0].image,
    description:
      'Jelajahi Gili dengan penyeberangan sekali jalan dari Bangsal. Jadwal yang ringkas untuk melengkapi rencana liburanmu.',
    price: 85000,
    unit: 'penumpang',
    highlights: [
      'Sekali jalan',
      'Kursi penumpang',
      'Bagasi 10 kg',
      'Tiba 30 menit sebelum berangkat',
    ],
    departures: ['09:30', '11:00', '14:00'],
    duration: '± 30 menit',
    capacity: 24,
  },
  {
    id: 'boat-lembar',
    category: 'Tiket Kapal',
    name: 'Padangbai → Lembar',
    location: 'Bali → Lombok Barat',
    address: 'Pelabuhan Padangbai, Karangasem, Bali',
    arrival: 'Pelabuhan Lembar, Lombok Barat, NTB',
    image: photo('photo-1500530855697-b586d89ba3ee'),
    description:
      'Pilihan penyeberangan feri ke Lombok Barat untuk penumpang pejalan kaki. Tiket kendaraan dipesan secara terpisah di luar platform.',
    price: 75000,
    unit: 'penumpang',
    highlights: [
      'Sekali jalan',
      'Penumpang tanpa kendaraan',
      'Area duduk umum',
      'Tiba 60 menit sebelum berangkat',
    ],
    departures: ['08:00', '12:00', '16:00'],
    duration: '± 5 jam',
    capacity: 60,
  },
]

export const TOUR_BUNDLES: MarketProduct[] = [
  {
    id: 'bundle-selatan',
    category: 'Paket Wisata',
    name: 'Cerita dari Selatan',
    location: 'Lombok Tengah',
    address: 'Desa Adat Sade, Rambitan, Pujut, Lombok Tengah',
    image: INITIAL_DESTINATIONS.find((d) => d.id === 'dest-tanjungaan')!.image,
    description:
      'Budaya Sasak, pasir putih, dan sore di tepi laut. Tiga destinasi, satu pemesanan yang lebih praktis.',
    price: 90000,
    unit: 'orang',
    durationDays: 1,
    destinationIds: ['dest-sade', 'dest-mandalika', 'dest-tanjungaan'],
    hotelId: 'hotel-kuta',
    culinaryIds: ['food-kuta'],
    capacity: 20,
    highlights: ['3 tiket destinasi', '1 hari', 'Rute mandiri'],
  },
  {
    id: 'bundle-budaya',
    category: 'Paket Wisata',
    name: 'Jejak Sasak & Senja',
    location: 'Lombok Tengah',
    address: 'Desa Sukarara, Jonggat, Lombok Tengah',
    image: INITIAL_DESTINATIONS.find((d) => d.id === 'dest-sukarara')!.image,
    description:
      'Kenali tradisi tenun, singgah di desa adat, lalu tutup hari di pantai selatan.',
    price: 70000,
    unit: 'orang',
    durationDays: 1,
    destinationIds: ['dest-sukarara', 'dest-sade', 'dest-selongbelanak'],
    hotelId: 'hotel-kuta',
    culinaryIds: ['food-kuta'],
    capacity: 16,
    highlights: ['3 tiket destinasi', '1 hari', 'Budaya & pantai'],
  },
  {
    id: 'bundle-utara',
    category: 'Paket Wisata',
    name: 'Rimbun Lombok Utara',
    location: 'Lombok Utara',
    address: 'Senaru, Bayan, Lombok Utara, NTB',
    image: INITIAL_DESTINATIONS.find((d) => d.id === 'dest-sendanggile')!.image,
    description:
      'Dua hari lebih dekat dengan alam: air terjun Senaru dan Tiu Pupus. Hotel bisa ditambahkan untuk satu malam.',
    price: 55000,
    unit: 'orang',
    durationDays: 2,
    destinationIds: ['dest-sendanggile', 'dest-tiupupus'],
    hotelId: 'hotel-senaru',
    culinaryIds: ['food-senaru'],
    capacity: 12,
    highlights: ['2 tiket kawasan', '2 hari / 1 malam', 'Alam & air terjun'],
  },
]

export const DESTINATION_PRODUCTS: MarketProduct[] = INITIAL_DESTINATIONS.map(
  (d) => ({
    id: d.id,
    category: 'Destinasi',
    name: d.name,
    location: d.location,
    address: d.address,
    image: d.image,
    description: d.description,
    price: d.price,
    unit: 'orang',
    highlights: d.highlights,
    capacity: d.ticketTiers[0]?.quotaRemaining ?? 10,
    variants: d.ticketTiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      capacity: t.quotaRemaining,
    })),
  })
)

export const MARKET_PRODUCTS = [
  ...TOUR_BUNDLES,
  ...HOTELS,
  ...BOATS,
  ...DESTINATION_PRODUCTS,
]
