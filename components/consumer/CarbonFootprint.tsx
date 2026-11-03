'use client'

import { ArrowLeft, Leaf, MapPin, RefreshCw } from 'lucide-react'
import { CarbonEstimate } from '@/types/marketplace'
import {
  CARBON_FACTORS,
  CARBON_FACTOR_SOURCE,
  CARBON_MODES,
  carbonNumber,
  summarizeCarbon,
} from '@/lib/carbon'
import { dateLabel } from '@/lib/marketplace-data'

function EstimateDetails({ estimate }: { estimate: CarbonEstimate }) {
  const mode = CARBON_MODES.find((m) => m.id === estimate.mode)
  return (
    <>
      <div className="carbon-checkout-estimate">
        <div>
          <small>Estimasi jarak rute</small>
          <strong>{carbonNumber(estimate.distanceKm)} km</strong>
        </div>
        <div>
          <small>Estimasi emisi</small>
          <strong>{carbonNumber(estimate.totalKg)} kg CO₂e</strong>
        </div>
      </div>
      <p className="travel-help">
        {mode?.label ?? 'Moda darat belum dipilih'} · {estimate.people} peserta
        {mode && mode.capacity > 1
          ? ` · ${estimate.occupants} peserta/kendaraan`
          : ''}{' '}
        · darat {carbonNumber(estimate.roadKm)} km · laut{' '}
        {carbonNumber(estimate.seaKm)} km
      </p>
      <details className="carbon-method-details">
        <summary>Lihat rute dan cakupan perhitungan</summary>
        {estimate.legs.length > 0 ? (
          <ol className="carbon-route-list">
            {estimate.legs.map((leg, index) => (
              <li key={index}>
                <span>
                  {leg.from} → {leg.to}
                </span>
                <strong>
                  {carbonNumber(leg.distanceKm)} km ·{' '}
                  {leg.mode === 'sea' ? 'laut' : 'darat'}
                </strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="travel-help">
            Jarak akses belum tersedia. Pilih titik keberangkatan saat membeli
            tiket.
          </p>
        )}
        <p className="travel-help">
          Transportasi: {carbonNumber(estimate.transportKg)} kg CO₂e ·
          Penginapan: {carbonNumber(estimate.accommodationKg)} kg CO₂e.
        </p>
        <ul className="carbon-coverage-list">
          {estimate.missing.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </>
  )
}

export default function CarbonFootprint({
  summary,
  preview,
  previewTitle,
  onBackToBooking,
  onExplore,
  loading,
  error,
  onRefresh,
}: {
  summary: ReturnType<typeof summarizeCarbon>
  preview: CarbonEstimate | null
  previewTitle?: string
  onBackToBooking: () => void
  onExplore: () => void
  loading: boolean
  error: string
  onRefresh: () => void
}) {
  return (
    <section className="pb-12">
      <div className="carbon-head">
        <div className="consumer-container flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
            <Leaf size={22} />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-white">
              Carbon Footprint
            </h1>
            <p className="mt-1 text-xs text-white/80">
              Jejak karbon berdasarkan perjalanan yang Anda pesan
            </p>
          </div>
        </div>
      </div>
      <div className="consumer-container -mt-6">
        {preview && (
          <article className="panel-card carbon-preview mb-5">
            <p className="section-eyebrow">
              Pratinjau pemesanan · belum masuk total
            </p>
            <h2 className="mt-1 font-semibold text-slate-900">
              {previewTitle}
            </h2>
            <EstimateDetails estimate={preview} />
            <button
              type="button"
              className="travel-secondary mt-4"
              onClick={onBackToBooking}
            >
              <ArrowLeft size={16} />
              Kembali ke pemesanan
            </button>
          </article>
        )}
        <article className="panel-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-eyebrow">Estimasi dari pesanan lunas</p>
              <p className="mt-3">
                <strong
                  className="font-display text-4xl font-bold text-slate-900"
                  data-testid="carbon-total"
                >
                  {carbonNumber(summary.totalKg)}
                </strong>
                <span className="ml-2 text-sm text-slate-500">kg CO₂e</span>
              </p>
            </div>
            <button
              type="button"
              className="travel-text-button"
              onClick={onRefresh}
              aria-label="Perbarui laporan karbon"
            >
              <RefreshCw size={17} />
            </button>
          </div>
          <p className="travel-help mt-3">
            Estimasi untuk seluruh peserta dalam pesanan. Pembayaran tidak
            membuktikan perjalanan telah terlaksana. Pesanan menunggu
            pembayaran, batal, dan kedaluwarsa tidak masuk total.
          </p>
          <div className="carbon-report-metrics">
            <div>
              <small>Jarak rute</small>
              <strong>{carbonNumber(summary.distanceKm)} km</strong>
            </div>
            <div>
              <small>Transportasi</small>
              <strong>{carbonNumber(summary.transportKg)} kg</strong>
            </div>
            <div>
              <small>Penginapan</small>
              <strong>{carbonNumber(summary.accommodationKg)} kg</strong>
            </div>
            <div>
              <small>Pesanan lunas</small>
              <strong>{summary.orders.length}</strong>
            </div>
          </div>
        </article>
        {loading && (
          <p className="travel-info mt-4" role="status">
            Memuat data perjalanan…
          </p>
        )}
        {error && (
          <p className="travel-error mt-4" role="alert">
            {error}
            <button
              type="button"
              onClick={onRefresh}
              className="ml-3 underline"
            >
              Coba lagi
            </button>
          </p>
        )}
        {!loading && !error && summary.orders.length === 0 && (
          <article className="travel-empty mt-5">
            <Leaf size={30} />
            <h2>Belum ada pesanan lunas</h2>
            <p>
              Pilih titik keberangkatan saat membeli tiket. Estimasi otomatis
              masuk ke laporan setelah pembayaran berhasil.
            </p>
            <button
              type="button"
              className="travel-primary mt-4"
              onClick={onExplore}
            >
              Jelajahi perjalanan
            </button>
          </article>
        )}
        <div className="carbon-order-list mt-5">
          {summary.orders.map(({ booking, estimate }) => (
            <article className="panel-card" key={booking.id}>
              <p className="section-eyebrow">
                {booking.category} · {dateLabel(booking.draft.date)}
              </p>
              <h2 className="mt-1 font-semibold text-slate-900">
                {booking.title}
              </h2>
              <p className="travel-help break-all">{booking.id}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <MapPin size={14} />
                {estimate.originLabel ?? 'Titik keberangkatan belum dipilih'}
              </p>
              <EstimateDetails estimate={estimate} />
            </article>
          ))}
        </div>
        <article className="panel-card mt-5">
          <h2 className="font-semibold text-slate-900">
            Bagaimana estimasi dihitung?
          </h2>
          <p className="travel-help mt-2">
            Jarak darat menggunakan garis lurus antar titik kawasan × 1,35
            sebagai pendekatan rute. Jarak laut menggunakan garis lurus. Angka
            ini bukan jarak navigasi atau rekaman GPS perjalanan.
          </p>
          <p className="travel-help">
            Mobil: {CARBON_FACTORS.car} kg CO₂e/kendaraan-km; motor kecil:{' '}
            {CARBON_FACTORS.motorbike}; bus/coach: {CARBON_FACTORS.coach} kg
            CO₂e/penumpang-km; feri pejalan kaki: {CARBON_FACTORS.ferry}. Jumlah
            mobil/motor dibulatkan ke atas berdasarkan peserta per kendaraan.
          </p>
          <p className="travel-help">
            Penginapan: {CARBON_FACTORS.hotel} kg CO₂e/kamar/malam, memakai
            rata-rata Indonesia. Akses hotel diasumsikan 2 tamu/kamar. Faktor
            transportasi Inggris merupakan pendekatan, bukan pengukuran operator
            Lombok. Emisi kapal cepat, penerbangan, makanan, aktivitas, dan
            produksi bahan bakar belum termasuk.
          </p>
          <a
            className="travel-text-button mt-3"
            href={CARBON_FACTOR_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sumber faktor: DESNZ 2026
          </a>
          <p className="travel-help">
            Versi metode: silaq-distance-v1. Kontribusi konservasi tidak
            mengurangi angka emisi ini.
          </p>
        </article>
      </div>
    </section>
  )
}
