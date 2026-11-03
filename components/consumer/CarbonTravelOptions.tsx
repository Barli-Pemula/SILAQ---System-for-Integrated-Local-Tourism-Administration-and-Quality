'use client'

import { useEffect, useRef, useState } from 'react'
import { Leaf, LocateFixed, LoaderCircle } from 'lucide-react'
import {
  BookingDraft,
  CarbonTravelInput,
  MarketProduct,
} from '@/types/marketplace'
import {
  CARBON_ORIGINS,
  CARBON_MODES,
  carbonNumber,
  estimateCarbon,
  nearestCarbonOrigin,
} from '@/lib/carbon'
import { MARKET_PRODUCTS } from '@/lib/marketplace-data'

export function CarbonTravelOptions({
  product,
  draft,
  onChange,
}: {
  product: MarketProduct
  draft: BookingDraft
  onChange: (travel: CarbonTravelInput) => void
}) {
  const travel = draft.travel ?? {
    originId: '',
    mode: 'car' as const,
    occupants: 1,
    returnToOrigin: false,
  }
  const estimate = estimateCarbon(product, draft, MARKET_PRODUCTS)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState('')
  const request = useRef(0)
  useEffect(
    () => () => {
      request.current++
    },
    []
  )
  const change = (value: Partial<CarbonTravelInput>) => {
    request.current++
    setLocating(false)
    setMessage('')
    onChange({ ...travel, ...value })
  }
  const locate = () => {
    if (!navigator.geolocation) {
      setMessage(
        'Browser ini tidak mendukung lokasi. Silakan pilih titik keberangkatan.'
      )
      return
    }
    const id = ++request.current
    setLocating(true)
    setMessage('Meminta lokasi untuk mencari titik keberangkatan terdekat…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request.current !== id) return
        setLocating(false)
        if (
          !Number.isFinite(position.coords.accuracy) ||
          position.coords.accuracy > 10000
        ) {
          setMessage(
            'Lokasi kurang akurat. Silakan pilih titik keberangkatan secara manual.'
          )
          return
        }
        const nearest = nearestCarbonOrigin(
          position.coords.latitude,
          position.coords.longitude
        )
        if (!nearest) {
          setMessage(
            'Lokasi di luar kawasan pilihan. Silakan pilih titik awal perjalanan di Lombok atau Padangbai.'
          )
          return
        }
        onChange({ ...travel, originId: nearest.id })
        setMessage(
          `Titik terdekat: ${nearest.label}. Periksa pilihan ini; estimasi dimulai dari titik kawasan, bukan posisi persis Anda.`
        )
      },
      (error) => {
        if (request.current !== id) return
        setLocating(false)
        setMessage(
          error.code === 1
            ? 'Izin lokasi tidak diberikan. Anda tetap bisa memilih titik keberangkatan.'
            : 'Lokasi belum tersedia. Silakan pilih titik keberangkatan secara manual.'
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }
  const mode = CARBON_MODES.find((m) => m.id === travel.mode)!
  return (
    <article className="travel-panel mt-5 carbon-travel-options">
      <h2>
        <Leaf size={18} /> Jejak karbon perjalanan
      </h2>
      <p className="travel-help">
        Pilih titik awal perjalanan, yang bisa berbeda dari lokasi Anda saat
        memesan. Pilihan ini tidak mengubah harga tiket.
      </p>
      <div className="travel-form-grid mt-5">
        <label className="travel-field">
          Titik keberangkatan
          <select
            aria-label="Titik keberangkatan"
            value={travel.originId}
            onChange={(e) => change({ originId: e.target.value })}
          >
            <option value="">Belum tahu / lewati</option>
            {CARBON_ORIGINS.map((origin) => (
              <option key={origin.id} value={origin.id}>
                {origin.label}
              </option>
            ))}
          </select>
        </label>
        <div className="carbon-location-action">
          <button
            type="button"
            className="travel-secondary"
            onClick={locate}
            disabled={locating}
          >
            {locating ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <LocateFixed size={16} />
            )}
            {locating ? 'Mencari titik terdekat…' : 'Gunakan lokasi saya'}
          </button>
          <small>
            Dengan izin browser, lokasi dibaca sekali untuk memilih titik
            terdekat. Koordinat tidak disimpan atau dikirim ke layanan peta.
          </small>
        </div>
        <label className="travel-field">
          Transportasi darat
          <select
            aria-label="Transportasi darat"
            value={travel.mode}
            onChange={(e) =>
              change({
                mode: e.target.value as CarbonTravelInput['mode'],
                occupants: 1,
              })
            }
          >
            {CARBON_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
        {mode.capacity > 1 && (
          <label className="travel-field">
            Peserta per kendaraan
            <select
              aria-label="Peserta per kendaraan"
              value={travel.occupants}
              onChange={(e) => change({ occupants: Number(e.target.value) })}
            >
              {Array.from({ length: mode.capacity }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} orang
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {product.category !== 'Tiket Kapal' && (
        <label className="carbon-return-option">
          <input
            type="checkbox"
            checked={travel.returnToOrigin}
            onChange={(e) => change({ returnToOrigin: e.target.checked })}
          />
          Sertakan perjalanan kembali ke titik keberangkatan
        </label>
      )}
      {message && (
        <p className="travel-info mt-3" role="status">
          {message}
        </p>
      )}
      <div className="carbon-checkout-estimate" aria-live="polite">
        <div>
          <small>Estimasi jarak rute</small>
          <strong>{carbonNumber(estimate.distanceKm)} km</strong>
        </div>
        <div>
          <small>Estimasi emisi pesanan</small>
          <strong>{carbonNumber(estimate.totalKg)} kg CO₂e</strong>
        </div>
      </div>
      <p className="travel-help">
        {product.category === 'Hotel'
          ? 'Akses darat diasumsikan 2 tamu per kamar. '
          : 'Emisi untuk seluruh peserta dalam pesanan. '}
        Jarak darat memakai perkiraan antar titik kawasan × 1,35; bukan jarak
        navigasi. Jarak laut berupa garis lurus. Emisi kapal cepat belum
        termasuk.
      </p>
      {!travel.originId && (
        <p className="travel-help">
          Tanpa titik awal, hanya rute antar destinasi, penyeberangan, atau
          penginapan yang tersedia yang dihitung.
        </p>
      )}
      {estimate.missing
        .filter((note) => note.includes('lintas pulau'))
        .map((note) => (
          <p key={note} className="travel-help">
            {note}
          </p>
        ))}
    </article>
  )
}
