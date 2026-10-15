'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Compass,
  Calendar,
  Sparkles,
  TreePine,
  User,
  Search,
  MapPin,
  Star,
  Ticket,
  QrCode,
  ArrowRight,
  Check,
  Share2,
  Download,
  Send,
  Bot,
  Clock,
  Heart,
  ChevronRight,
  X,
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  ExternalLink,
  House,
  LoaderCircle,
  CircleCheck,
  RefreshCw
} from 'lucide-react'
import {
  INITIAL_DESTINATIONS,
  INITIAL_EVENTS,
  CARBON_PROJECTS
} from '@/lib/smart-tourism-data'
import { AiAnswer, useAiAssistant } from '@/lib/ai-assistant'
import { Destination, TicketTier } from '@/types/smart-tourism'

interface ConsumerAppProps {
  onLogout: () => void
}

type ConsumerPage = 'Beranda' | 'Jelajahi' | 'Perjalanan' | 'Tiket Saya' | 'Kalender' | 'AI Guide' | 'Pemesanan'

const AI_STAGES = [
  'Menganalisis pertanyaanmu…',
  'Menelusuri data destinasi, tiket & event…',
  'Menyusun rekomendasi terbaik…',
]

const INITIAL_MESSAGES = [
  {
    from: 'ai' as const,
    text: 'Halo Reza, saya AI Guide SILAQ. Saya bisa membantu membuat itinerary, mencari transportasi, atau memberi rekomendasi lokal.',
  },
]

const DEFAULT_PROMPTS = [
  'Buat itinerary 1 hari di Sembalun',
  'Rekomendasi pantai tersembunyi',
  'Sewa motor atau mobil dengan sopir?',
  'Berapa budget 3 hari 2 orang?',
]

function buildConsumerAnswer(raw: string, date: string): AiAnswer {
  const q = raw.toLowerCase().trim()

  if (
    /^(halo|hai|hi|hello|pagi|siang|sore|malam|terima kasih|makasih)\b/.test(q) &&
    q.split(' ').length <= 5
  ) {
    return {
      text: `Halo! Saya AI Guide SILAQ. Untuk kunjungan ${date} saya bisa bantu tiga hal: menyusun itinerary, menghitung budget, atau memilih destinasi sesuai gaya perjalananmu. Semua tiket di sini berupa e-ticket QR jadi tidak perlu antre di loket.`,
      followUps: ['Buat itinerary 1 hari', 'Berapa budget 3 hari 2 orang?', 'Destinasi rating tertinggi'],
    }
  }

  if (/itinerary|itenerary|rute|rencana|jadwal|agenda|susun/.test(q)) {
    return {
      text: `Rencana 1 hari untuk ${date}:\n08.00 — Desa Adat Sade, dipandu warga lokal (Rp 35.000)\n11.30 — Makan siang ayam Taliwang di kawasan Pujut\n13.00 — Pantai Kuta Mandalika (Rp 50.000)\n16.00 — Trekking singkat Bukit Merese\n18.00 — Sunset di Pantai Tanjung Aan (Rp 20.000)\n\nEstimasi Rp 425.000 per orang, sudah termasuk sewa mobil dengan sopir 10 jam. Mau saya buatkan versi 3 hari 2 malam?`,
      followUps: ['Versi 3 hari 2 malam', 'Rute fokus budaya', 'Tambah snorkeling di Gili'],
    }
  }

  if (/transport|transportasi|mobil|motor|sopir|bandara|taksi|shuttle|kendaraan|jalan/.test(q)) {
    return {
      text: 'Opsi bertransportasi di Lombok:\n• Bandara → Mandalika: shuttle resmi Rp 75.000/orang, 30 menit\n• Sewa mobil + sopir: Rp 550.000 per 10 jam, sudah termasuk bahan bakar\n• Sewa motor: Rp 75.000–100.000/hari, helm disediakan\n• Antar gili: kapal tradisional dari Bangsal Rp 15.000–25.000 sekali jalan\n\nUntuk 4 destinasi dalam satu hari, mobil dengan sopir paling efisien dan tidak perlu repot parkir.',
      followUps: ['Sewa mobil untuk 2 hari', 'Jadwal kapal ke Gili', 'Rute dari bandara'],
    }
  }

  if (/pantai|gili|snorkel|diving|bahari|sunset|laut|pulau/.test(q)) {
    return {
      text: 'Pantai & gili dengan rating tertinggi:\n• Gili Trawangan (4.9) — Rp 150.000, snorkeling + sunset bar\n• Gili Air (4.8) — Rp 100.000, island hopping 3 gili Rp 190.000\n• Pantai Tanjung Aan (4.8) — Rp 20.000, pasir putih & Bukit Merese\n• Pantai Pink Tangsi (4.7) — Rp 25.000, sepi dan masih alami\n\nTips: sunset terbaik di Tanjung Aan pukul 17.00. Untuk snorkeling, ambil VIP Fast Boat di Gili Trawangan — sisa kuota hari ini tinggal 42 dari 200.',
      followUps: ['Snorkeling Gili Air', 'Pantai paling sepi', 'Sunset spot terbaik'],
    }
  }

  if (/budaya|desa|sade|sasak|tenun|tradisi|adat|sejarah/.test(q)) {
    return {
      text: 'Desa Adat Sade di Rambitan adalah pilihan budaya paling autentik, hanya 30 menit dari Bandara.\n• Tiket masuk & edukasi adat: Rp 35.000 (dipandu warga desa)\n• Paket belajar tenun + suvenir: Rp 95.000, kelas 45 menit\n• Rating 4,9 dari 1.200+ ulasan\n\nBisa digabung rute dengan Kuta Mandalika karena masih satu koridor. Datang pagi hari supaya rumah adat dan aktivitas warga masih ramai.',
      followUps: ['Gabung Sade + Mandalika', 'Jadwal budaya minggu ini', 'Workshop tenun'],
    }
  }

  if (/rinjani|gunung|pendakian|pendaki|sembalun|trekking|hiking|simaksi/.test(q)) {
    return {
      text: 'Taman Nasional Gunung Rinjani (rating 4,8):\n• Simaksi WNI 2H1M: Rp 175.000\n• Porter & Guide Certified: Rp 450.000 (tersisa 19 kuota hari ini)\n\nJalur Sembalun menuntut pendakian 2 hari 1 malam dengan pendaftaran wajib lewat operator resmi. Bawa jaket tebal — suhu puncak malam bisa menyentuh 5°C. Alternatif ringan: Panorama Tour Sembalun setengah hari.',
      followUps: ['Paket porter & guide', 'Trekking setengah hari', 'Cek cuaca Rinjani'],
    }
  }

  if (/air terjun|sendang|tiu kelep|waterfall/.test(q)) {
    return {
      text: 'Air Terjun Sendang Gile & Tiu Kelep di Senaru, rating 4,8 dengan tiket masuk Rp 40.000. Treknya landai sekitar 20 menit dari pos, cocok untuk pemula dan keluarga.\n\nSisa kuota hari ini 240 dari 600. Kombinasikan dengan kunjungan ke Gili Trawangan karena sama-sama di Lombok Utara.',
      followUps: ['Rute Lombok Utara 1 hari', 'Liburan bersama keluarga', 'Air terjun lain'],
    }
  }

  if (/kuliner|makan|masakan|seafood|restoran|kopi|jajan|cemilan|halal/.test(q)) {
    return {
      text: 'Kuliner wajib selama di Lombok:\n• Ayam Taliwang — pedas manis, khas Sumbawa, tersedia di koridor Pujut\n• Plecing kangkung — pendamping khas Lombok Barat\n• Sate ikan tanjung — ikan segar hasil tangkapan nelayan\n• Seafood bakar Ampenan — paling ramai pukul 17.00–20.00\n\nBudget kuliner realistis Rp 400.000/hari untuk berdua, sudah termasuk kopi manual brew.',
      followUps: ['Rekomendasi dekat Kuta', 'Sarapan halal dekat hotel', 'Tempat makan sunset'],
    }
  }

  if (/cuaca|hujan|panas|musim|ombak|gelombang|badai|bmkg/.test(q)) {
    return {
      text: `Cuaca ${date}: cerah berawan, 28–31°C, peluang hujan di bawah 20%. Angin bertiup sedang dari arah barat.\n\nPerhatian: ketinggian gelombang Selat Lombok diperkirakan naik 1,2 m sekitar pukul 16.30. Penyeberangan ke Gili sebaiknya dijadwalkan sebelum pukul 15.00 agar perjalanan tetap nyaman.`,
      followUps: ['Jadwal kapal ke Gili', 'Pantai untuk cuaca panas', 'Batal tiket karena cuaca'],
    }
  }

  if (/budget|biaya|harga|murah|hemat|uang|cost|bayar/.test(q)) {
    return {
      text: 'Estimasi hemat 3 hari 2 malam untuk 2 orang:\n• Homestay: Rp 350.000/malam\n• Mobil + sopir 2 hari: Rp 1.100.000\n• Tiket destinasi: Rp 300.000/orang\n• Kuliner: Rp 400.000/hari\n\nTotal sekitar Rp 3,9 juta untuk berdua, atau Rp 1,95 juta per orang. Paket VIP sering lebih hemat karena fast boat dan pemandu sudah termasuk.',
      followUps: ['Paket paling hemat', 'Budget 5 hari', 'Tiket promo minggu ini'],
    }
  }

  if (/event|festival|bau nyale|konser|jazz|marathon|lomba|agenda acara/.test(q)) {
    return {
      text: `Agenda besar sekitar ${date}:\n• Festival Pesona Bau Nyale 2026 — Mandalika, puncak 24–26 Februari\n• Senggigi Sunset Jazz Festival — Lombok Barat\n• Rinjani Geopark Ultra Marathon — Lombok Timur\n\nLonjakan booking Bau Nyale diprediksi +340% di kawasan Mandalika. Kuota parkir zona Pantai Seger terbatas, jadi sebaiknya tiket dipesan dari sekarang.`,
      followUps: ['Pesan tiket festival', 'Agenda pekan ini', 'Aktifkan pengingat event'],
    }
  }

  if (/hotel|penginapan|villa|homestay|inap|menginap|akomodasi/.test(q)) {
    return {
      text: `Rekomendasi menginap sesuai gaya perjalanan:\n• Kuta Mandalika — dekat pantai dan arena, paling strategis untuk aktivitas\n• Senggigi — sisi barat, sunset dan akses mudah ke Gili\n• Sembalun — sejuk, cocok sebelum pendakian Rinjani\n• Homestay Desa Sade — pengalaman budaya menginap di desa adat\n\nUntuk ${date} masih tersedia homestay dengan tarif mulai Rp 350.000 per malam.`,
      followUps: ['Homestay dekat pantai', 'Hotel untuk keluarga', 'Penginapan dekat Rinjani'],
    }
  }

  if (/keluarga|anak|balita|dengan anak|orang tua/.test(q)) {
    return {
      text: 'Untuk perjalanan keluarga, urutan paling aman:\n1. Pantai Kuta Mandalika — fasilitas lengkap, ombak tenang\n2. Gili Air — lebih santai dibanding Gili Trawangan\n3. Air Terjun Sendang Gile — jalur setapak mudah, teduh\n\nSebaiknya hindari pendakian Rinjani dan perjalanan kapal sore hari. Siapkan topi, sunscreen, dan air minum karena jarak antar destinasi cukup jauh.',
      followUps: ['Itinerary keluarga 2 hari', 'Tiket ramah anak', 'Destinasi tanpa trekking'],
    }
  }

  if (/pasangan|honeymoon|romantis|berdua|pacar|anniversary|lunas/.test(q)) {
    return {
      text: 'Untuk perjalanan berdua:\n• Sunset Bukit Merese + Pantai Tanjung Aan — paling intim sore hari\n• Gili Nanggu — private island feel, Rp 150.000 per orang\n• Senggigi Sunset Jazz Festival — suasana romantis bermalam\n\nKalau mau sekalian, saya bisa susun rute dua hari dengan makan malam seafood di Ampenan.',
      followUps: ['Rute romantis 2 hari', 'Sunset spot terbaik', 'Makan malam romantis'],
    }
  }

  if (/tiket|qr|pembayaran|qris|transfer|kartu|refund|batal/.test(q)) {
    return {
      text: 'Pembayaran di SILAQ mendukung QRIS, kartu debit/kredit, dan transfer Bank NTB Syariah. E-ticket QR langsung aktif begitu pembayaran terkonfirmasi — tunjukkan QR-nya di gate, rata-rata validasi hanya 1,8 detik.\n\nTiket bisa diunduh ulang dari menu Tiket Saya dan berlaku sesuai tanggal kunjungan yang dipilih.',
      followUps: ['Cek tiket saya', 'Ganti tanggal kunjungan', 'Unduh e-ticket'],
    }
  }

  if (/karbon|hijau|eco|lingkungan|offset|mangrove|sustainable/.test(q)) {
    return {
      text: 'Jejak karbon perjalananmu tercatat 12,5 kg CO₂, turun 15% dari trip sebelumnya. Kamu bisa meng-offset dengan menanam satu mangrove di Gili Air senilai Rp 25.000 (setara 6.448 kg CO₂ dari program restorasi berjalan).\n\nPilih destinasi berjalan kaki seperti Desa Sade atau Tanjung Aan untuk memperkecil emisi harian.',
      followUps: ['Offset karbon sekarang', 'Lihat laporan karbon', 'Destinasi rendah emisi'],
    }
  }

  return {
    text: `Berdasarkan pertanyaanmu, tiga opsi paling relevan untuk ${date}:\n• Gili Trawangan (4,9 · Rp 150.000) — untuk aktivitas bahari\n• Desa Adat Sade (4,9 · Rp 35.000) — untuk pengalaman budaya\n• Sembalun, Rinjani (4,8 · Rp 175.000) — untuk suasana pegunungan\n\nSemua bisa langsung dipesan dengan e-ticket QR. Mau saya susun rute lengkap sesuai tanggal pilihanmu?`,
    followUps: ['Susun rute lengkap', 'Rekomendasi rating tertinggi', 'Destinasi paling dekat'],
  }
}

export default function ConsumerApp({ onLogout }: ConsumerAppProps) {
  const [page, setPage] = useState<ConsumerPage>('Beranda')
  const [category, setCategory] = useState('Semua')
  const [query, setQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('28 Feb 2026')
  const [dateOpen, setDateOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination>(
    INITIAL_DESTINATIONS[0]
  )
  const [quantity, setQuantity] = useState(2)
  const [ticketType, setTicketType] = useState('VIP')
  const [agendaDay, setAgendaDay] = useState('28 Feb')
  const [saved, setSaved] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [overview, setOverview] = useState<Destination | null>(null)
  const [consumerMenu, setConsumerMenu] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const chatRef = useRef<HTMLDivElement | null>(null)

  const {
    messages,
    stage,
    streaming,
    followUps,
    isThinking,
    isBusy,
    send,
    reset: resetChat,
  } = useAiAssistant({
    initialMessages: INITIAL_MESSAGES,
    stages: AI_STAGES,
    answer: (input) => buildConsumerAnswer(input, selectedDate),
  })

  const nav: [ConsumerPage, string][] = [
    ['Beranda', 'home'],
    ['Jelajahi', 'search'],
    ['Perjalanan', 'location'],
    ['Tiket Saya', 'ticket'],
    ['Kalender', 'calendar'],
  ]

  const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    home: House,
    search: Search,
    location: MapPin,
    ticket: Ticket,
    calendar: Calendar,
  }

  useEffect(() => {
    if (page !== 'AI Guide') return
    const node = chatRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [page, messages, streaming, stage])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page])

  const openBooking = (destination: Destination) => {
    setSelectedDestination(destination)
    setPage('Pemesanan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitPrompt = (text = aiInput) => {
    if (!text.trim() || isBusy) return
    send(text)
    setAiInput('')
  }

  const basePrice =
    ticketType === 'VIP' ? 250000 : ticketType === 'Weekend' ? 200000 : 150000
  const totalPrice = basePrice * quantity + 5000

  // Filter destinations
  const filteredDestinations = INITIAL_DESTINATIONS.filter((item) => {
    const matchCat =
      category === 'Semua'
        ? true
        : category === 'Pantai & Gili'
        ? item.category === 'Pantai' || item.category === 'Gili'
        : category === 'Pegunungan'
        ? item.category === 'Gunung' || item.category === 'Air Terjun'
        : item.category === category
    const matchQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQuery
  })

  const renderHome = () => (
    <>
      <section className="consumer-hero">
        <img
          src="https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=1600&h=1000&fit=crop&auto=format"
          alt="Pemandangan pantai Lombok"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
        <div className="consumer-container consumer-hero-inner relative z-10">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-300">
              <span className="h-px w-8 bg-sky-300" />
              Temukan sisi terbaik Lombok
            </p>
            <h1 className="font-display text-3xl font-semibold leading-[1.12] text-white sm:text-4xl md:text-6xl">
              Satu pulau, ribuan cerita untuk dijelajahi.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              Rencanakan perjalanan personal dengan rekomendasi lokal, tiket
              resmi, dan AI Guide yang selalu siap membantu.
            </p>
            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
              <label className="flex flex-1 items-center gap-3 px-3 py-2 cursor-pointer">
                <Search className="h-5 w-5 text-ocean-500 shrink-0" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mau ke mana?
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                    placeholder="Cari pantai, gunung, atau event"
                  />
                </span>
              </label>
              <span className="hidden w-px bg-slate-200 sm:block" />
              <button
                type="button"
                onClick={() => setDateOpen(true)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50 sm:w-44"
              >
                <Calendar className="h-5 w-5 text-ocean-500 shrink-0" />
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tanggal
                  </span>
                  <strong className="mt-1 block text-sm text-slate-800">
                    {selectedDate}
                  </strong>
                </span>
              </button>
              <button
                onClick={() => setPage('Jelajahi')}
                className="app-button app-button-primary justify-center px-7"
              >
                Cari
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="consumer-container py-12">
        {/* 3 Quick feature cards */}
        <section className="-mt-20 relative z-10 mb-14 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => openBooking(INITIAL_DESTINATIONS[0])}
            className="feature-card text-left"
          >
            <span className="feature-icon">
              <Ticket className="h-5 w-5 text-ocean-600" />
            </span>
            <span>
              <strong className="font-display text-base font-semibold text-slate-900">
                Pesan tiket resmi
              </strong>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                QR tiket langsung tersedia setelah pembayaran
              </span>
            </span>
            <ChevronRight className="ml-auto text-slate-300 h-5 w-5" />
          </button>

          <button
            onClick={() => setPage('AI Guide')}
            className="feature-card text-left"
          >
            <span className="feature-icon">
              <Sparkles className="h-5 w-5 text-ocean-600" />
            </span>
            <span>
              <strong className="font-display text-base font-semibold text-slate-900">
                Rencana dengan AI
              </strong>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Itinerary personal berdasarkan gaya perjalananmu
              </span>
            </span>
            <ChevronRight className="ml-auto text-slate-300 h-5 w-5" />
          </button>

          <button
            onClick={() =>
              setNotice(
                'Laporan karbon perjalanan: 12,5 kg CO₂, turun 15% dari trip sebelumnya.'
              )
            }
            className="feature-card text-left"
          >
            <span className="feature-icon">
              <TreePine className="h-5 w-5 text-ocean-600" />
            </span>
            <span>
              <strong className="font-display text-base font-semibold text-slate-900">
                Wisata lebih hijau
              </strong>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Pantau dan offset emisi perjalanan dengan mudah
              </span>
            </span>
            <ChevronRight className="ml-auto text-slate-300 h-5 w-5" />
          </button>
        </section>

        {/* Destinasi terbaik */}
        <section>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Pilihan wisatawan</p>
              <h2 className="section-title">Destinasi terbaik untukmu</h2>
              <p className="section-description">
                Rekomendasi kurasi berdasarkan lokasi, ulasan, dan musim kunjungan.
              </p>
            </div>
            <button
              onClick={() => setPage('Jelajahi')}
              className="app-button app-button-secondary"
            >
              Lihat semua destinasi
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {['Semua', 'Pantai & Gili', 'Pegunungan', 'Budaya'].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`category-chip ${
                  category === item ? 'category-chip-active' : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDestinations.map((item) => (
              <div
                key={item.id}
                className="destination-card flex cursor-pointer flex-col justify-between"
                role="button"
                tabIndex={0}
                onClick={() => setOverview(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOverview(item)
                  }
                }}
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSaved((curr) =>
                          curr.includes(item.name)
                            ? curr.filter((n) => n !== item.name)
                            : [...curr, item.name]
                        )
                      }}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-500"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          saved.includes(item.name) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-ocean-500" />
                      {item.location}
                    </p>
                    <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current mr-1" />
                          {item.rating}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{item.reviewsCount} Ulasan</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-ocean-600">
                        Lihat overview
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  data-ui
                  onClick={(e) => e.stopPropagation()}
                  className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mulai dari</span>
                    <strong className="font-display text-base text-slate-900">
                      Rp {item.price.toLocaleString('id-ID')}
                    </strong>
                    <span className="text-[10px] text-slate-400">/org</span>
                  </div>
                  <button
                    onClick={() => openBooking(item)}
                    className="app-button app-button-primary"
                  >
                    Pesan tiket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Journey & Carbon footprint section */}
        <section className="mt-16 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <article className="journey-card">
            <div className="relative z-10 max-w-md">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                Perjalanan aktif
              </span>
              <h2 className="font-display mt-5 text-3xl font-semibold text-white">
                Lombok escape, 5 hari
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Hari ke-3 dari 5. Festival Bau Nyale adalah agenda berikutnya.
              </p>
              <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/5 rounded-full bg-sunset-400" />
              </div>
              <button
                onClick={() => setPage('Perjalanan')}
                className="app-button app-button-cta mt-7"
              >
                <span>Lanjutkan perjalanan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          <article className="rounded-3xl border border-eco-100 bg-eco-50 p-7">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-500 text-white">
                <TreePine className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-eco-700">
                Eco-Warrior Lv. 2
              </span>
            </div>
            <h2 className="font-display mt-6 text-xl font-semibold text-slate-900">
              Jejak perjalananmu
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Emisi perjalanan saat ini 15% lebih rendah dari trip sebelumnya.
            </p>
            <div className="mt-6">
              <strong className="font-display text-4xl text-slate-950">
                12.5
              </strong>
              <span className="ml-2 text-sm font-semibold text-slate-500">
                kg CO₂
              </span>
            </div>
            <button
              onClick={() =>
                setNotice(
                  'Offset yang direkomendasikan: tanam satu mangrove di Gili Air senilai Rp 25.000.'
                )
              }
              className="app-button app-button-secondary mt-7 w-full justify-center border-eco-200 text-eco-700"
            >
              Lihat laporan karbon
            </button>
          </article>
        </section>
      </div>
    </>
  )

  const renderSimplePage = () => {
    if (page === 'Jelajahi') {
      return (
        <section className="consumer-container py-8 sm:py-12">
          <div className="mb-5">
            <p className="section-eyebrow">Jelajahi Lombok</p>
            <h2 className="section-title">
              {query ? `Hasil untuk “${query}”` : 'Semua destinasi'}
            </h2>
            <p className="section-description">
              Tersedia untuk kunjungan {selectedDate}. Pilih destinasi dan pesan tiket resmi.
            </p>
          </div>

          {/* Search bar — same builder as the homepage hero */}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setNotice(
                query.trim()
                  ? `Menampilkan destinasi untuk “${query.trim()}” pada ${selectedDate}.`
                  : `Menampilkan seluruh destinasi untuk ${selectedDate}.`
              )
            }}
            className="flex w-full flex-col gap-3 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:gap-0 sm:shadow-2xl"
          >
            <label className="flex flex-1 items-center gap-3 px-3 py-2 cursor-pointer">
              <Search className="h-5 w-5 text-ocean-500 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mau ke mana?
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                  placeholder="Cari pantai, gunung, atau event"
                />
              </span>
            </label>
            <span className="hidden w-px self-stretch bg-slate-200 sm:block" />
            <button
              type="button"
              onClick={() => setDateOpen(true)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50 sm:w-44"
            >
              <Calendar className="h-5 w-5 text-ocean-500 shrink-0" />
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tanggal
                </span>
                <strong className="mt-1 block text-sm text-slate-800">{selectedDate}</strong>
              </span>
            </button>
            <button
              type="submit"
              className="app-button app-button-primary justify-center px-7"
            >
              Cari
            </button>
          </form>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {['Semua', 'Pantai & Gili', 'Pegunungan', 'Budaya'].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`category-chip ${category === item ? 'category-chip-active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              <strong className="text-slate-800">{filteredDestinations.length}</strong>{' '}
              destinasi ditemukan · kuota tiket diperbarui real-time
            </span>
            {(query || category !== 'Semua') && (
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('Semua')
                }}
                className="font-bold text-ocean-600 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-600">
                <Search className="h-5 w-5" />
              </span>
              <h3 className="font-display mt-4 text-lg font-semibold text-slate-900">
                Destinasi tidak ditemukan
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Coba kata kunci lain seperti “Gili”, “Sembalun”, atau kembalikan ke kategori
                Semua untuk melihat seluruh destinasi resmi.
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('Semua')
                }}
                className="app-button app-button-primary mt-5"
              >
                Tampilkan semua destinasi
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDestinations.map((item) => (
                <div
                  key={item.id}
                  className="destination-card flex cursor-pointer flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  onClick={() => setOverview(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOverview(item)
                    }
                  }}
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 sm:h-48">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-bold text-white">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-xs text-slate-400">{item.location}</p>
                      <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                        {item.description}
                      </p>
                      <span className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-ocean-600">
                        Lihat overview
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <div
                    data-ui
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 pt-3 sm:p-5 sm:pt-3"
                  >
                    <div className="min-w-0">
                      <span className="block text-[10px] text-slate-400">Mulai dari</span>
                      <strong className="font-display text-base text-slate-900">
                        Rp {item.price.toLocaleString('id-ID')}
                      </strong>
                      <span className="text-[10px] text-slate-400">/org</span>
                    </div>
                    <button
                      onClick={() => openBooking(item)}
                      className="app-button app-button-primary"
                    >
                      Pesan tiket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (page === 'Perjalanan') {
      return (
        <section className="consumer-container py-12">
          <div className="mb-6">
            <p className="section-eyebrow">Riwayat kunjungan</p>
            <h2 className="section-title">Tempat yang sudah saya kunjungi</h2>
            <p className="section-description">
              Hanya menampilkan kunjungan yang tercatat melalui pemindaian tiket SILAQ.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <article className="panel-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h2 className="panel-title">History SILAQ</h2>
                  <p className="panel-subtitle">4 kunjungan terverifikasi</p>
                </div>
                <span className="rounded-full bg-eco-50 px-3 py-1.5 text-[10px] font-bold text-eco-700">
                  Data dari QR tiket
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {[
                  ['Gili Trawangan', '1 Mar 2026 · 09:12 WITA', 'Wisata bahari'],
                  ['Desa Sade', '28 Feb 2026 · 19:04 WITA', 'Wisata budaya'],
                  ['Mandalika Beach Park', '28 Feb 2026 · 15:38 WITA', 'Destinasi pantai'],
                  ['Festival Bau Nyale', '27 Feb 2026 · 08:21 WITA', 'Event lokal'],
                ].map(([place, visitedAt, cat], index) => (
                  <div key={place} className="visit-history-item">
                    <span className="visit-history-icon">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{place}</p>
                        {index === 0 && (
                          <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[9px] font-bold text-ocean-600">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{visitedAt}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{cat}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-eco-600">
                      <Check className="h-3 w-3" /> Terverifikasi
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card h-fit">
              <h3 className="panel-title">Ringkasan kunjungan</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ['4', 'Tempat'],
                  ['3', 'Wilayah'],
                  ['1.250', 'Poin'],
                  ['4', 'Tiket dipakai'],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="rounded-2xl bg-slate-50 p-4">
                    <strong className="font-display text-xl text-slate-900">{val}</strong>
                    <p className="mt-1 text-[11px] text-slate-400">{lbl}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPage('Tiket Saya')}
                className="app-button app-button-primary mt-5 w-full justify-center"
              >
                <Ticket className="h-4 w-4" />
                Lihat riwayat tiket
              </button>
            </article>
          </div>
        </section>
      )
    }

    if (page === 'Tiket Saya') {
      return (
        <section className="consumer-container py-12">
          <div className="mb-6">
            <p className="section-eyebrow">Digital ticket</p>
            <h2 className="section-title">Tiket Saya</h2>
            <p className="section-description">Tiket aktif dan riwayat pemesanan tersedia di sini.</p>
          </div>
          <article className="ticket-card mt-8">
            <div>
              <span className="table-status">Aktif</span>
              <h3 className="font-display mt-4 text-2xl font-semibold text-slate-900">
                {selectedDestination.name}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedDate} · {quantity} tiket {ticketType}
              </p>
              <p className="mt-6 font-mono text-sm font-bold tracking-widest text-ocean-600">
                LMBK-GILI-8A2F
              </p>
            </div>
            <div className="qr-demo">
              <QrCode className="h-20 w-20 text-ocean-600" />
            </div>
            <button
              onClick={() => setNotice('E-ticket berhasil disiapkan untuk diunduh.')}
              className="app-button app-button-secondary"
            >
              <Download className="h-4 w-4" />
              Unduh tiket
            </button>
          </article>
        </section>
      )
    }

    if (page === 'Kalender') {
      const agenda: Record<string, [string, string][]> = {
        '28 Feb': [
          ['15:30', 'Mandalika Beach Pass'],
          ['19:00', 'Sasak Cultural Night'],
        ],
        '1 Mar': [
          ['09:00', 'Gili Trawangan Day Pass'],
          ['13:00', 'Gili Snorkeling Experience'],
        ],
        '2 Mar': [['08:30', 'Festival Bau Nyale']],
        '3 Mar': [['09:00', 'Rinjani Panorama Tour']],
        '4 Mar': [['10:30', 'Workshop Kerajinan Sasak']],
      }
      const days = [
        ['Sab', '28 Feb', 'Hari 1'],
        ['Min', '1 Mar', 'Hari 2'],
        ['Sen', '2 Mar', 'Hari 3'],
        ['Sel', '3 Mar', 'Hari 4'],
        ['Rab', '4 Mar', 'Hari 5'],
      ]
      return (
        <section className="consumer-container py-12">
          <div className="mb-6">
            <p className="section-eyebrow">Kalender perjalanan</p>
            <h2 className="section-title">Aktivitas yang sudah dipesan</h2>
            <p className="section-description">
              Lihat tiket dan kegiatan berdasarkan tanggal serta jam pelaksanaannya.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <article className="panel-card h-fit">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ocean-600">28 Feb–4 Mar 2026</p>
                  <h2 className="font-display mt-1 text-lg font-semibold text-slate-900">
                    5 tanggal pesanan
                  </h2>
                </div>
                <span className="rounded-full bg-eco-50 px-3 py-1.5 text-[11px] font-bold text-eco-700">
                  Pesanan aktif
                </span>
              </div>
              <div className="mt-6 space-y-2">
                {days.map(([day, date, journeyDay]) => (
                  <button
                    key={date}
                    onClick={() => setAgendaDay(date)}
                    className={`calendar-day-row ${
                      agendaDay === date ? 'calendar-day-row-active' : ''
                    }`}
                  >
                    <span className="calendar-day-number">{date.split(' ')[0]}</span>
                    <span className="flex-1 text-left">
                      <strong className="block text-sm">{day}, {date} 2026</strong>
                      <small className="mt-1 block opacity-65">
                        {journeyDay} · {agenda[date]?.length || 0} pesanan
                      </small>
                    </span>
                    {date === '28 Feb' ? (
                      <span className="rounded-full bg-sunset-100 px-2 py-1 text-[9px] font-bold text-sunset-600">
                        Hari ini
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ocean-600">
                    {days.find((item) => item[1] === agendaDay)?.[2]}
                  </p>
                  <h2 className="font-display mt-1 text-xl font-semibold text-slate-900">
                    {days.find((item) => item[1] === agendaDay)?.[0]}, {agendaDay} 2026
                  </h2>
                </div>
                <button
                  onClick={() => setNotice(`Pengingat untuk ${agendaDay} berhasil diaktifkan.`)}
                  className="app-button app-button-secondary"
                >
                  <Bell className="h-4 w-4" />
                  Aktifkan pengingat
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {agenda[agendaDay]?.map(([time, title]) => (
                  <div key={`${time}-${title}`} className="agenda-item">
                    <div className="booking-time">
                      <strong>{time}</strong>
                      <span>WITA</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                      <p className="mt-1 text-xs text-slate-400">Tiket sudah dipesan</p>
                    </div>
                    <button
                      onClick={() => setPage('Tiket Saya')}
                      className="text-xs font-bold text-ocean-600 hover:underline"
                    >
                      Lihat tiket
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )
    }

    if (page === 'AI Guide') {
      const chips =
        followUps.length > 0 ? followUps : messages.length <= 1 ? DEFAULT_PROMPTS : []

      return (
        <section className="consumer-container py-8 sm:py-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">AI Guide</p>
              <h2 className="section-title">Tanya apa saja tentang Lombok</h2>
              <p className="section-description">
                Itinerary, transportasi, budget, hingga cuaca — dijawab berdasarkan data
                destinasi resmi.
              </p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              disabled={isBusy}
              className="app-button app-button-secondary"
            >
              <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
              Obrolan baru
            </button>
          </div>

          <div className="ai-guide-shell">
            <aside className="ai-guide-aside text-white">
              <span className="ai-kicker">
                <Sparkles className="h-3.5 w-3.5" /> Asisten Perjalanan
              </span>
              <h2 className="font-display mt-4 text-2xl font-semibold">AI Guide Lombok</h2>
              <p className="mt-2 text-xs leading-5 text-white/70">
                Dapatkan rekomendasi kuliner lokal, itinerary, transportasi, dan panduan cuaca.
              </p>
              <div className="mt-8 space-y-2">
                {DEFAULT_PROMPTS.map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => submitPrompt(promptText)}
                    disabled={isBusy}
                    className="ai-side-prompt disabled:opacity-60"
                  >
                    <span>{promptText}</span>
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  </button>
                ))}
              </div>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300/80">
                  Sumber data
                </p>
                <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-white/55">
                  <li>· 12 destinasi resmi & kuota tiket real-time</li>
                  <li>· Kalender event terintegrasi Dispar NTB</li>
                  <li>· Prakiraan cuaca & gelombang BMKG</li>
                </ul>
              </div>
            </aside>

            <div className="flex min-w-0 flex-col bg-slate-50">
              <div className="chat-head">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="chat-avatar chat-avatar-lg">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <strong>AI Guide SILAQ</strong>
                    <span className="chat-head-status">
                      <span className={`chat-online-dot ${isBusy ? 'is-busy' : ''}`} />
                      {isBusy ? stage ?? 'Mengetik…' : 'Terhubung · siap membantu'}
                    </span>
                  </div>
                </div>
                <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
                  {Math.max(messages.length - 1, 0)} pesan
                </span>
              </div>

              <div
                ref={chatRef}
                className="chat-scroll h-[360px] sm:h-[430px] xl:h-[490px]"
              >
                {messages.map((msg, i) => (
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
                      className={`chat-bubble ${msg.from === 'user' ? 'chat-bubble-user' : ''}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isThinking && (
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
                      <span className="chat-stage">{stage}</span>
                    </div>
                  </div>
                )}

                {streaming !== null && (
                  <div className="chat-row">
                    <span className="chat-avatar">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="chat-bubble">
                      {streaming}
                      <span className="chat-cursor" />
                    </div>
                  </div>
                )}
              </div>

              {chips.length > 0 && (
                <div className="chat-suggestions">
                  {chips.map((chipText) => (
                    <button
                      key={chipText}
                      type="button"
                      onClick={() => submitPrompt(chipText)}
                      disabled={isBusy}
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
                  submitPrompt()
                }}
              >
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  disabled={isBusy}
                  placeholder={
                    isBusy ? 'AI sedang menyusun jawaban…' : 'Ketik pertanyaan untuk AI Guide…'
                  }
                  aria-label="Pertanyaan untuk AI Guide"
                  className="chat-input"
                />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="app-button app-button-primary"
                  aria-label="Kirim pertanyaan"
                >
                  {isBusy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      )
    }

    if (page === 'Pemesanan') {
      return (
        <section className="consumer-container py-12">
          <div className="mb-6">
            <p className="section-eyebrow">Checkout Pemesanan</p>
            <h2 className="section-title">Detail Pemesanan Tiket</h2>
            <p className="section-description">
              Selesaikan pemesanan tiket resmi {selectedDestination.name}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <article className="panel-card space-y-6">
              <div>
                <h3 className="panel-title">1. Pilih Tipe Tiket</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Reguler', '150.000', 'Akses umum'],
                    ['VIP', '250.000', 'Fast boat + guide'],
                    ['Weekend', '200.000', 'Sabtu & Minggu'],
                  ].map(([tName, tPrice, tDesc]) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => setTicketType(tName)}
                      className={`ticket-option ${
                        ticketType === tName ? 'ticket-option-active' : ''
                      }`}
                    >
                      <strong className="text-sm font-semibold">{tName}</strong>
                      <span className="font-bold text-ocean-600">Rp {tPrice}</span>
                      <small className="text-[10px] text-slate-400 mt-1">{tDesc}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="panel-title">2. Jumlah Pengunjung</h3>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-button"
                  >
                    -
                  </button>
                  <strong className="text-lg font-bold">{quantity}</strong>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-button quantity-button-active"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400">Maksimal 10 tiket per transaksi</span>
                </div>
              </div>

              <div>
                <h3 className="panel-title">3. Tanggal Kunjungan</h3>
                <button
                  onClick={() => setDateOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700"
                >
                  <Calendar className="h-4 w-4 text-ocean-500" />
                  {selectedDate} (Ubah tanggal)
                </button>
              </div>
            </article>

            <article className="panel-card h-fit">
              <h3 className="panel-title">Ringkasan Biaya</h3>
              <div className="mt-4 space-y-2 text-xs border-b border-slate-100 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Tiket {ticketType} x {quantity}</span>
                  <strong>Rp {(basePrice * quantity).toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan & Asuransi</span>
                  <strong>Rp 5.000</strong>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Pembayaran:</span>
                <span className="text-ocean-600 font-display">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => {
                  setNotice('Pembayaran berhasil! Tiket digital telah diterbitkan.')
                  setPage('Tiket Saya')
                }}
                className="app-button app-button-primary mt-6 w-full justify-center py-3"
              >
                Bayar Sekarang
              </button>
            </article>
          </div>
        </section>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Consumer Header */}
      <header className="consumer-header">
        <div className="consumer-container flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConsumerMenu(true)}
              className="consumer-menu-trigger md:hidden"
              aria-label="Buka menu utama"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => setPage('Beranda')} className="flex items-center gap-2.5">
              <div className="logo-mark">
                <img src="/logo-silaq-icon.png" alt="" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-display text-lg font-bold text-slate-900 block leading-tight">
                  SILAQ
                </span>
                <span className="text-[10px] text-ocean-600 font-semibold uppercase tracking-wider block">
                  Wisatawan Portal
                </span>
              </div>
            </button>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([label]) => (
              <button
                key={label}
                onClick={() => setPage(label)}
                className={`consumer-nav ${
                  page === label ? 'consumer-nav-active' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setNotice(
                  'Pengingat Festival Bau Nyale aktif untuk besok pukul 07.00.'
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            </button>

            {/* User Profile & Logout Button (NO ROLE SWITCHER!) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-left">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&auto=format"
                  alt="Reza Pratama"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden sm:block">
                  <strong className="block text-xs text-slate-800">
                    Reza Pratama
                  </strong>
                  <span className="text-[10px] text-slate-400">Wisatawan</span>
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Keluar dari akun"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notice Pill */}
      {notice && (
        <div className="toast-message">
          <span>{notice}</span>
          <button onClick={() => setNotice('')}>Tutup</button>
        </div>
      )}

      {/* Mobile Drawer */}
      {consumerMenu && (
        <>
          <button
            className="consumer-drawer-overlay md:hidden"
            onClick={() => setConsumerMenu(false)}
            aria-label="Tutup menu utama"
          />
          <aside className="consumer-drawer md:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2.5">
                <div className="logo-mark">
                  <img src="/logo-silaq-icon.png" alt="" />
                </div>
                <span className="font-display text-base font-bold text-slate-900">
                  SILAQ
                </span>
              </div>
              <button
                onClick={() => setConsumerMenu(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {nav.map(([label]) => (
                <button
                  key={label}
                  onClick={() => {
                    setPage(label)
                    setConsumerMenu(false)
                  }}
                  className={`consumer-drawer-item ${
                    page === label ? 'consumer-drawer-item-active' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="consumer-drawer-logout"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar Akun
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="consumer-main">
        {page === 'Beranda' ? renderHome() : renderSimplePage()}
      </main>

      {/* Bottom navigation — mobile only */}
      <nav className="consumer-mobile-nav" aria-label="Navigasi utama wisatawan">
        {nav.map(([label, iconKey]) => {
          const IconComponent = navIcons[iconKey]
          const isActive = page === label
          return (
            <button
              key={label}
              onClick={() => setPage(label)}
              className={isActive ? 'is-active' : ''}
              aria-current={isActive ? 'page' : undefined}
            >
              {IconComponent && <IconComponent className="h-[18px] w-[18px]" />}
              <span>{label === 'Tiket Saya' ? 'Tiket' : label}</span>
            </button>
          )
        })}
      </nav>

      {/* Floating AI FAB — hidden while the assistant is open or a toast is showing */}
      {page !== 'AI Guide' && !notice && (
        <button
          onClick={() => setPage('AI Guide')}
          className="ai-fab"
          aria-label="Buka AI Guide"
        >
          <Sparkles className="h-4 w-4" />
          AI Guide
        </button>
      )}

      {/* Date Picker Modal */}
      {dateOpen && (
        <div className="modal-backdrop">
          <div className="calendar-modal">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display font-semibold text-slate-900 text-base">
                Pilih Tanggal Kunjungan
              </h3>
              <button onClick={() => setDateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {['28 Feb 2026', '1 Mar 2026', '2 Mar 2026', '3 Mar 2026', '4 Mar 2026', '5 Mar 2026'].map(
                (d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDate(d)
                      setDateOpen(false)
                      setNotice(`Tanggal kunjungan diubah ke ${d}`)
                    }}
                    className={`date-option ${
                      selectedDate === d ? 'date-option-active' : ''
                    }`}
                  >
                    <strong>{d.split(' ')[0]} {d.split(' ')[1]}</strong>
                    <small>{d.split(' ')[2]}</small>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overview Destinasi Modal */}
      {overview && (
        <div className="modal-backdrop" onClick={() => setOverview(null)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Overview destinasi ${overview.name}`}
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={overview.image}
                alt={overview.name}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" /* taste-skill-ignore: neutral scrim over photo */
              />
              <span className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-bold text-white">
                {overview.category}
              </span>
              <button
                onClick={() => setOverview(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 hover:text-slate-900"
                aria-label="Tutup overview"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-display text-2xl font-semibold text-white">
                  {overview.name}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/85">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {overview.location}
                  </span>
                  <span className="text-white/50">·</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {overview.rating} ({overview.reviewsCount} ulasan)
                  </span>
                </p>
              </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ocean-600">
                Overview destinasi
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {overview.description}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {overview.highlights.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    <Check className="h-3.5 w-3.5 flex-none text-ocean-600" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Alamat
                </p>
                <p className="mt-1.5 text-sm leading-5 text-slate-700">
                  {overview.address}
                </p>
                <a
                  href={overview.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ocean-600 hover:text-ocean-700"
                >
                  Buka di Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4">
                <div>
                  <span className="block text-[10px] text-slate-400">Tiket mulai dari</span>
                  <strong className="font-display text-lg text-slate-900">
                    Rp {overview.price.toLocaleString('id-ID')}
                    <span className="ml-0.5 text-xs font-normal text-slate-400">/org</span>
                  </strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOverview(null)}
                    className="app-button app-button-secondary"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      const destination = overview
                      setOverview(null)
                      openBooking(destination)
                    }}
                    className="app-button app-button-primary"
                  >
                    Pesan tiket
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
