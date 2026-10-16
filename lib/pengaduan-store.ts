'use client'

import { useSyncExternalStore } from 'react'
import { Pengaduan, PengaduanCategory, PengaduanStatus } from '@/types/smart-tourism'

const OWN_REPORTER = { reporterName: 'Reza Pratama', reporterEmail: 'reza.pratama@email.com' }

const SEED: Pengaduan[] = [
  {
    id: 'PGD-0003',
    reporterName: 'Nadia Kusuma',
    reporterEmail: 'nadia.k@email.com',
    category: 'Kehilangan Barang',
    destination: 'Gili Trawangan',
    locationDetail: 'Dermaga Bangsal, area tunggu kapal',
    message:
      'Tas ransel warna merah tertinggal di kapal speedboat dari Gili Trawangan ke Bangsal sekitar jam 14:30. Isi: dompet, powerbank, dan kacamata hitam.',
    status: 'Diproses',
    priority: 'Tinggi',
    timestamp: '2026-02-16T07:10:00',
    updatedAt: '2026-02-16T07:25:00',
    adminNote: 'Sedang dikoordinasikan dengan operator kapal BlueWater Express.',
  },
  {
    id: 'PGD-0002',
    reporterName: 'Bagas Wirawan',
    reporterEmail: 'bagas.w@email.com',
    category: 'Fasilitas Rusak',
    destination: 'Pantai Kuta Mandalika',
    locationDetail: 'Toilet umum blok B dekat area parkir',
    message:
      'Kran toilet umum di blok B tidak berfungsi dan lantai licin karena air menggenang. Sangat mengganggu pengunjung keluarga.',
    status: 'Baru',
    priority: 'Sedang',
    timestamp: '2026-02-16T05:42:00',
  },
  {
    id: 'PGD-0001',
    reporterName: 'Sinta Maharani',
    reporterEmail: 'sinta.m@email.com',
    category: 'Keamanan & Kenyamanan',
    destination: 'Air Terjun Sendang Gile & Tiu Kelep',
    locationDetail: 'Jalur trekking pos 2',
    message:
      'Ada jalur setapak yang longsor kecil dan tidak ada rambu peringatan di pos 2. Berpotensi bahaya bagi pendaki pemula.',
    status: 'Selesai',
    priority: 'Tinggi',
    timestamp: '2026-02-15T02:15:00',
    updatedAt: '2026-02-15T08:40:00',
    adminNote: 'Rambu peringatan dipasang dan jalur diverifikasi tim SAR setempat.',
  },
]

let state: Pengaduan[] = [...SEED]
let seq = SEED.length
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

export function subscribePengaduan(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPengaduanSnapshot(): Pengaduan[] {
  return state
}

export function usePengaduan() {
  const list = useSyncExternalStore(subscribePengaduan, getPengaduanSnapshot)
  return list
}

function priorityFor(category: PengaduanCategory): Pengaduan['priority'] {
  if (category === 'Kehilangan Barang' || category === 'Keamanan & Kenyamanan') return 'Tinggi'
  if (category === 'Lainnya') return 'Rendah'
  return 'Sedang'
}

export function addPengaduan(input: {
  category: PengaduanCategory
  destination: string
  locationDetail: string
  message: string
  reporterName?: string
  reporterEmail?: string
}): Pengaduan {
  seq += 1
  const item: Pengaduan = {
    id: `PGD-${String(seq).padStart(4, '0')}`,
    reporterName: input.reporterName ?? OWN_REPORTER.reporterName,
    reporterEmail: input.reporterEmail ?? OWN_REPORTER.reporterEmail,
    category: input.category,
    destination: input.destination,
    locationDetail: input.locationDetail,
    message: input.message,
    status: 'Baru',
    priority: priorityFor(input.category),
    timestamp: new Date().toISOString(),
    isOwn: true,
  }
  state = [item, ...state]
  emit()
  return item
}

export function updatePengaduanStatus(
  id: string,
  status: PengaduanStatus,
  adminNote?: string
) {
  state = state.map((p) =>
    p.id === id
      ? { ...p, status, adminNote: adminNote ?? p.adminNote, updatedAt: new Date().toISOString() }
      : p
  )
  emit()
}

export function pengaduanStatusChipClass(status: PengaduanStatus) {
  if (status === 'Baru') return 'table-status table-status-pending'
  if (status === 'Diproses') return 'table-status table-status-info'
  if (status === 'Selesai') return 'table-status'
  return 'table-status table-status-danger'
}

export function pengaduanPriorityChipClass(priority: Pengaduan['priority']) {
  if (priority === 'Tinggi') return 'table-status table-status-danger'
  if (priority === 'Sedang') return 'table-status table-status-pending'
  return 'table-status table-status-neutral'
}

const SIM_NAMES = [
  'Wayan Adi Nugraha',
  'Fajar Setiawan',
  'Melati Ramadhani',
  'Yoga Prabowo',
  'Ayu Lestari',
  'Dimas Saputra',
]

const SIM_CATEGORIES: PengaduanCategory[] = [
  'Kehilangan Barang',
  'Fasilitas Rusak',
  'Keamanan & Kenyamanan',
  'Pelayanan Buruk',
  'Lingkungan & Kebersihan',
]

const SIM_DESTINATIONS = [
  'Gili Trawangan',
  'Gili Air',
  'Pantai Kuta Mandalika',
  'Pantai Tanjung Aan',
  'Air Terjun Sendang Gile & Tiu Kelep',
  'Pantai Senggigi',
  'Desa Adat Sade',
]

const SIM_MESSAGES: Record<PengaduanCategory, string[]> = {
  'Kehilangan Barang': [
    'Helm motor hilang di area parkir destinasi, plat B 3421 XYZ. Mohon bantuan penelusuran CCTV.',
    'Dompet tertinggal di warung dekat gerbang masuk sekitar jam 11 siang.',
  ],
  'Fasilitas Rusak': [
    'Lampu penerangan jalan setapak mati total sejak kemarin malam.',
    'Kursi gazebo patah dan berbahaya bagi pengunjung lansia.',
  ],
  'Keamanan & Kenyamanan': [
    'Ada oknum tidak bertanggung jawab memungut biaya liar di jalur masuk.',
    'Area snorkeling tanpa penjaga pantai terasa tidak aman untuk keluarga.',
  ],
  'Pelayanan Buruk': [
    'Petugas loket sangat lambat dan tidak sigap melayani antrean panjang.',
    'Informasi harga di papan pengumuman tidak sesuai dengan yang diminta di loket.',
  ],
  'Lingkungan & Kebersihan': [
    'Sampah plastik menumpuk di pinggir pantai setelah akhir pekan.',
    'Kamar mandi umum kotor dan tidak dibersihkan sejak pagi.',
  ],
  Lainnya: ['Mohon peningkatan sinyal seluler di kawasan destinasi.'],
}

export function simulateIncomingPengaduan(): Pengaduan {
  seq += 1
  const name = SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)]
  const category =
    SIM_CATEGORIES[Math.floor(Math.random() * SIM_CATEGORIES.length)]
  const destination =
    SIM_DESTINATIONS[Math.floor(Math.random() * SIM_DESTINATIONS.length)]
  const pool = SIM_MESSAGES[category]
  const message = pool[Math.floor(Math.random() * pool.length)]
  const item: Pengaduan = {
    id: `PGD-${String(seq).padStart(4, '0')}`,
    reporterName: name,
    reporterEmail: `${name.split(' ')[0].toLowerCase()}@email.com`,
    category,
    destination,
    locationDetail: 'Lapangan wisatawan via aplikasi SILAQ',
    message,
    status: 'Baru',
    priority: priorityFor(category),
    timestamp: new Date().toISOString(),
    isOwn: false,
  }
  state = [item, ...state]
  emit()
  return item
}
