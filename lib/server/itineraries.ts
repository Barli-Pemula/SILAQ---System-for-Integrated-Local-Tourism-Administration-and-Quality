import 'server-only'
import { ItineraryStop } from '@/types/marketplace'
import { CULINARY_PLACES, HOTELS } from '../marketplace-data'

export const PRIVATE_ITINERARIES: Record<string, ItineraryStop[]> = {
  'bundle-selatan': [
    {
      day: 1,
      time: '09:00',
      title: 'Desa Adat Sade',
      description:
        'Mulai dari kawasan desa adat dan eksplorasi budaya Sasak. Tunjukkan voucher destinasi Sade saat kedatangan.',
      address: 'Desa Adat Sade, Rambitan, Pujut, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '12:00',
      title: 'Dapur Pesisir Kuta',
      description:
        'Rekomendasi makan siang. Pilih dan bayar makanan langsung di tempat; waktu singgah bersifat fleksibel.',
      address: CULINARY_PLACES[0].address,
      type: 'kuliner',
      included: false,
    },
    {
      day: 1,
      time: '13:30',
      title: 'Pantai Kuta Mandalika',
      description:
        'Lanjutkan ke pesisir Kuta untuk bersantai. Gunakan voucher Mandalika dari pemesanan ini.',
      address: 'Pantai Kuta Mandalika, Pujut, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '16:00',
      title: 'Pantai Tanjung Aan',
      description:
        'Akhiri rute di pantai berpasir putih. Tiket kawasan termasuk; aktivitas dan penyewaan alat di luar paket.',
      address: 'Pantai Tanjung Aan, Pujut, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '18:00',
      title: 'Sagara Stay Kuta',
      description:
        'Rekomendasi menginap setelah perjalanan. Hanya termasuk jika opsi hotel ditambahkan saat pemesanan.',
      address: HOTELS[0].address,
      type: 'hotel',
      included: false,
    },
  ],
  'bundle-budaya': [
    {
      day: 1,
      time: '08:30',
      title: 'Desa Sukarara',
      description:
        'Lihat proses tenun lokal. Tiket kunjungan termasuk; pembelian suvenir dan kelas tambahan dibayar terpisah.',
      address: 'Desa Sukarara, Jonggat, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '11:00',
      title: 'Desa Adat Sade',
      description: 'Jelajahi arsitektur dan tradisi Sasak dengan voucher Sade.',
      address: 'Desa Adat Sade, Rambitan, Pujut, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '12:30',
      title: 'Dapur Pesisir Kuta',
      description: 'Pilihan singgah kuliner, dibayar langsung di tempat.',
      address: CULINARY_PLACES[0].address,
      type: 'kuliner',
      included: false,
    },
    {
      day: 1,
      time: '15:30',
      title: 'Pantai Selong Belanak',
      description:
        'Nikmati pantai sampai sore. Kelas selancar tidak termasuk tiket kawasan.',
      address: 'Pantai Selong Belanak, Praya Barat, Lombok Tengah',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '18:30',
      title: 'Sagara Stay Kuta',
      description:
        'Opsi menginap setelah rute; termasuk hanya jika hotel ditambahkan.',
      address: HOTELS[0].address,
      type: 'hotel',
      included: false,
    },
  ],
  'bundle-utara': [
    {
      day: 1,
      time: '09:00',
      title: 'Sendang Gile & Tiu Kelep',
      description:
        'Gunakan alas kaki antiselip dan mulai dari pintu masuk Senaru. Voucher berlaku untuk kawasan dua air terjun. Pemandu tidak termasuk.',
      address: 'Air Terjun Sendang Gile, Senaru, Bayan, Lombok Utara',
      type: 'wisata',
      included: true,
    },
    {
      day: 1,
      time: '13:00',
      title: 'Warung Rimbun Senaru',
      description:
        'Rekomendasi makan siang selepas trekking. Makanan dibayar langsung di tempat.',
      address: CULINARY_PLACES[1].address,
      type: 'kuliner',
      included: false,
    },
    {
      day: 1,
      time: '14:00',
      title: 'Rimbun Lodge Senaru',
      description:
        'Istirahat satu malam. Voucher hotel diterbitkan hanya jika tambahan hotel dipilih.',
      address: HOTELS[1].address,
      type: 'hotel',
      included: false,
    },
    {
      day: 2,
      time: '10:00',
      title: 'Air Terjun Tiu Pupus',
      description:
        'Check-out hotel sebelum berangkat menuju Gangga. Gunakan voucher Tiu Pupus dan ikuti jalur yang dibuka petugas.',
      address: 'Air Terjun Tiu Pupus, Gangga, Lombok Utara',
      type: 'wisata',
      included: true,
    },
  ],
}
