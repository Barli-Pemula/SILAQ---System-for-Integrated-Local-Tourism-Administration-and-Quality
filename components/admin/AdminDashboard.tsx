'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Wallet,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Download,
  LogOut,
  User,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Printer,
  Receipt,
  FileSpreadsheet,
  Calendar
} from 'lucide-react'
import { INITIAL_DESTINATIONS, INITIAL_TRANSACTIONS } from '@/lib/smart-tourism-data'
import { Transaction, TicketTier } from '@/types/smart-tourism'

interface AdminDashboardProps {
  onLogout: () => void
}

const statusChipClass = (status: Transaction['status']) => {
  if (status === 'Berhasil') return 'table-status'
  if (status === 'Check-in') return 'table-status table-status-info'
  if (status === 'Diproses') return 'table-status table-status-pending'
  return 'table-status table-status-danger'
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeNav, setActiveNav] = useState('Ringkasan')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')

  // Live venue operations state (Gili Trawangan - BlueWater Lombok)
  const [gateOpen, setGateOpen] = useState(true)
  const [currentOccupancy, setCurrentOccupancy] = useState(684)
  const maxCapacity = 1000
  const occupancyRate = Math.round((currentOccupancy / maxCapacity) * 100)

  // Scanner state
  const [scanInputCode, setScanInputCode] = useState('')
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error' | null
    title?: string
    details?: string
    ticketData?: any
  }>({ status: null })

  // Ticket tier quota state
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(INITIAL_DESTINATIONS[0].ticketTiers)

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [trxFilter, setTrxFilter] = useState<'Semua' | 'Check-in' | 'Berhasil' | 'Diproses'>('Semua')

  // POS cashier state
  const [posTier, setPosTier] = useState(ticketTiers[0].name)
  const [posQty, setPosQty] = useState(1)
  const [posCustomer, setPosCustomer] = useState('')
  const [posPayment, setPosPayment] = useState<'QRIS' | 'Tunai / Kasir' | 'GoPay'>('QRIS')

  const navItems = [
    { label: 'Ringkasan', icon: LayoutDashboard },
    { label: 'Validasi QR & Scanner', icon: QrCode },
    { label: 'Tiket & Harga', icon: Wallet },
    { label: 'Kasir POS', icon: Receipt },
    { label: 'Laporan Harian', icon: FileSpreadsheet },
    { label: 'Pengaturan', icon: Settings }
  ]

  const filteredTransactions =
    trxFilter === 'Semua' ? transactions : transactions.filter((t) => t.status === trxFilter)

  // QR scanner simulation
  const handleSimulateScan = (code: string) => {
    setScanInputCode(code)
    if (code === 'GT-1048' || code === 'LMBK-GT-9082') {
      setScanResult({
        status: 'success',
        title: 'Validasi berhasil — tiket sah',
        details: '2 tiket VIP Fast Boat terverifikasi. Gelang VIP dapat diserahkan.',
        ticketData: { name: 'Nadya Putri', code: 'GT-1048', type: 'VIP Fast Boat', qty: 2 }
      })
      setCurrentOccupancy((prev) => Math.min(maxCapacity, prev + 2))
      setNotice('Tiket GT-1048 berhasil divalidasi dan tercatat di gate.')
    } else if (code === 'GT-1047' || code === 'LMBK-GT-8819') {
      setScanResult({
        status: 'warning',
        title: 'Tiket sudah pernah check-in',
        details: 'Tiket ini telah divalidasi sebelumnya pada 16:30 WITA di Gate 2.',
        ticketData: { name: 'Rizky Ananda', code: 'GT-1047' }
      })
      setNotice('Peringatan: Tiket GT-1047 sudah pernah dipakai check-in.')
    } else {
      setScanResult({
        status: 'error',
        title: 'Kode tiket tidak ditemukan',
        details: 'Pastikan QR berasal dari platform resmi SILAQ atau periksa kembali nomor pemesanan.'
      })
      setNotice('Validasi gagal: kode tiket tidak terdaftar.')
    }
  }

  // Handle POS issue ticket
  const handleIssuePosTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!posCustomer.trim()) {
      setNotice('Masukkan nama pengunjung terlebih dahulu.')
      return
    }
    const selected = ticketTiers.find((t) => t.name === posTier) || ticketTiers[0]
    const newTrx: Transaction = {
      id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: posCustomer,
      destination: 'Gili Trawangan',
      partnerName: 'BlueWater Express Lombok',
      ticketType: selected.name,
      quantity: posQty,
      totalAmount: selected.price * posQty,
      status: 'Check-in',
      timestamp: 'Hari ini, Baru saja',
      paymentMethod: posPayment,
      channel: 'Loket Destinasi (POS)',
      qrCode: `LMBK-POS-${Math.floor(1000 + Math.random() * 9000)}`
    }
    setTransactions([newTrx, ...transactions])
    setCurrentOccupancy((prev) => Math.min(maxCapacity, prev + posQty))
    setPosCustomer('')
    setNotice(`Tiket kasir ${newTrx.id} berhasil diterbitkan untuk ${newTrx.customerName}.`)
  }

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
              <span className="text-xs text-sky-400 block">Partner Hub</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            className="admin-drawer-close min-[1101px]:hidden"
            aria-label="Tutup menu admin"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sidebar-context">
          <strong>Admin Mitra</strong>
          <span>Gili Trawangan Operations</span>
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
              <p className="truncate text-sm font-semibold text-white">Adi Saputra</p>
              <p className="truncate text-xs text-slate-400">Admin Mitra</p>
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
            aria-label="Buka menu admin"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="admin-search">
            <Search className="h-4 w-4" />
            <span>Cari data, tiket, atau transaksi</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              Februari 2026
            </span>
            <button
              onClick={() => setNotice('Semua gerbang operasional dalam kondisi sinkron.')}
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
                {activeNav === 'Ringkasan'
                  ? 'Dashboard Operasional Destinasi'
                  : activeNav}
              </h1>
              <p>
                {activeNav === 'Ringkasan'
                  ? 'Kelola inventori tiket, pengunjung, dan aktivitas gate check-in hari ini.'
                  : `Kelola modul ${activeNav.toLowerCase()} dengan akses Admin Mitra.`}
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
                onClick={() => setNotice('Laporan harian mitra berhasil disiapkan untuk diunduh.')}
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

          {/* TAB 1: RINGKASAN OPERASIONAL */}
          {activeNav === 'Ringkasan' && (
            <div className="space-y-5">
              <section className={`operator-status-bar ${gateOpen ? 'is-open' : 'is-closed'}`}>
                <div className="flex items-center gap-4">
                  <div className="operator-live-icon">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Gerbang Dermaga Bangsal &amp; Penyeberangan Gili
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Status gate:{' '}
                      <span className="font-semibold text-slate-700">
                        {gateOpen ? 'Terbuka & siap validasi' : 'Ditutup sementara'}
                      </span>{' '}
                      · IoT Scanner v2.1
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setGateOpen(!gateOpen)
                      setNotice(gateOpen ? 'Gate ditutup sementara.' : 'Gate dibuka kembali.')
                    }}
                    className={`app-button ${gateOpen ? 'app-button-secondary' : 'app-button-cta'}`}
                  >
                    {gateOpen ? 'Tutup gate sementara' : 'Buka gate sekarang'}
                  </button>
                  <button
                    onClick={() => setActiveNav('Validasi QR & Scanner')}
                    className="app-button app-button-primary"
                  >
                    Buka scanner QR
                  </button>
                </div>
              </section>

              <section className="metric-strip">
                <div>
                  <span className="metric-label">Pengunjung hari ini</span>
                  <strong className="metric-value num">{currentOccupancy}</strong>
                  <span className="metric-note positive">+12,4% dibanding kemarin</span>
                </div>
                <div>
                  <span className="metric-label">Pendapatan hari ini</span>
                  <strong className="metric-value num">Rp 48,2 jt</strong>
                  <span className="metric-note positive">+8,6% dari target</span>
                </div>
                <div>
                  <span className="metric-label">Tiket terjual</span>
                  <strong className="metric-value num">684 / 1.000</strong>
                  <span className="metric-note">68,4% kuota terpesan</span>
                </div>
                <div>
                  <span className="metric-label">Okupansi kawasan</span>
                  <strong className="metric-value num">{occupancyRate}%</strong>
                  <span className="metric-note">Sisa {maxCapacity - currentOccupancy} slot</span>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                <article className="panel-card">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Kunjungan per jam (gate flow)</h2>
                      <p className="panel-subtitle">Performa kepadatan dermaga hari ini</p>
                    </div>
                    <span className="status-live">
                      <span /> Live sensor
                    </span>
                  </div>

                  <div
                    className="flex h-44 items-end gap-2 border-b border-slate-200 pb-2" // taste-skill-ignore
                  >
                    {[
                      { h: '08:00', val: 45 },
                      { h: '09:00', val: 85 },
                      { h: '10:00', val: 118, peak: true },
                      { h: '11:00', val: 96 },
                      { h: '12:00', val: 52 },
                      { h: '13:00', val: 68 },
                      { h: '14:00', val: 92 },
                      { h: '15:00', val: 104, peak: true },
                      { h: '16:00', val: 74 },
                      { h: '17:00', val: 32 }
                    ].map((item) => (
                      <div key={item.h} className="group flex h-full flex-1 flex-col items-center gap-1">
                        <span className="num text-[10px] font-semibold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                          {item.val}
                        </span>
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className={`w-full ${item.peak ? 'bg-ocean-700' : 'bg-ocean-400'}`}
                            style={{ height: `${(item.val / 120) * 100}%` }}
                          />
                        </div>
                        <span className="num text-[10px] text-slate-500">{item.h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 bg-ocean-400" />
                        Kunjungan reguler
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 bg-ocean-700" />
                        Puncak: 10:00 &amp; 15:00 WITA
                      </span>
                    </span>
                    <span className="font-semibold text-slate-700 num">
                      Rata-rata 76 wis./jam
                    </span>
                  </div>
                </article>

                <article className="panel-card">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Kapasitas tiket pulau</h2>
                      <p className="panel-subtitle">Status kuota operasional saat ini</p>
                    </div>
                    <span className="status-live">
                      <span /> Live
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-7">
                    <div className="donut">
                      <div>
                        <strong>{occupancyRate}%</strong>
                        <span>Terisi</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3.5">
                      {[
                        ['VIP Fast Boat', '42%', 'bg-ocean-600'],
                        ['Reguler Pass', '35%', 'bg-ocean-400'],
                        ['Weekend Pass', '23%', 'bg-ocean-200']
                      ].map(([lbl, val, col]) => (
                        <div key={lbl} className="flex items-center gap-2.5 text-sm">
                          <span className={`h-2.5 w-2.5 ${col}`} />
                          <span className="flex-1 text-slate-600">{lbl}</span>
                          <strong className="num text-slate-900">{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-xs font-semibold text-slate-700">Operasional aman</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Kapasitas masih tersedia untuk {maxCapacity - currentOccupancy} pengunjung
                      hari ini.
                    </p>
                  </div>
                </article>
              </section>

              <section className="panel-card p-0 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <h2 className="panel-title">Transaksi &amp; check-in terkini</h2>
                    <p className="panel-subtitle">Pembaruan gerbang dermaga real-time</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="segmented">
                      {(['Semua', 'Check-in', 'Berhasil', 'Diproses'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setTrxFilter(f)}
                          className={trxFilter === f ? 'active' : ''}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveNav('Kasir POS')}
                      className="app-button app-button-ghost"
                    >
                      Buka buku kasir
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID transaksi</th>
                        <th>Nama pengunjung</th>
                        <th>Tiket</th>
                        <th className="text-right">Nilai</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.slice(0, 6).map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong className="num">{row.id}</strong>
                          </td>
                          <td>{row.customerName}</td>
                          <td>
                            {row.ticketType}{' '}
                            <span className="text-slate-400 num">({row.quantity}x)</span>
                          </td>
                          <td className="text-right num">
                            Rp {row.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <span className={statusChipClass(row.status)}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-slate-400">
                            Tidak ada transaksi pada filter ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: VALIDASI QR & SCANNER GERBANG */}
          {activeNav === 'Validasi QR & Scanner' && (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <article className="panel-card space-y-5">
                <div>
                  <h2 className="panel-title">Pemindai QR code tiket</h2>
                  <p className="panel-subtitle">
                    Arahkan kamera ke QR tiket wisatawan atau masukkan kode booking
                  </p>
                </div>

                <div className="relative h-60 w-full overflow-hidden rounded-md bg-slate-950 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=600&fit=crop')`
                    }}
                  />
                  <div className="relative z-10 flex h-40 w-40 items-center justify-center border border-dashed border-ocean-400/80">
                    <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-ocean-400" /* taste-skill-ignore */ />
                    <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-ocean-400" /* taste-skill-ignore */ />
                    <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-ocean-400" /* taste-skill-ignore */ />
                    <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-ocean-400" /* taste-skill-ignore */ />
                    <div className="scanline absolute left-3 right-3 h-px bg-ocean-400" /* taste-skill-ignore */ />
                    <p className="mt-16 text-[11px] font-medium text-white/70">
                      Arahkan kamera ke QR
                    </p>
                  </div>
                  <span className="absolute bottom-3 left-4 text-[11px] text-white/50">
                    Camera Hub Bangsal 1080p · Sensor ready
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Masukkan kode booking (cth: GT-1048, GT-1047)"
                      value={scanInputCode}
                      onChange={(e) => setScanInputCode(e.target.value)}
                      className="field-input pl-9"
                    />
                  </div>
                  <button
                    onClick={() => handleSimulateScan(scanInputCode.trim())}
                    className="app-button app-button-primary"
                  >
                    Verifikasi
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-medium text-slate-500">Tes langsung:</span>
                  <button
                    onClick={() => handleSimulateScan('GT-1048')}
                    className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tiket valid (GT-1048)
                  </button>
                  <button
                    onClick={() => handleSimulateScan('GT-1047')}
                    className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Sudah check-in (GT-1047)
                  </button>
                  <button
                    onClick={() => handleSimulateScan('GT-INVALID')}
                    className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Kode tidak sah
                  </button>
                </div>

                {scanResult.status && (
                  <div
                    className={`rounded-md border p-4 ${
                      scanResult.status === 'success'
                        ? 'border-emerald-200 bg-emerald-50'
                        : scanResult.status === 'warning'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {scanResult.status === 'success' && (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      )}
                      {scanResult.status === 'warning' && (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      )}
                      {scanResult.status === 'error' && (
                        <RotateCcw className="mt-0.5 h-5 w-5 text-rose-600" />
                      )}
                      <div>
                        <strong className="block text-sm text-slate-900">
                          {scanResult.title}
                        </strong>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {scanResult.details}
                        </p>
                        {scanResult.ticketData && (
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-white bg-white p-3 text-xs">
                            <div>
                              <span className="block text-slate-400">Pengunjung</span>
                              <strong className="text-slate-800">
                                {scanResult.ticketData.name}
                              </strong>
                            </div>
                            <div>
                              <span className="block text-slate-400">Kode</span>
                              <strong className="text-ocean-700 num">
                                {scanResult.ticketData.code}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>

              <article className="panel-card h-fit">
                <div className="panel-head">
                  <div>
                    <h3 className="panel-title">Log pengunjung masuk dermaga</h3>
                    <p className="panel-subtitle">10 menit terakhir</p>
                  </div>
                </div>
                <div>
                  {[
                    { code: 'GT-1048', name: 'Nadya Putri', pass: 'VIP Fast Boat (2 org)', time: 'Baru saja' },
                    { code: 'GT-1045', name: 'Made Surya', pass: 'Reguler Pass (1 org)', time: '4 mnt lalu' },
                    { code: 'GT-1044', name: 'Kevin O’Connor', pass: 'Weekend Pass (3 org)', time: '12 mnt lalu' },
                    { code: 'GT-1042', name: 'Dewi Lestari', pass: 'Reguler Pass (2 org)', time: '19 mnt lalu' }
                  ].map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0" // taste-skill-ignore
                    >
                      <div>
                        <strong className="block text-sm text-slate-800">{item.name}</strong>
                        <span className="text-xs text-slate-500">{item.pass}</span>
                      </div>
                      <div className="text-right">
                        <span className="num block text-xs font-semibold text-ocean-700">
                          {item.code}
                        </span>
                        <span className="num text-[11px] text-slate-400">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

          {/* TAB 3: TIKET & HARGA */}
          {activeNav === 'Tiket & Harga' && (
            <article className="panel-card p-0 overflow-hidden">
              <div className="px-5 py-4">
                <h2 className="panel-title">Tarif &amp; kuota harian</h2>
                <p className="panel-subtitle">
                  Kelola harga tiket dan inventori kuota Gili Trawangan
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Jenis tiket</th>
                      <th className="text-right">Tarif per orang</th>
                      <th>Kuota terpesan</th>
                      <th className="text-right">Sisa kuota</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketTiers.map((tier, idx) => {
                      const sold = tier.quotaPerDay - tier.quotaRemaining
                      const pct = Math.round((sold / tier.quotaPerDay) * 100)
                      return (
                        <tr key={tier.id}>
                          <td>
                            <strong className="block">{tier.name}</strong>
                            <span className="text-xs text-slate-500">{tier.description}</span>
                            {tier.badge && (
                              <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                                {tier.badge}
                              </span>
                            )}
                          </td>
                          <td className="text-right num font-semibold text-slate-900">
                            Rp {tier.price.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full bg-ocean-600"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="num text-xs text-slate-500">
                                {sold} / {tier.quotaPerDay}
                              </span>
                            </div>
                          </td>
                          <td className="text-right num font-semibold text-emerald-700">
                            {tier.quotaRemaining}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const newPrice = prompt('Ubah harga tiket (Rp):', tier.price.toString())
                                  if (newPrice && !isNaN(Number(newPrice))) {
                                    const updated = [...ticketTiers]
                                    updated[idx].price = Number(newPrice)
                                    setTicketTiers(updated)
                                    setNotice(
                                      `Harga ${tier.name} diubah menjadi Rp ${Number(
                                        newPrice
                                      ).toLocaleString('id-ID')}`
                                    )
                                  }
                                }}
                                className="app-button app-button-secondary whitespace-nowrap px-3 py-1.5 text-xs"
                              >
                                Ubah tarif
                              </button>
                              <button
                                onClick={() => {
                                  const add = prompt('Tambah kuota sebanyak:', '50')
                                  if (add && !isNaN(Number(add))) {
                                    const updated = [...ticketTiers]
                                    updated[idx].quotaPerDay += Number(add)
                                    updated[idx].quotaRemaining += Number(add)
                                    setTicketTiers(updated)
                                    setNotice(`Kuota ${tier.name} ditambah ${add} tiket.`)
                                  }
                                }}
                                className="app-button app-button-primary whitespace-nowrap px-3 py-1.5 text-xs"
                              >
                                + Kuota
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* TAB 4: KASIR POS */}
          {activeNav === 'Kasir POS' && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
              <article className="panel-card">
                <h2 className="panel-title">Terbitkan tiket loket (POS)</h2>
                <p className="panel-subtitle">Untuk pembelian langsung di dermaga / go-show</p>

                <form onSubmit={handleIssuePosTicket} className="mt-5 space-y-4">
                  <div>
                    <span className="field-label">Nama pengunjung</span>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Robert Taylor"
                      value={posCustomer}
                      onChange={(e) => setPosCustomer(e.target.value)}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <span className="field-label">Pilihan tiket</span>
                    <select
                      value={posTier}
                      onChange={(e) => setPosTier(e.target.value)}
                      className="select-control"
                    >
                      {ticketTiers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} — Rp {t.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="field-label">Jumlah</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPosQty(Math.max(1, posQty - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50"
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <strong className="num w-6 text-center text-sm">{posQty}</strong>
                        <button
                          type="button"
                          onClick={() => setPosQty(posQty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50"
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="field-label">Metode pembayaran</span>
                      <select
                        value={posPayment}
                        onChange={(e) => setPosPayment(e.target.value as any)}
                        className="select-control"
                      >
                        <option value="QRIS">QRIS</option>
                        <option value="Tunai / Kasir">Tunai</option>
                        <option value="GoPay">GoPay</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <span className="text-xs font-medium text-slate-500">Total</span>
                    <strong className="num text-sm font-semibold text-ocean-700">
                      Rp{' '}
                      {(
                        (ticketTiers.find((t) => t.name === posTier)?.price || 0) * posQty
                      ).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="app-button app-button-primary w-full justify-center py-2.5"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak tiket &amp; check-in
                  </button>
                </form>
              </article>

              <article className="panel-card p-0 overflow-hidden">
                <div className="px-5 py-4">
                  <h3 className="panel-title">Buku mutasi transaksi loket</h3>
                  <p className="panel-subtitle">{transactions.length} transaksi tercatat</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID transaksi</th>
                        <th>Pengunjung</th>
                        <th>Paket</th>
                        <th className="text-right">Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong className="num">{t.id}</strong>
                          </td>
                          <td>{t.customerName}</td>
                          <td>
                            {t.ticketType}{' '}
                            <span className="text-slate-400 num">({t.quantity}x)</span>
                          </td>
                          <td className="text-right num">
                            Rp {t.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <span className={statusChipClass(t.status)}>{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {/* TAB 5: LAPORAN HARIAN */}
          {activeNav === 'Laporan Harian' && (
            <div className="space-y-5">
              <article className="panel-card">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Rekonsiliasi harian BlueWater Lombok</h2>
                    <p className="panel-subtitle">
                      Periode 14 Februari 2026 · Dermaga Bangsal Hub
                    </p>
                  </div>
                  <button
                    onClick={() => setNotice('Laporan PDF resmi berhasil diunduh.')}
                    className="app-button app-button-primary"
                  >
                    <Download className="h-4 w-4" />
                    Unduh laporan PDF
                  </button>
                </div>

                <div className="metric-strip">
                  <div>
                    <span className="metric-label">Tiket terjual</span>
                    <strong className="metric-value num">684</strong>
                    <span className="metric-note positive">Tingkat check-in 89,4%</span>
                  </div>
                  <div>
                    <span className="metric-label">Penerimaan kotor</span>
                    <strong className="metric-value num">Rp 48.250.000</strong>
                    <span className="metric-note">Bagi hasil platform 8%</span>
                  </div>
                  <div>
                    <span className="metric-label">Pendapatan bersih mitra</span>
                    <strong className="metric-value num">Rp 44.390.000</strong>
                    <span className="metric-note positive">Siap transfer bank</span>
                  </div>
                  <div>
                    <span className="metric-label">Transaksi gagal</span>
                    <strong className="metric-value num">3</strong>
                    <span className="metric-note">Perlu penyelesaian manual</span>
                  </div>
                </div>
              </article>

              <article className="panel-card p-0 overflow-hidden">
                <div className="px-5 py-4">
                  <h3 className="panel-title">Rincian penjualan per kanal</h3>
                  <p className="panel-subtitle">Kontribusi kanal terhadap penerimaan harian</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kanal</th>
                        <th className="text-right">Transaksi</th>
                        <th className="text-right">Penerimaan</th>
                        <th className="text-right">Bagian</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Aplikasi online</strong>
                        </td>
                        <td className="text-right num">412</td>
                        <td className="text-right num">Rp 35.400.000</td>
                        <td className="text-right num">73,4%</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Loket destinasi (POS)</strong>
                        </td>
                        <td className="text-right num">272</td>
                        <td className="text-right num">Rp 12.850.000</td>
                        <td className="text-right num">26,6%</td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-900">Total</td>
                        <td className="text-right num font-semibold text-slate-900">684</td>
                        <td className="text-right num font-semibold text-slate-900">
                          Rp 48.250.000
                        </td>
                        <td className="text-right num font-semibold text-slate-900">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {/* TAB 6: PENGATURAN */}
          {activeNav === 'Pengaturan' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="panel-card">
                <h2 className="panel-title">Profil &amp; gerbang mitra</h2>
                <p className="panel-subtitle">
                  Kelola informasi kontak dan integrasi perangkat IoT
                </p>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="field-label">Nama badan pengelola</span>
                    <input
                      type="text"
                      defaultValue="BlueWater Express Lombok"
                      className="field-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Email operasional</span>
                    <input
                      type="email"
                      defaultValue="adi@bluewaterlombok.id"
                      className="field-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Nomor kontak gate</span>
                    <input
                      type="tel"
                      defaultValue="+62 812-3456-7890"
                      className="field-input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotice('Perubahan pengaturan mitra berhasil disimpan.')}
                    className="app-button app-button-primary"
                  >
                    Simpan pengaturan
                  </button>
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Status perangkat</h2>
                <p className="panel-subtitle">Perangkat terdaftar di gerbang dermaga</p>
                <div className="mt-4">
                  {[
                    { name: 'Scanner QR utama — Gate 1', code: 'IOT-GT1-2214', status: 'Terhubung' },
                    { name: 'Scanner QR cadangan — Gate 2', code: 'IOT-GT2-2215', status: 'Terhubung' },
                    { name: 'Printer tiket loket', code: 'POS-PRN-0042', status: 'Terhubung' },
                    { name: 'CCTV dermaga Bangsal', code: 'CAM-BGS-0009', status: 'Perlu perhatian' }
                  ].map((dev) => (
                    <div
                      key={dev.code}
                      className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0" // taste-skill-ignore
                    >
                      <div>
                        <strong className="block text-sm text-slate-800">{dev.name}</strong>
                        <span className="num text-xs text-slate-400">{dev.code}</span>
                      </div>
                      <span
                        className={
                          dev.status === 'Terhubung'
                            ? 'table-status'
                            : 'table-status table-status-pending'
                        }
                      >
                        {dev.status}
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
