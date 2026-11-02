'use client'

import { useEffect, useId, useRef } from 'react'
import { ArrowRight, Compass, Hotel, UtensilsCrossed, X } from 'lucide-react'
import {
  CULINARY_PLACES,
  HOTELS,
  MARKET_PRODUCTS,
  rupiah,
} from '@/lib/marketplace-data'
import { MarketProduct } from '@/types/marketplace'

export function ItineraryOverview({
  product,
  compact = false,
}: {
  product: MarketProduct
  compact?: boolean
}) {
  const region = product.location.match(/Lombok (Tengah|Utara|Barat)/)?.[0]
  const hotel = HOTELS.find((item) =>
    product.hotelId
      ? item.id === product.hotelId
      : region && item.location.includes(region)
  )
  const food = CULINARY_PLACES.find((item) =>
    product.culinaryIds?.length
      ? product.culinaryIds.includes(item.id)
      : region && item.location.includes(region)
  )
  const destinations = product.destinationIds
    ?.map((id) => MARKET_PRODUCTS.find((item) => item.id === id))
    .filter((item): item is MarketProduct => Boolean(item)) ?? [product]
  const days = product.durationDays ?? 1
  return (
    <section
      className={`itinerary-overview ${compact ? 'is-compact' : ''}`}
      aria-label={`Saran itinerary ${product.name}`}
    >
      <div className="itinerary-overview-heading">
        <Compass size={16} />
        <h3>Saran itinerary</h3>
        <span>{days} hari</span>
      </div>
      <ol className="overview-route">
        {Array.from({ length: days }, (_, day) => {
          const route = destinations.filter(
            (_, index) =>
              Math.min(
                days - 1,
                Math.floor((index * days) / destinations.length)
              ) === day
          )
          return (
            <li key={day}>
              <strong>Hari {day + 1}</strong>
              <span>{route.map((item) => item.name).join(' → ')}</span>
            </li>
          )
        })}
      </ol>
      <div className="overview-recommendations">
        {food && (
          <p>
            <UtensilsCrossed size={15} />
            <span>
              <small>Singgah kuliner</small>
              <strong>{food.name}</strong>
              {!compact && (
                <span>{food.location} · bayar langsung di tempat</span>
              )}
            </span>
          </p>
        )}
        {hotel && (
          <p>
            <Hotel size={15} />
            <span>
              <small>Pilihan menginap</small>
              <strong>{hotel.name}</strong>
              {!compact && (
                <span>
                  {hotel.location} · mulai {rupiah(hotel.price)} / kamar / malam
                </span>
              )}
            </span>
          </p>
        )}
      </div>
      <p className="overview-note">
        {compact
          ? 'Kuliner & hotel opsional · biaya terpisah.'
          : 'Rute mandiri. Kuliner hanya rekomendasi; hotel dipesan terpisah atau ditambahkan saat checkout paket. Jam, alamat, dan itinerary lengkap tersedia setelah pembayaran paket berhasil.'}
      </p>
    </section>
  )
}

export function BundleOverviewDialog({
  product,
  onClose,
  onBook,
}: {
  product: MarketProduct
  onClose: () => void
  onBook: (product: MarketProduct) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useId()
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="bundle-overview-dialog"
      aria-labelledby={heading}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bundle-overview-content">
        <div className="bundle-overview-photo">
          <img src={product.image} alt={product.name} />
          <button
            className="overview-close"
            onClick={onClose}
            aria-label="Tutup overview"
          >
            <X size={20} />
          </button>
        </div>
        <div className="bundle-overview-body">
          <p className="section-eyebrow">Overview paket · {product.location}</p>
          <h2 id={heading}>{product.name}</h2>
          <p className="travel-description">{product.description}</p>
          <ItineraryOverview product={product} />
          <div className="travel-card-footer">
            <div>
              <small>Mulai dari</small>
              <strong>{rupiah(product.price)}</strong>
              <small>/ {product.unit}</small>
            </div>
            <button
              className="travel-primary"
              onClick={() => {
                onClose()
                onBook(product)
              }}
            >
              Pilih paket
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
