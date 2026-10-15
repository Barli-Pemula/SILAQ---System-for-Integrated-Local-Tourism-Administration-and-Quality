'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Sparkles,
  Users,
  MapPin,
  Wallet,
  FileText,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Download,
  Calendar,
  LogOut,
  User,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Star,
  Send,
  LoaderCircle,
  CircleCheck
} from 'lucide-react'
import {
  INITIAL_PARTNERS,
  REGIONS_DATA,
  INITIAL_TRANSACTIONS,
  INITIAL_DESTINATIONS
} from '@/lib/smart-tourism-data'
import { AiAnswer, AiMessage, useAiAssistant } from '@/lib/ai-assistant'
import { Partner, Destination } from '@/types/smart-tourism'

interface SuperAdminDashboardProps {
  onLogout: () => void
}

const AI_STAGES = [
  'Mengambil data transaksi, gate & cuaca…',
  'Menjalankan model prediksi & deteksi anomali…',
  'Menyintesis temuan dan rekomendasi…',
]

const INITIAL_AI_MESSAGES: AiMessage[] = [
  {
    from: 'ai',
    text: 'Halo Nadia, saya SILAQ Insight. Saya memantau 18.000+ transaksi, 48 node gate, dan prakiraan cuaca se-Lombok. Tanyakan kondisi kunjungan, kapasitas, atau minta rekomendasi kebijakan.',
  },
]

const AI_PROMPTS = [
  'Wilayah mana yang tumbuh paling cepat?',
  'Proyeksi kunjungan pekan Bau Nyale',
  'Destinasi dengan okupansi tertinggi',
  'Rekomendasi kebijakan untuk UMKM',
]

const GENERATION_STEPS = [
  'Menarik data transaksi, gate & mitra',
  'Menjalankan model prediksi & deteksi anomali',
  'Menyintesis laporan & rekomendasi kebijakan',
]

const REPORT_VARIANTS: { title: string; body: string }[][] = [
  [
    {
      title: 'Efisiensi gate',
      body: 'Validasi e-ticket QR mencatatkan rerata 1,8 detik per orang, bebas antrean panjang di dermaga.',
    },
    {
      title: 'Sentimen wisatawan',
      body: '94,2% ulasan bernada sangat positif, khususnya di Desa Sade dan penyeberangan Gili Trawangan.',
    },
    {
      title: 'Dampak UMKM',
      body: 'Pemberdayaan perajin tenun Sasak naik 23% berkat integrasi e-ticket suvenir langsung.',
    },
  ],
  [
    {
      title: 'Konsentrasi kunjungan',
      body: 'Lombok Tengah menyumbang 14.850 wisatawan dengan pertumbuhan +18,4%, tercepat antar empat wilayah.',
    },
    {
      title: 'Risiko kapasitas',
      body: 'Zona Pantai Seger diprediksi terisi 92% pada pukul 10.00–12.00 saat puncak Festival Bau Nyale.',
    },
    {
      title: 'Peluang pendapatan',
      body: 'Paket VIP fast boat naik 31% konversinya ketika ditawarkan pada halaman overview destinasi.',
    },
  ],
  [
    {
      title: 'Keseimbangan mitra',
      body: '4 mitra baru diusulkan untuk Lombok Timur agar distribusi pengunjung tidak menumpuk di satu koridor.',
    },
    {
      title: 'Kualitas kunjungan',
      body: 'Durasi rata-rata kunjungan naik menjadi 2,8 hari, mendorong okupansi homestay di Sembalun.',
    },
    {
      title: 'Jejak karbon',
      body: 'Program mangrove Gili Air mencatat 1.240 pohon tertanam setara 6.448 kg CO₂ terkompensasi.',
    },
  ],
]

function buildSuperAdminAnswer(raw: string): AiAnswer {
  const q = raw.toLowerCase().trim()

  if (/tumbuh|pertumbuhan|wilayah|kunjungan wisatawan|destinasi mana|sebaran/.test(q)) {
    return {
      text: 'Pertumbuhan kunjungan per wilayah (Februari 2026):\n• Lombok Tengah — 14.850 wisatawan, +18,4% (16 mitra)\n• Lombok Utara — 12.420 wisatawan, +14,2% (14 mitra)\n• Lombok Timur — 8.310 wisatawan, +9,1% (11 mitra)\n• Kota Mataram & Barat — 6.940 wisatawan, +7,5% (7 mitra)\n\nLombok Tengah memimpin karena koridor Mandalika dan Desa Sade. Rekomendasi: alokasikan 3 mitra baru ke Lombok Timur untuk menyeimbangkan distribusi.',
      followUps: ['Proyeksi pekan Bau Nyale', 'Sebaran mitra per wilayah', 'Rekomendasi kebijakan UMKM'],
    }
  }

  if (/proyeksi|prediksi|forecast|bau nyale|lonjakan|pekan depan|kuota/.test(q)) {
    return {
      text: 'Proyeksi untuk 24–26 Februari (Festival Pesona Bau Nyale):\n• Lonjakan booking kawasan Mandalika diprediksi +340%\n• Kapasitas parkir zona Pantai Seger perlu ditambah ±1.200 slot\n• Gate tambahan disarankan di 2 titik: Pantai Seger dan Kuta Park\n\nDengan rekayasa kuota tiket, antrean gate diperkirakan turun dari 9 menit ke 2,5 menit pada jam puncak 10.00–12.00.',
      followUps: ['Terapkan rekayasa kuota', 'Kirim broadcast ke operator', 'Cek kapasitas parkir'],
    }
  }

  if (/okupansi|terlaris|kuota tersisa|tiket terjual|paling ramai|pendapatan|gmv|transaksi/.test(q)) {
    return {
      text: 'Kinerja tiket & transaksi 1–28 Februari 2026:\n• GMV ekosistem Rp 4,82 miliar (+8,6% vs target)\n• 18.920 tiket terjual, pertumbuhan +16,2%\n• Penyaluran mitra 92% = Rp 4,43 miliar, siap dicairkan\n• PAD & platform 8% = Rp 385,6 juta\n\nDestinasi dengan okupansi tertinggi: Gili Trawangan (VIP tersisa 42 dari 200), Kuta Mandalika (560/1.200), dan Desa Sade (245/400).',
      followUps: ['Jadwal settlement berikutnya', 'Destinasi berisiko penuh', 'Rincian bagi hasil mitra'],
    }
  }

  if (/mitra|umkm|verifikasi|izin|perajin|tenun/.test(q)) {
    return {
      text: 'Kondisi mitra & UMKM:\n• 45 mitra aktif, 4 menunggu berkas dan 12 dalam tinjauan\n• Rata-rata pengunjung per mitra: 108 ribu/bulan\n• Perajin tenun Sasak mencatat kenaikan kontribusi penjualan 23% lewat e-ticket suvenir\n\nRekomendasi: percepat verifikasi 4 mitra yang menunggu agar kapasitas bertambah sebelum musim liburan.',
      followUps: ['Buka meja verifikasi mitra', 'Proyeksi pendapatan mitra', 'Prioritas UMKM naik kelas'],
    }
  }

  if (/cuaca|bmkg|gelombang|ombak|kapal|penyeberangan|badai/.test(q)) {
    return {
      text: 'Prakiraan operasional hari ini:\n• Ketinggian gelombang diperkirakan naik 1,2 m sekitar pukul 16.30 di Selat Lombok\n• Rekomendasi: keberangkatan kapal dari Bangsal dimajukan 30 menit\n• 14 operator penyeberangan siap menerima broadcast\n\nSetelah pukul 17.00 penyeberangan sebaiknya ditunda, sementara cuaca pantai selatan cerah berawan 28–31°C.',
      followUps: ['Kirim broadcast ke operator', 'Dampak ke penjualan tiket', 'Jadwal gate hari ini'],
    }
  }

  if (/parkir|kapasitas|antrean|gate|zona/.test(q)) {
    return {
      text: 'Kapasitas & kesehatan gate:\n• 48 node gate terhubung ke server pusat, sinkronisasi terakhir 5 menit lalu\n• Rerata validasi QR 1,8 detik per orang\n• Zona Pantai Seger terisi 62% pada jam terakhir\n\nRekomendasi: buka 2 gate tambahan di Seger dan Kuta Park, lalu alokasikan 1.200 slot parkir tambahan sebelum puncak akhir pekan.',
      followUps: ['Terapkan rekayasa kuota', 'Monitoring gate real-time', 'Proyeksi antrean akhir pekan'],
    }
  }

  if (/karbon|esg|lingkungan|mangrove|konservasi|hijau/.test(q)) {
    return {
      text: 'Capaian ESG berjalan:\n• 18,4 ton CO₂ terkompensasi dari target bulanan 20 ton\n• Restorasi mangrove Gili Air: 1.240 pohon = 6.448 kg CO₂\n• Adopsi pohon lereng Rinjani: 820 pohon = 3.910 kg CO₂\n\nUntuk mencapai target, tambah satu program offset di Gili Nanggu dengan kuota 500 pohon dan tawarkan pada halaman checkout tiket.',
      followUps: ['Buka laporan ESG', 'Program offset baru', 'Kampanye karbon wisatawan'],
    }
  }

  if (/sentimen|ulasan|review|keluhan|rating/.test(q)) {
    return {
      text: 'Sentimen wisatawan Februari 2026:\n• 94,2% ulasan bernada sangat positif\n• Destinasi dengan rating tertinggi: Desa Sade 4,9 dan Gili Trawangan 4,9\n• Keluhan terbanyak: ketersediaan parkir akhir pekan (5,1%)\n\nFokus perbaikan: tambah petugas dan rambu parkir di Kuta Mandalika serta zona Pantai Seger.',
      followUps: ['Ulasan per destinasi', 'Rencana perbaikan parkir', 'Benchmark terhadap Bali'],
    }
  }

  if (/laporan mingguan|ringkasan|sintesis|rekomendasi kebijakan|strategi|kebijakan/.test(q)) {
    return {
      text: 'Rekomendasi kebijakan pekan ini:\n1. Terapkan kuota tiket bertingkat untuk kawasan Mandalika pada 24–26 Februari\n2. Percepat verifikasi 4 mitra agar kapasitas naik sebelum lonjakan kunjungan\n3. Tambah 2 gate dan 1.200 slot parkir di zona Pantai Seger\n4. Tawarkan offset mangrove pada halaman checkout untuk menutup selisih target ESG\n\nEstimasi dampak: antrean turun 72%, okupansi mitra stabil, dan target 20 ton CO₂ tercapai.',
      followUps: ['Terapkan rekayasa kuota', 'Kirim broadcast ke operator', 'Buka pusat laporan'],
    }
  }

  return {
    text: 'Ringkasan ekosistem hari ini:\n• 28.490 wisatawan terdaftar (+14,2% bulan ini)\n• 45 mitra aktif, 4 menunggu berkas\n• Platform uptime 99,98%, seluruh node gate terhubung\n• 18,4 ton CO₂ terkompensasi\n\nTiga hal yang perlu perhatianmu sore ini: gelombang Selat Lombok pukul 16.30, lonjakan booking Bau Nyale +340%, dan 4 berkas mitra yang belum diverifikasi.',
    followUps: ['Proyeksi pekan Bau Nyale', 'Wilayah tumbuh tercepat', 'Rekomendasi kebijakan UMKM'],
  }
}

const partnerChipClass = (status: Partner['status']) => {
  if (status === 'Online') return 'table-status'
  if (status === 'Review') return 'table-status table-status-pending'
  if (status === 'Pending') return 'table-status table-status-info'
  return 'table-status table-status-neutral'
}

const partnerStatusLabel = (status: Partner['status']) => {
  if (status === 'Online') return 'Terverifikasi'
  if (status === 'Review') return 'Dalam tinjauan'
  if (status === 'Pending') return 'Menunggu berkas'
  return 'Offline'
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [activeNav, setActiveNav] = useState('Ringkasan')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')

  // Partners state for approval
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS)
  const [partnerFilter, setPartnerFilter] = useState<'Semua' | 'Online' | 'Review' | 'Pending'>(
    'Semua'
  )

  // AI assistant state
  const [aiInput, setAiInput] = useState('')
  const [alerts, setAlerts] = useState({ weather: false, bauNyale: false })
  const [genStep, setGenStep] = useState<number | null>(null)
  const [reportIndex, setReportIndex] = useState(0)
  const aiChatRef = useRef<HTMLDivElement | null>(null)
  const genTimers = useRef<number[]>([])

  const {
    messages: aiMessages,
    stage: aiStage,
    streaming: aiStreaming,
    followUps: aiFollowUps,
    isThinking: aiThinking,
    isBusy: aiBusy,
    send: sendAi,
    reset: resetAi,
  } = useAiAssistant({
    initialMessages: INITIAL_AI_MESSAGES,
    stages: AI_STAGES,
    answer: buildSuperAdminAnswer,
  })

  useEffect(() => {
    const node = aiChatRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [aiMessages, aiStreaming, aiStage])

  useEffect(
    () => () => {
      genTimers.current.forEach((id) => window.clearTimeout(id))
    },
    []
  )

  const submitAiPrompt = (text = aiInput) => {
    if (!text.trim() || aiBusy) return
    sendAi(text)
    setAiInput('')
  }

  const handleGenerateReport = () => {
    if (genStep !== null) return
    genTimers.current.forEach((id) => window.clearTimeout(id))
    genTimers.current = []
    setGenStep(0)
    genTimers.current.push(window.setTimeout(() => setGenStep(1), 750))
    genTimers.current.push(window.setTimeout(() => setGenStep(2), 1500))
    genTimers.current.push(
      window.setTimeout(() => {
        setGenStep(null)
        setReportIndex((current) => (current + 1) % REPORT_VARIANTS.length)
        setNotice('Laporan ringkasan AI mingguan berhasil diperbarui.')
      }, 2300)
    )
  }

  const navItems = [
    { label: 'Ringkasan', icon: LayoutDashboard },
    { label: 'AI Insight', icon: Sparkles },
    { label: 'Mitra & Admin', icon: Users },
    { label: 'Destinasi', icon: MapPin },
    { label: 'Transaksi', icon: Wallet },
    { label: 'Laporan', icon: FileText },
    { label: 'Pengaturan', icon: Settings }
  ]

  const pendingReviewCount = partners.filter((p) => p.status !== 'Online').length

  const handleApprovePartner = (id: string, name: string) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, status: 'Online' } : p)))
    setNotice(`Mitra ${name} berhasil diverifikasi dan aktif di platform.`)
  }

  const handleReviewPartner = (id: string, name: string) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, status: 'Review' } : p)))
    setNotice(`Mitra ${name} dialihkan ke status peninjauan berkas.`)
  }

  const filteredPartners = partners.filter((p) =>
    partnerFilter === 'Semua' ? true : p.status === partnerFilter
  )

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {mobileMenu && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 min-[1101px]:hidden"
          onClick={() => setMobileMenu(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${mobileMenu ? 'admin-sidebar-open' : ''}`}>
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark logo-mark-inverse">
              <img src="/logo-silaq-icon.png" alt="" />
            </div>
            <div>
              <span className="font-display text-[15px] font-bold text-white block leading-tight">
                SILAQ
              </span>
              <span className="text-xs text-sky-400 block">Provinsi NTB Hub</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            className="admin-drawer-close min-[1101px]:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sidebar-context">
          <strong>SuperAdmin</strong>
          <span>Dinas Pariwisata Provinsi NTB</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveNav(item.label)
                  setMobileMenu(false)
                }}
                className={`sidebar-item ${activeNav === item.label ? 'sidebar-item-active' : ''}`}
              >
                <IconComponent className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.label === 'Mitra & Admin' && pendingReviewCount > 0 && (
                  <span className="sidebar-count">{pendingReviewCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="bg-white/[0.04] p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-white/10 text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Nadia Permata</p>
              <p className="truncate text-xs text-slate-400">Dispar NTB</p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white transition-colors"
              title="Keluar ke halaman login"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="admin-icon-button min-[1101px]:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="admin-search">
            <Search className="h-4 w-4" />
            <span>Cari data, mitra, atau wilayah</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              Februari 2026
            </span>
            <button
              onClick={() => setNotice('Semua 48 node gate di Lombok terhubung ke server pusat.')}
              className="admin-icon-button"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              <span className="dot" />
            </button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          <div className="page-heading">
            <div>
              <h1>
                {activeNav === 'Ringkasan' ? 'Ringkasan ekosistem pariwisata' : activeNav}
              </h1>
              <p>
                {activeNav === 'Ringkasan'
                  ? 'Pantau performa pariwisata agregat dan kesehatan platform SILAQ se-NTB.'
                  : `Kelola data ${activeNav.toLowerCase()} dengan wewenang SuperAdmin.`}
              </p>
            </div>
            <div className="page-actions">
              <button
                type="button"
                onClick={() => setNotice('Rentang laporan aktif: 1–28 Februari 2026.')}
                className="app-button app-button-secondary"
              >
                <Calendar className="h-4 w-4" />
                01–28 Feb 2026
              </button>
              <button
                type="button"
                onClick={() => setNotice('Laporan eksekutif siap diunduh dalam format PDF resmi.')}
                className="app-button app-button-primary"
              >
                <Download className="h-4 w-4" />
                Ekspor laporan
              </button>
            </div>
          </div>

          {notice && (
            <div className="notice-bar">
              <span>{notice}</span>
              <button onClick={() => setNotice('')}>Tutup</button>
            </div>
          )}

          {/* TAB 1: RINGKASAN EKOSISTEM */}
          {activeNav === 'Ringkasan' && (
            <div className="space-y-5">
              <section className="ops-band">
                <div>
                  <span className="status-live">
                    <span /> Semua sistem normal
                  </span>
                  <h2 className="mt-4">Seluruh node gate terhubung ke server pusat</h2>
                  <p>
                    Data mitra, destinasi, transaksi, dan wisatawan dipantau terpusat untuk
                    pengambilan keputusan tingkat provinsi. Sinkronisasi terakhir 5 menit lalu.
                  </p>
                  <div className="ops-band-actions">
                    <button
                      onClick={() => setActiveNav('Laporan')}
                      className="app-button app-button-onnavy"
                    >
                      <FileText className="h-4 w-4" />
                      Buka pusat laporan
                    </button>
                    <button
                      onClick={() => setActiveNav('AI Insight')}
                      className="app-button app-button-quietnavy"
                    >
                      <Sparkles className="h-4 w-4" />
                      Analisis dengan AI
                    </button>
                  </div>
                </div>
                <div className="ops-figures">
                  <div>
                    <strong>99,98%</strong>
                    <span>Platform uptime</span>
                  </div>
                  <div>
                    <strong>45</strong>
                    <span>Mitra aktif</span>
                  </div>
                  <div>
                    <strong>{pendingReviewCount}</strong>
                    <span>Perlu review</span>
                  </div>
                </div>
              </section>

              <section className="metric-strip">
                <div>
                  <span className="metric-label">Wisatawan terdaftar</span>
                  <strong className="metric-value num">28.490</strong>
                  <span className="metric-note positive">+14,2% bulan ini</span>
                </div>
                <div>
                  <span className="metric-label">GMV ekosistem</span>
                  <strong className="metric-value num">Rp 4,8 miliar</strong>
                  <span className="metric-note positive">+8,6% vs target</span>
                </div>
                <div>
                  <span className="metric-label">Tiket terjual</span>
                  <strong className="metric-value num">18.920</strong>
                  <span className="metric-note positive">+16,2% pertumbuhan</span>
                </div>
                <div>
                  <span className="metric-label">Kompensasi karbon</span>
                  <strong className="metric-value num">18,4 ton</strong>
                  <span className="metric-note">CO₂ terkompensasi</span>
                </div>
              </section>

              <section className="panel-card p-0 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <h2 className="panel-title">Distribusi kunjungan per wilayah</h2>
                    <p className="panel-subtitle">
                      Data agregat 4 kabupaten/kota se-Lombok
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Terintegrasi Dispar NTB
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Wilayah</th>
                        <th className="text-right">Wisatawan</th>
                        <th className="text-right">Peredaran uang</th>
                        <th className="text-right">Mitra pengelola</th>
                        <th className="text-right">Pertumbuhan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REGIONS_DATA.map((r) => (
                        <tr key={r.name}>
                          <td>
                            <strong>{r.name}</strong>
                          </td>
                          <td className="text-right num">{r.visitors}</td>
                          <td className="text-right num">{r.gmv}</td>
                          <td className="text-right num">{r.activePartners}</td>
                          <td className="text-right">
                            <span className="table-status num">{r.growth}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: AI INSIGHT */}
          {activeNav === 'AI Insight' && (
            <div className="space-y-5">
              <section className="grid gap-5 md:grid-cols-2">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
                    <div>
                      <strong className="block text-sm text-amber-950">
                        Peringatan gelombang BMKG Selat Lombok
                      </strong>
                      <p className="mt-1.5 text-xs leading-5 text-amber-900/80">
                        Ketinggian gelombang diperkirakan naik 1,2 m pada pukul 16:30.
                        Rekomendasi: kirimkan peringatan ke operator kapal Bangsal untuk
                        memberangkatkan penumpang 30 menit lebih awal.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAlerts((current) => ({ ...current, weather: true }))
                          setNotice(
                            'Notifikasi broadcast cuaca berhasil dikirim ke 14 operator penyeberangan.'
                          )
                        }}
                        disabled={alerts.weather}
                        className={`app-button mt-3 ${
                          alerts.weather ? 'app-button-secondary' : 'app-button-primary'
                        }`}
                      >
                        {alerts.weather ? (
                          <>
                            <CircleCheck className="h-4 w-4" />
                            Broadcast terkirim
                          </>
                        ) : (
                          'Kirim broadcast ke operator'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-ocean-200 bg-ocean-50 p-5">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-5 w-5 flex-none text-ocean-700" />
                    <div>
                      <strong className="block text-sm text-ocean-950">
                        Prediksi lonjakan Festival Bau Nyale
                      </strong>
                      <p className="mt-1.5 text-xs leading-5 text-ocean-900/80">
                        Lonjakan booking diprediksi mencapai +340% untuk kawasan Mandalika pada
                        24–26 Februari. Kapasitas parkir zona Pantai Seger dianjurkan diperluas.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAlerts((current) => ({ ...current, bauNyale: true }))
                          setNotice(
                            'Koordinasi rekayasa kuota tiket diteruskan ke Dishub Loteng.'
                          )
                        }}
                        disabled={alerts.bauNyale}
                        className={`app-button mt-3 ${
                          alerts.bauNyale ? 'app-button-secondary' : 'app-button-primary'
                        }`}
                      >
                        {alerts.bauNyale ? (
                          <>
                            <CircleCheck className="h-4 w-4" />
                            Rekayasa kuota diterapkan
                          </>
                        ) : (
                          'Terapkan rekayasa kuota tiket'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI ANALYST CHAT */}
              <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="ai-insight-banner">
                  <div className="min-w-0">
                    <span className="ai-kicker">
                      <Sparkles className="h-3.5 w-3.5" /> Asisten Analitik
                    </span>
                    <h2>Tanya data pariwisata NTB ke AI</h2>
                    <p>
                      Sintesis 18.000+ data transaksi, 48 node gate, dan prakiraan cuaca secara
                      langsung — jawaban disusun bertahap seperti analis sungguhan.
                    </p>
                  </div>
                  <span className="ai-insight-status">
                    <span className={`chat-online-dot ${aiBusy ? 'is-busy' : ''}`} />
                    {aiBusy ? 'Model bekerja' : 'Model analitik aktif'}
                  </span>
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
                  <div className="flex min-w-0 flex-col">
                    <div className="chat-head">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="chat-avatar chat-avatar-lg">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <strong>SILAQ Insight</strong>
                          <span className="chat-head-status">
                            <span className={`chat-online-dot ${aiBusy ? 'is-busy' : ''}`} />
                            {aiBusy ? aiStage ?? 'Mengetik…' : 'Terhubung ke data platform'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={resetAi}
                        disabled={aiBusy}
                        className="app-button app-button-ghost"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${aiBusy ? 'animate-spin' : ''}`} />
                        Reset
                      </button>
                    </div>

                    <div ref={aiChatRef} className="chat-scroll h-[300px] sm:h-[340px]">
                      {aiMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`chat-row ${msg.from === 'user' ? 'chat-row-user' : ''}`}
                        >
                          {msg.from === 'ai' && (
                            <span className="chat-avatar">
                              <Sparkles className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <div
                            className={`chat-bubble ${
                              msg.from === 'user' ? 'chat-bubble-user' : ''
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {aiThinking && (
                        <div className="chat-row">
                          <span className="chat-avatar">
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>
                          <div className="chat-bubble chat-bubble-thinking">
                            <span className="chat-dots">
                              <i />
                              <i />
                              <i />
                            </span>
                            <span className="chat-stage">{aiStage}</span>
                          </div>
                        </div>
                      )}

                      {aiStreaming !== null && (
                        <div className="chat-row">
                          <span className="chat-avatar">
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>
                          <div className="chat-bubble">
                            {aiStreaming}
                            <span className="chat-cursor" />
                          </div>
                        </div>
                      )}
                    </div>

                    {(aiFollowUps.length > 0 ||
                      (aiMessages.length <= 1 && AI_PROMPTS.length > 0)) && (
                      <div className="chat-suggestions">
                        {(aiFollowUps.length > 0 ? aiFollowUps : AI_PROMPTS).map((chipText) => (
                          <button
                            key={chipText}
                            type="button"
                            onClick={() => submitAiPrompt(chipText)}
                            disabled={aiBusy}
                            className="chat-chip"
                          >
                            {chipText}
                          </button>
                        ))}
                      </div>
                    )}

                    <form
                      className="chat-composer"
                      onSubmit={(event) => {
                        event.preventDefault()
                        submitAiPrompt()
                      }}
                    >
                      <input
                        value={aiInput}
                        onChange={(event) => setAiInput(event.target.value)}
                        disabled={aiBusy}
                        placeholder={
                          aiBusy
                            ? 'SILAQ Insight sedang menganalisis…'
                            : 'Tanyakan kunjungan, kapasitas, atau kebijakan…'
                        }
                        aria-label="Pertanyaan untuk asisten analitik"
                        className="chat-input"
                      />
                      <button
                        type="submit"
                        disabled={aiBusy}
                        className="app-button app-button-primary"
                        aria-label="Kirim pertanyaan"
                      >
                        {aiBusy ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </div>

                  <aside className="ai-insight-rail">
                    <p className="ai-rail-title">Sumber analisis</p>
                    <ul className="ai-rail-list">
                      <li>
                        <span>Transaksi ekosistem</span>
                        <strong>18.420</strong>
                      </li>
                      <li>
                        <span>Node gate aktif</span>
                        <strong>48 / 48</strong>
                      </li>
                      <li>
                        <span>Mitra & destinasi</span>
                        <strong>45 · 12</strong>
                      </li>
                      <li>
                        <span>Prakiraan BMKG</span>
                        <strong>real-time</strong>
                      </li>
                    </ul>

                    <p className="ai-rail-title">Pipeline analisis</p>
                    <div className="ai-pipeline-compact">
                      {(genStep !== null ? GENERATION_STEPS : ['Semua data tersinkron', 'Model prediksi siap', 'Menunggu perintah']).map(
                        (label, index) => {
                          const isRunning = genStep !== null && index === genStep
                          const isDone = genStep !== null && index < genStep
                          return (
                            <span
                              key={label}
                              className={`ai-pipeline-step ${
                                isRunning ? 'is-active' : isDone ? 'is-done' : ''
                              }`}
                            >
                              <span className="ai-step-icon">
                                {isDone ? (
                                  <CircleCheck className="h-3 w-3" />
                                ) : isRunning ? (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                ) : (
                                  index + 1
                                )}
                              </span>
                              {label}
                            </span>
                          )
                        }
                      )}
                    </div>
                  </aside>
                </div>
              </article>

              {/* WEEKLY SYNTHESIS */}
              <article className="panel-card">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Sintesis laporan AI mingguan</h2>
                    <p className="panel-subtitle">
                      Analisis otomatis dari 18.000+ data transaksi se-Lombok · versi{' '}
                      {reportIndex + 1} dari {REPORT_VARIANTS.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={genStep !== null}
                    className="app-button app-button-primary"
                  >
                    <RefreshCw className={`h-4 w-4 ${genStep !== null ? 'animate-spin' : ''}`} />
                    {genStep !== null
                      ? GENERATION_STEPS[genStep]
                      : 'Generate laporan baru'}
                  </button>
                </div>

                {genStep !== null ? (
                  <div className="ai-pipeline">
                    {GENERATION_STEPS.map((label, index) => {
                      const isRunning = index === genStep
                      const isDone = index < genStep
                      return (
                        <div
                          key={label}
                          className={`ai-pipeline-step ${
                            isRunning ? 'is-active' : isDone ? 'is-done' : ''
                          }`}
                        >
                          <span className="ai-step-icon">
                            {isDone ? (
                              <CircleCheck className="h-3 w-3" />
                            ) : isRunning ? (
                              <LoaderCircle className="h-3 w-3 animate-spin" />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <span className="flex-1">{label}</span>
                          <small>{isDone ? 'Selesai' : isRunning ? 'Berjalan' : 'Antre'}</small>
                        </div>
                      )
                    })}
                    <div className="mt-1 grid gap-2">
                      <span className="ai-skeleton h-3 w-2/5" />
                      <span className="ai-skeleton h-3 w-4/5" />
                      <span className="ai-skeleton h-3 w-3/5" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-3">
                    {REPORT_VARIANTS[reportIndex].map((f) => (
                      <div key={f.title} className="bg-white p-4">
                        <strong className="block text-sm text-slate-900">{f.title}</strong>
                        <p className="mt-1.5 text-xs leading-5 text-slate-600">{f.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          )}

          {/* TAB 3: MITRA & ADMIN */}
          {activeNav === 'Mitra & Admin' && (
            <article className="panel-card p-0 overflow-hidden">
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="panel-title">Meja verifikasi &amp; direktori mitra</h2>
                  <p className="panel-subtitle">
                    Pemeriksaan perizinan dan kelayakan pengelola wisata NTB
                  </p>
                </div>
                <div className="segmented">
                  {(['Semua', 'Online', 'Review', 'Pending'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setPartnerFilter(st)}
                      className={partnerFilter === st ? 'active' : ''}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Badan pengelola / mitra</th>
                      <th>Destinasi &amp; wilayah</th>
                      <th>PIC kontak</th>
                      <th className="text-right">Pengunjung / bln</th>
                      <th>Status izin</th>
                      <th>Aksi otoritas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          {p.destination}
                          <span className="block text-xs text-slate-400">{p.region}</span>
                        </td>
                        <td>
                          {p.contactPerson}
                          <span className="num block text-xs text-slate-400">{p.phone}</span>
                        </td>
                        <td className="text-right num">
                          {p.visitorsMonthly.toLocaleString('id-ID')}
                        </td>
                        <td>
                          <span className={partnerChipClass(p.status)}>
                            {partnerStatusLabel(p.status)}
                          </span>
                        </td>
                        <td>
                          {p.status !== 'Online' ? (
                            <button
                              onClick={() => handleApprovePartner(p.id, p.name)}
                              className="app-button app-button-primary px-3 py-1.5 text-xs"
                            >
                              Setujui izin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReviewPartner(p.id, p.name)}
                              className="app-button app-button-secondary px-3 py-1.5 text-xs"
                            >
                              Evaluasi
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredPartners.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400">
                          Tidak ada mitra pada filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* TAB 4: DESTINASI */}
          {activeNav === 'Destinasi' && (
            <div className="grid gap-5 md:grid-cols-2">
              {INITIAL_DESTINATIONS.map((d: Destination) => (
                <div key={d.id} className="destination-admin-card">
                  <img src={d.image} alt={d.name} />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="inline-block rounded bg-ocean-50 px-1.5 py-0.5 text-[11px] font-semibold text-ocean-700">
                        {d.category}
                      </span>
                      <h3 className="mt-1.5">{d.name}</h3>
                      <p>{d.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2.5">
                      <div>
                        <span className="dest-label">Rating</span>
                        <strong className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {d.rating} <span className="font-normal text-slate-400">({d.reviewsCount})</span>
                        </strong>
                      </div>
                      <div>
                        <span className="dest-label">Tarif masuk</span>
                        <strong>Rp {d.price.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: TRANSAKSI */}
          {activeNav === 'Transaksi' && (
            <div className="space-y-5">
              <article className="panel-card">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Bagi hasil ekosistem pariwisata</h2>
                    <p className="panel-subtitle">
                      92% hak mitra destinasi · 8% retribusi PAD &amp; server NTB
                    </p>
                  </div>
                  <button
                    onClick={() => setNotice('Disbursement batch Bank NTB Syariah diproses.')}
                    className="app-button app-button-primary"
                  >
                    Proses settlement semua
                  </button>
                </div>

                <div className="metric-strip">
                  <div>
                    <span className="metric-label">Omset tiket ekosistem</span>
                    <strong className="metric-value num">Rp 4,82 miliar</strong>
                    <span className="metric-note">Periode 1–28 Februari 2026</span>
                  </div>
                  <div>
                    <span className="metric-label">Penyaluran ke mitra (92%)</span>
                    <strong className="metric-value num">Rp 4,43 miliar</strong>
                    <span className="metric-note positive">Siap dicairkan</span>
                  </div>
                  <div>
                    <span className="metric-label">PAD &amp; platform (8%)</span>
                    <strong className="metric-value num">Rp 385,6 jt</strong>
                    <span className="metric-note">Retribusi daerah</span>
                  </div>
                  <div>
                    <span className="metric-label">Settlement berikutnya</span>
                    <strong className="metric-value num">20 Feb</strong>
                    <span className="metric-note">Bank NTB Syariah</span>
                  </div>
                </div>
              </article>

              <article className="panel-card p-0 overflow-hidden">
                <div className="px-5 py-4">
                  <h3 className="panel-title">Transaksi ekosistem terkini</h3>
                  <p className="panel-subtitle">
                    {INITIAL_TRANSACTIONS.length} transaksi terakhir se-NTB
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID transaksi</th>
                        <th>Pengunjung</th>
                        <th>Mitra</th>
                        <th>Kanal</th>
                        <th className="text-right">Nilai</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_TRANSACTIONS.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong className="num">{t.id}</strong>
                          </td>
                          <td>{t.customerName}</td>
                          <td>{t.partnerName}</td>
                          <td className="text-xs text-slate-500">{t.channel}</td>
                          <td className="text-right num">
                            Rp {t.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <span
                              className={
                                t.status === 'Berhasil'
                                  ? 'table-status'
                                  : t.status === 'Check-in'
                                  ? 'table-status table-status-info'
                                  : t.status === 'Diproses'
                                  ? 'table-status table-status-pending'
                                  : 'table-status table-status-danger'
                              }
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {/* TAB 6: LAPORAN */}
          {activeNav === 'Laporan' && (
            <div className="space-y-5">
              <article className="panel-card">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Laporan keberlanjutan ESG &amp; demografi</h2>
                    <p className="panel-subtitle">
                      Komposisi wisatawan dan program lingkungan berjalan
                    </p>
                  </div>
                  <button
                    onClick={() => setNotice('Laporan ESG & audit pariwisata NTB diunduh.')}
                    className="app-button app-button-primary"
                  >
                    <Download className="h-4 w-4" />
                    Unduh laporan
                  </button>
                </div>

                <div className="metric-strip metric-strip-2">
                  <div>
                    <span className="metric-label">Wisatawan Nusantara (WNI)</span>
                    <strong className="metric-value num">72%</strong>
                    <span className="metric-note">20.513 wisatawan terdaftar</span>
                  </div>
                  <div>
                    <span className="metric-label">Mancanegara (WNA)</span>
                    <strong className="metric-value num">28%</strong>
                    <span className="metric-note">7.977 wisatawan terdaftar</span>
                  </div>
                </div>
              </article>

              <article className="panel-card p-0 overflow-hidden">
                <div className="px-5 py-4">
                  <h3 className="panel-title">Program lingkungan berjalan</h3>
                  <p className="panel-subtitle">
                    Kontribusi ekosistem terhadap kompensasi karbon
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th className="text-right">Realisasi</th>
                        <th className="text-right">Dampak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Restorasi mangrove Gili Air</strong>
                          <span className="block text-xs text-slate-500">
                            Kepulauan Gili, Lombok Utara
                          </span>
                        </td>
                        <td className="text-right num">1.240 pohon tertanam</td>
                        <td className="text-right num">6.448 kg CO₂</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Adopsi pohon lereng Rinjani</strong>
                          <span className="block text-xs text-slate-500">
                            Sembalun, Lombok Timur
                          </span>
                        </td>
                        <td className="text-right num">820 pohon tertanam</td>
                        <td className="text-right num">3.910 kg CO₂</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {/* TAB 7: PENGATURAN */}
          {activeNav === 'Pengaturan' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="panel-card">
                <h2 className="panel-title">Pengaturan sistem pusat</h2>
                <p className="panel-subtitle">Konfigurasi dinas pariwisata provinsi NTB</p>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="field-label">Penanggung jawab sistem</span>
                    <input
                      type="text"
                      defaultValue="Nadia Permata, M.Par"
                      className="field-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Endpoint sinkronisasi IoT gate</span>
                    <input
                      type="text"
                      defaultValue="https://iot.lomboktrip.ntbprov.go.id/v2/stream"
                      className="field-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Email notifikasi insiden</span>
                    <input
                      type="email"
                      defaultValue="ops@silaq.ntbprov.go.id"
                      className="field-input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotice('Pengaturan sistem pusat berhasil diperbarui.')}
                    className="app-button app-button-primary"
                  >
                    Simpan perubahan
                  </button>
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Integrasi layanan</h2>
                <p className="panel-subtitle">Layanan eksternal yang terhubung ke SILAQ</p>
                <div className="mt-4">
                  {[
                    { name: 'Gateway pembayaran QRIS', status: 'Terhubung' },
                    { name: 'BMKG cuaca & gelombang', status: 'Terhubung' },
                    { name: 'Bank NTB Syariah settlement', status: 'Terhubung' },
                    { name: 'SIAK pusat (kunjungan wisatawan)', status: 'Dalam tinjauan' }
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0" // taste-skill-ignore
                    >
                      <strong className="text-sm text-slate-800">{svc.name}</strong>
                      <span
                        className={
                          svc.status === 'Terhubung'
                            ? 'table-status'
                            : 'table-status table-status-pending'
                        }
                      >
                        {svc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
