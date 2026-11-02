'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Hotel,
  Layers3,
  MapPin,
  Search,
  Ship,
  Ticket,
  UtensilsCrossed,
  X,
  CircleAlert,
  LoaderCircle,
} from 'lucide-react'
import {
  BookingDraft,
  MarketCategory,
  MarketProduct,
  TravelBooking,
} from '@/types/marketplace'
import {
  addDays,
  BOATS,
  CULINARY_PLACES,
  dateLabel,
  HOTELS,
  mapLink,
  MARKET_PRODUCTS,
  rupiah,
  todayISO,
  TOUR_BUNDLES,
} from '@/lib/marketplace-data'
import {
  api,
  bookingAction,
  bookingQuote,
  createServerBooking,
  defaultDraft,
  refreshBookings,
  useBookingState,
  usePaymentConfig,
  validateBooking,
} from '@/lib/booking-store'
import { bookingDocument } from '@/lib/voucher-document'
import { VoucherQRCode } from './VoucherQRCode'
import { BundleOverviewDialog, ItineraryOverview } from './ItineraryOverview'

const CATEGORIES: {
  label: MarketCategory
  icon: typeof Hotel
  subtitle: string
}[] = [
  { label: 'Destinasi', icon: Compass, subtitle: 'Temukan tempat baru' },
  {
    label: 'Paket Wisata',
    icon: Layers3,
    subtitle: 'Banyak tempat, sekali pesan',
  },
  { label: 'Hotel', icon: Hotel, subtitle: 'Istirahat dengan nyaman' },
  { label: 'Tiket Kapal', icon: Ship, subtitle: 'Berlayar ke Lombok & Gili' },
  {
    label: 'Kuliner',
    icon: UtensilsCrossed,
    subtitle: 'Cita rasa & alamat lokal',
  },
]

export function PaymentEnvironmentNotice() {
  const { config } = usePaymentConfig()
  if (!config || config.paymentMode === 'production') return null
  return (
    <div className="consumer-container py-3">
      <p className="travel-info">
        <CircleAlert size={16} />
        <span>
          Mode pengujian. Pembayaran dan voucher belum berlaku untuk perjalanan
          nyata.
        </span>
      </p>
    </div>
  )
}

export function TravelShortcuts({
  onSelect,
}: {
  onSelect: (category: MarketCategory) => void
}) {
  return (
    <section className="travel-services" aria-label="Layanan perjalanan">
      {CATEGORIES.map(({ label, icon: Icon, subtitle }) => (
        <button key={label} onClick={() => onSelect(label)}>
          <span
            className={`service-symbol ${label === 'Kuliner' ? 'service-warm' : ''}`}
          >
            <Icon size={23} strokeWidth={1.6} />
          </span>
          <span>
            <strong>{label}</strong>
            <small>{subtitle}</small>
          </span>
          <ChevronRight size={15} className="service-arrow" />
        </button>
      ))}
    </section>
  )
}

function ProductCard({
  product,
  onBook,
}: {
  product: MarketProduct
  onBook: (product: MarketProduct) => void
}) {
  const [overviewOpen, setOverviewOpen] = useState(false)
  const destinations = product.destinationIds?.map(
    (id) => MARKET_PRODUCTS.find((p) => p.id === id)!.name
  )
  return (
    <article className="travel-card">
      <div className="travel-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="travel-photo-tag">
          {product.category === 'Paket Wisata'
            ? `${product.durationDays} hari · ${destinations?.length} destinasi`
            : product.category}
        </span>
      </div>
      <div className="travel-card-body">
        <p className="travel-location">
          <MapPin size={13} />
          {product.location}
        </p>
        <h3>{product.name}</h3>
        <p className="travel-description">{product.description}</p>
        {product.category === 'Paket Wisata' ? (
          <ItineraryOverview product={product} compact />
        ) : (
          <div className="travel-tags">
            {product.highlights.slice(0, 3).map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        )}
        {product.category === 'Paket Wisata' && (
          <button
            className="travel-text-button overview-trigger"
            onClick={() => setOverviewOpen(true)}
          >
            Lihat overview & itinerary <ArrowRight size={15} />
          </button>
        )}
        {product.category === 'Tiket Kapal' && (
          <p className="travel-location mt-3">
            <Clock3 size={13} />
            {product.duration} · {product.departures?.length} pilihan jam
          </p>
        )}
        <div className="travel-card-footer">
          <div>
            <small>Mulai dari</small>
            <strong>{rupiah(product.price)}</strong>
            <small>/ {product.unit}</small>
          </div>
          <button className="travel-primary" onClick={() => onBook(product)}>
            {product.category === 'Paket Wisata' ? 'Pilih paket' : 'Pesan'}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
      {overviewOpen && (
        <BundleOverviewDialog
          product={product}
          onClose={() => setOverviewOpen(false)}
          onBook={onBook}
        />
      )}
    </article>
  )
}

export function FeaturedBundles({
  onBook,
  onExplore,
}: {
  onBook: (product: MarketProduct) => void
  onExplore: () => void
}) {
  return (
    <section className="featured-bundles">
      <div className="travel-section-heading">
        <div>
          <p className="section-eyebrow">Lebih banyak cerita, sekali pesan</p>
          <h2 className="section-title">Satu paket. Banyak pengalaman.</h2>
          <p className="section-description">
            Rute pilihan dengan tiket beberapa destinasi dalam satu pemesanan.
          </p>
        </div>
        <button onClick={onExplore} className="travel-text-button">
          Semua paket
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="travel-grid">
        {TOUR_BUNDLES.map((p) => (
          <ProductCard key={p.id} product={p} onBook={onBook} />
        ))}
      </div>
    </section>
  )
}

export function ExploreMarketplace({
  category,
  onCategory,
  query,
  onQuery,
  onBook,
}: {
  category: MarketCategory
  onCategory: (c: MarketCategory) => void
  query: string
  onQuery: (q: string) => void
  onBook: (p: MarketProduct) => void
}) {
  const { config } = usePaymentConfig()
  const [region, setRegion] = useState('Semua wilayah')
  const [sort, setSort] = useState('Pilihan SILAQ')
  const matches = (p: {
    name: string
    location: string
    description: string
  }) =>
    `${p.name} ${p.location} ${p.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()) &&
    (region === 'Semua wilayah' || p.location.includes(region))
  const products = MARKET_PRODUCTS.filter(
    (p) => p.category === category && matches(p)
  ).sort((a, b) =>
    sort === 'Harga terendah'
      ? a.price - b.price
      : sort === 'Harga tertinggi'
        ? b.price - a.price
        : 0
  )
  const culinary = CULINARY_PLACES.filter(matches)
  const count = category === 'Kuliner' ? culinary.length : products.length
  return (
    <section className="consumer-container travel-page">
      <div className="travel-explore-head">
        <p className="section-eyebrow">Seluruh perjalanan, dalam satu tempat</p>
        <h1>Temukan Lombok versimu.</h1>
        <p>
          Dari tempat yang ingin kamu kunjungi, sampai tempat untuk pulang
          sejenak.
        </p>
      </div>
      <div className="travel-tabs" role="tablist" aria-label="Kategori layanan">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            role="tab"
            id={`tab-${label.replaceAll(' ', '-')}`}
            aria-controls="market-results"
            aria-selected={category === label}
            key={label}
            onClick={() => onCategory(label)}
            className={category === label ? 'active' : ''}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
      <div className="travel-search-row">
        <label className="travel-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={`Cari ${category.toLowerCase()} atau wilayah…`}
            aria-label={`Cari ${category}`}
          />
          {query && (
            <button aria-label="Hapus pencarian" onClick={() => onQuery('')}>
              <X size={16} />
            </button>
          )}
        </label>
        <select
          aria-label="Filter wilayah"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {[
            'Semua wilayah',
            'Lombok Tengah',
            'Lombok Utara',
            'Lombok Barat',
            'Lombok Timur',
            'Kota Mataram',
          ].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        {category !== 'Kuliner' && (
          <select
            aria-label="Urutkan hasil"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {['Pilihan SILAQ', 'Harga terendah', 'Harga tertinggi'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
      <div className="travel-results-heading">
        <h2>
          {category === 'Kuliner'
            ? 'Rasa lokal, cerita yang berkesan'
            : category === 'Paket Wisata'
              ? 'Rute yang sudah dipikirkan untukmu'
              : category === 'Hotel'
                ? 'Tempat istirahat pilihan'
                : category === 'Tiket Kapal'
                  ? 'Langkah pertama menuju pulau'
                  : 'Destinasi pilihan di Lombok'}
        </h2>
        <span>{count} pilihan</span>
      </div>
      <p className="travel-demo-note">
        {config?.catalogApproved
          ? 'Katalog mitra SILAQ. Harga dan kuota diperiksa kembali oleh server saat pemesanan.'
          : 'Katalog pengujian. Mitra, harga, dan jadwal masih ilustratif.'}
      </p>
      <div
        role="tabpanel"
        id="market-results"
        aria-labelledby={`tab-${category.replaceAll(' ', '-')}`}
      >
        {count === 0 ? (
          <div className="travel-empty">
            <Search size={32} />
            <h3>Belum ada hasil yang cocok</h3>
            <p>Coba kata kunci lain atau tampilkan seluruh wilayah.</p>
            <button
              className="travel-primary"
              onClick={() => {
                onQuery('')
                setRegion('Semua wilayah')
              }}
            >
              Reset pencarian
            </button>
          </div>
        ) : (
          <div className="travel-grid">
            {category === 'Kuliner'
              ? culinary.map((place) => (
                  <article className="travel-card" key={place.id}>
                    <div className="travel-card-image">
                      <img src={place.image} alt={place.name} loading="lazy" />
                      <span className="travel-photo-tag">Jelajah kuliner</span>
                    </div>
                    <div className="travel-card-body">
                      <p className="travel-location">
                        <MapPin size={13} />
                        {place.location}
                      </p>
                      <h3>{place.name}</h3>
                      <p className="travel-description">{place.description}</p>
                      <div className="travel-tags">
                        <span>{place.specialty}</span>
                      </div>
                      <address className="culinary-address">
                        <MapPin size={16} />
                        {place.address}
                      </address>
                      <div className="travel-card-footer">
                        <small>Informasi tempat · tanpa pemesanan</small>
                        <a
                          className="travel-secondary"
                          href={mapLink(place.address)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat peta
                          <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              : products.map((p) => (
                  <ProductCard key={p.id} product={p} onBook={onBook} />
                ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function BookingCheckout({
  product,
  initialDate,
  onBack,
  onComplete,
}: {
  product: MarketProduct
  initialDate?: string
  onBack: () => void
  onComplete: (b: TravelBooking) => void
}) {
  const { config, error: configError } = usePaymentConfig()
  const [available, setAvailable] = useState<number | null>(null)
  const attempt = useRef({ key: '', fingerprint: '' })
  const [draft, setDraft] = useState<BookingDraft>(() =>
    defaultDraft(product, initialDate)
  )
  const [stage, setStage] = useState<'details' | 'payment'>('details')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const mounted = useRef(true)
  const inFlight = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const update = <K extends keyof BookingDraft>(
    key: K,
    value: BookingDraft[K]
  ) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setError('')
  }
  const quote = bookingQuote(product, draft)
  const hotel = HOTELS.find((h) => h.id === product.hotelId)
  const isHotel = product.category === 'Hotel'
  useEffect(() => {
    const controller = new AbortController()
    setAvailable(null)
    if (!draft.date || (isHotel && !draft.endDate))
      return () => controller.abort()
    const params = new URLSearchParams({
      productId: product.id,
      date: draft.date,
      endDate: draft.endDate,
      departure: draft.departure,
      variantId: draft.variantId,
    })
    const timer = setTimeout(() => {
      api<{ available: number }>(`/api/availability?${params}`, {
        signal: controller.signal,
      })
        .then((data) => setAvailable(data.available))
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    product.id,
    draft.date,
    draft.endDate,
    draft.departure,
    draft.variantId,
    isHotel,
  ])
  const pay = async (success = true) => {
    if (inFlight.current || !agreed || !config?.paymentReady) return
    inFlight.current = true
    setBusy(true)
    setError('')
    const fingerprint = JSON.stringify(draft)
    if (!attempt.current.key || attempt.current.fingerprint !== fingerprint)
      attempt.current = { key: crypto.randomUUID(), fingerprint }
    try {
      let order = await createServerBooking(draft, attempt.current.key)
      if (config.paymentMode === 'demo' && order.status === 'pending')
        order = await bookingAction(order.id, 'demo-payment', success)
      if (!mounted.current) return
      if (config.paymentMode === 'demo' && order.status !== 'paid') {
        attempt.current.key = ''
        setError(
          'Pembayaran uji gagal. Pesanan dibatalkan tanpa menerbitkan voucher. Silakan coba lagi.'
        )
        return
      }
      if (
        config.paymentMode !== 'demo' &&
        order.status === 'pending' &&
        order.paymentUrl
      ) {
        window.location.assign(order.paymentUrl)
        return
      }
      onComplete(order)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Pemesanan gagal. Silakan coba lagi.'
      )
      void refreshBookings()
    } finally {
      inFlight.current = false
      if (mounted.current) setBusy(false)
    }
  }
  return (
    <section className="consumer-container travel-page">
      <button
        onClick={onBack}
        disabled={busy}
        className="travel-text-button mb-6"
      >
        <ArrowLeft size={16} />
        Kembali menjelajah
      </button>
      <div className="travel-checkout-heading">
        <div>
          <p className="section-eyebrow">Sedikit lagi menuju cerita baru</p>
          <h1>Rencanakan perjalananmu.</h1>
        </div>
        <ol className="travel-steps">
          <li className="active">
            <span>{stage === 'payment' ? <Check size={13} /> : '1'}</span>Detail
          </li>
          <li className={stage === 'payment' ? 'active' : ''}>
            <span>2</span>Pembayaran
          </li>
          <li>
            <span>3</span>Tiket
          </li>
        </ol>
      </div>
      <div className="checkout-layout">
        <div className="checkout-details">
          <article className="travel-panel checkout-product">
            <img src={product.image} alt={product.name} />
            <div>
              <p className="section-eyebrow">{product.category}</p>
              <h2>{product.name}</h2>
              <p className="travel-location">
                <MapPin size={14} />
                {product.location}
              </p>
              <p className="travel-description">{product.description}</p>
            </div>
          </article>
          {stage === 'details' ? (
            <form
              id="booking-details"
              onSubmit={(e) => {
                e.preventDefault()
                const issue = validateBooking(product, draft)
                if (issue) {
                  setError(issue)
                  return
                }
                if (available !== null && available < draft.quantity) {
                  setError(
                    'Ketersediaan tidak mencukupi. Pilih tanggal atau jumlah lain.'
                  )
                  return
                }
                setError('')
                setStage('payment')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <article className="travel-panel mt-5">
                <h2>
                  <CalendarDays size={18} />
                  Detail {isHotel ? 'menginap' : 'kunjungan'}
                </h2>
                <div className="travel-form-grid mt-5">
                  <label className="travel-field">
                    {isHotel
                      ? 'Check-in'
                      : product.category === 'Tiket Kapal'
                        ? 'Tanggal keberangkatan'
                        : 'Tanggal mulai'}
                    <input
                      type="date"
                      required
                      min={todayISO()}
                      value={draft.date}
                      onChange={(e) => {
                        const date = e.target.value
                        setDraft((d) => ({
                          ...d,
                          date,
                          endDate:
                            d.endDate <= date ? addDays(date, 1) : d.endDate,
                        }))
                        setError('')
                      }}
                    />
                  </label>
                  {isHotel && (
                    <label className="travel-field">
                      Check-out
                      <input
                        type="date"
                        required
                        min={addDays(draft.date || todayISO(), 1)}
                        max={addDays(draft.date || todayISO(), 30)}
                        value={draft.endDate}
                        onChange={(e) => update('endDate', e.target.value)}
                      />
                    </label>
                  )}
                  <label className="travel-field">
                    {isHotel
                      ? 'Jumlah kamar'
                      : product.category === 'Tiket Kapal'
                        ? 'Penumpang'
                        : 'Peserta'}
                    <select
                      aria-label={
                        isHotel
                          ? 'Jumlah kamar'
                          : product.category === 'Tiket Kapal'
                            ? 'Penumpang'
                            : 'Peserta'
                      }
                      value={draft.quantity}
                      onChange={(e) => {
                        const quantity = Number(e.target.value)
                        setDraft((d) => ({
                          ...d,
                          quantity,
                          rooms: Math.max(d.rooms, Math.ceil(quantity / 2)),
                        }))
                        setError('')
                      }}
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} {isHotel ? 'kamar' : 'orang'}
                        </option>
                      ))}
                    </select>
                  </label>
                  {product.departures && (
                    <label className="travel-field">
                      Jam berangkat (WITA)
                      <select
                        aria-label="Jam berangkat (WITA)"
                        value={draft.departure}
                        onChange={(e) => update('departure', e.target.value)}
                      >
                        {product.departures.map((time) => (
                          <option key={time}>{time}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {product.variants && (
                    <label className="travel-field">
                      Jenis tiket
                      <select
                        aria-label="Jenis tiket"
                        value={draft.variantId}
                        onChange={(e) => update('variantId', e.target.value)}
                      >
                        {product.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} · {rupiah(v.price)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <p className="travel-help">
                  {isHotel
                    ? `${quote.nights || 0} malam · maksimal 2 tamu per kamar`
                    : product.durationDays
                      ? `${product.durationDays} hari · selesai ${dateLabel(addDays(draft.date || todayISO(), product.durationDays - 1))}`
                      : (product.duration ??
                        'Tiket berlaku pada tanggal pilihan')}{' '}
                  ·{' '}
                  {available === null
                    ? 'Memeriksa kuota server…'
                    : `${available} ${isHotel ? 'kamar' : 'tempat'} tersedia`}{' '}
                </p>
                {product.arrival && (
                  <div className="travel-info mt-4">
                    <Ship size={18} />
                    <div>
                      <strong>{product.address}</strong>
                      <p>Tujuan: {product.arrival}</p>
                      <small>
                        {product.highlights.join(' · ')} ·{' '}
                        {product.id === 'boat-padangbai' ||
                        product.id === 'boat-lembar'
                          ? 'Jam Bali & Lombok: WITA'
                          : 'Waktu setempat: WITA'}
                      </small>
                    </div>
                  </div>
                )}
              </article>
              {product.category === 'Paket Wisata' && (
                <article className="travel-panel mt-5">
                  <h2>
                    <Layers3 size={18} />
                    Yang ada dalam paket
                  </h2>
                  <div className="included-list">
                    {product.destinationIds?.map((id) => (
                      <p key={id}>
                        <CheckCircle2 size={15} />
                        Tiket {MARKET_PRODUCTS.find((p) => p.id === id)?.name}
                      </p>
                    ))}
                  </div>
                  <div className="travel-info">
                    <Compass size={18} />
                    <p>
                      Rute mandiri. Transportasi antar tempat, pemandu, makanan,
                      dan hotel belum termasuk. Jam dan alamat itinerary lengkap
                      terbuka setelah pembayaran berhasil.
                    </p>
                  </div>
                  <ItineraryOverview product={product} />
                  {hotel && (
                    <>
                      <label className="hotel-addon">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.hotelId)}
                          onChange={(e) =>
                            update('hotelId', e.target.checked ? hotel.id : '')
                          }
                        />
                        <span>
                          <strong>Tambahkan {hotel.name}</strong>
                          <small>
                            {rupiah(hotel.price)} / kamar / malam ·{' '}
                            {quote.nights} malam · 2 tamu / kamar
                          </small>
                        </span>
                        <Hotel size={22} />
                      </label>
                      {draft.hotelId && (
                        <label className="travel-field mt-3">
                          Kamar tambahan
                          <select
                            aria-label="Kamar tambahan"
                            value={draft.rooms}
                            onChange={(e) =>
                              update('rooms', Number(e.target.value))
                            }
                          >
                            {Array.from({ length: 5 }, (_, i) => (
                              <option
                                key={i}
                                value={i + 1}
                                disabled={i + 1 < Math.ceil(draft.quantity / 2)}
                              >
                                {i + 1} kamar · maks. {(i + 1) * 2} tamu
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                </article>
              )}
              <article className="travel-panel mt-5">
                <h2>Data pemesan</h2>
                <p className="travel-help">
                  Nama ini akan tercantum di seluruh voucher dalam pesanan.
                </p>
                <div className="travel-form-grid mt-5">
                  <label className="travel-field">
                    Nama lengkap
                    <input
                      autoComplete="name"
                      required
                      minLength={3}
                      maxLength={100}
                      value={draft.customerName}
                      onChange={(e) => update('customerName', e.target.value)}
                      placeholder="Sesuai identitas pemesan"
                    />
                  </label>
                  <label className="travel-field">
                    Email
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={150}
                      value={draft.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="nama@email.com"
                    />
                  </label>
                  <label className="travel-field">
                    Nomor telepon
                    <input
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={20}
                      value={draft.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </label>
                </div>
              </article>
            </form>
          ) : (
            <article className="travel-panel mt-5">
              <h2>Periksa & selesaikan pembayaran</h2>
              <div className="payment-summary">
                <span>{draft.customerName}</span>
                <span>{draft.email}</span>
                <span>{draft.phone}</span>
                <strong>
                  {dateLabel(draft.date)}
                  {isHotel ? ` – ${dateLabel(draft.endDate)}` : ''}
                  {draft.departure ? ` · ${draft.departure} WITA` : ''} ·{' '}
                  {draft.quantity} {isHotel ? 'kamar' : 'orang'}
                </strong>
              </div>
              <button
                className="travel-text-button"
                disabled={busy}
                onClick={() => {
                  setStage('details')
                  setAgreed(false)
                  setError('')
                }}
              >
                Ubah detail pemesanan
              </button>
              <h3 className="mt-6 text-sm font-semibold">Metode pembayaran</h3>
              <div className="payment-methods">
                {(['QRIS', 'Virtual Account'] as const).map((method) => (
                  <label
                    className={draft.paymentMethod === method ? 'selected' : ''}
                    key={method}
                  >
                    <input
                      disabled={busy}
                      type="radio"
                      name="payment"
                      value={method}
                      checked={draft.paymentMethod === method}
                      onChange={() => update('paymentMethod', method)}
                    />
                    <strong>{method}</strong>
                    <small>
                      {method === 'QRIS'
                        ? 'Pembayaran digital'
                        : 'Transfer bank'}
                    </small>
                  </label>
                ))}
              </div>
              <div className="travel-info mt-5">
                <CircleAlert size={19} />
                <p>
                  {config?.paymentMode === 'production'
                    ? 'Pembayaran diproses oleh Midtrans. Voucher diterbitkan setelah server menerima konfirmasi pembayaran. Periksa komponen yang termasuk sebelum melanjutkan.'
                    : 'Mode pengujian: tidak ada tagihan atau reservasi perjalanan nyata. Pesanan tersimpan di server; voucher hanya terbit setelah konfirmasi pembayaran uji.'}
                </p>
              </div>
              <label className="payment-consent">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  Saya sudah memeriksa tanggal, jumlah, dan komponen yang
                  termasuk dalam pesanan ini.
                </span>
              </label>
            </article>
          )}
        </div>
        <aside className="travel-panel checkout-summary">
          <p className="section-eyebrow">Semua lebih terencana</p>
          <h2>Ringkasan pesanan</h2>
          <div className="summary-lines">
            <p>
              <span>
                {product.name}
                <small>
                  {draft.quantity}{' '}
                  {isHotel
                    ? `kamar × ${Math.max(0, quote.nights)} malam`
                    : 'orang'}
                </small>
              </span>
              <strong>{rupiah(quote.subtotal)}</strong>
            </p>
            {draft.hotelId && (
              <p>
                <span>
                  Tambahan hotel
                  <small>
                    {draft.rooms} kamar × {quote.nights} malam
                  </small>
                </span>
                <strong>{rupiah(quote.hotelTotal)}</strong>
              </p>
            )}
            <p>
              <span>Biaya layanan</span>
              <strong>{rupiah(quote.fee)}</strong>
            </p>
          </div>
          <div className="summary-total">
            <span>Total pembayaran</span>
            <strong>{rupiah(quote.total)}</strong>
          </div>
          {(error || configError) && (
            <p className="travel-error" role="alert">
              {error || configError}
            </p>
          )}
          {stage === 'details' ? (
            <button
              className="travel-primary w-full justify-center"
              type="submit"
              form="booking-details"
            >
              Lanjut ke pembayaran
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                className="travel-primary w-full justify-center"
                disabled={!agreed || busy || !config?.paymentReady}
                onClick={() => pay(true)}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    {config?.paymentMode === 'demo'
                      ? 'Simulasikan pembayaran berhasil'
                      : config?.paymentMode === 'sandbox'
                        ? 'Bayar melalui Midtrans Sandbox'
                        : 'Bayar melalui Midtrans'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              {config?.paymentMode === 'demo' && (
                <button
                  disabled={busy || !agreed}
                  onClick={() => pay(false)}
                  className="travel-text-button mt-4 w-full justify-center"
                >
                  Coba pembayaran gagal
                </button>
              )}
            </>
          )}
          {config && !config.paymentReady && (
            <p role="status" className="travel-error mt-4">
              {config.paymentMode === 'production' && !config.catalogApproved
                ? 'Pemesanan belum dibuka. Inventori mitra sedang diverifikasi pengelola.'
                : 'Pembayaran belum dikonfigurasi oleh pengelola.'}
            </p>
          )}
          <div className="summary-promise">
            <Ticket size={19} />
            <p>
              Voucher diterbitkan setelah pembayaran berhasil.
              <small>Itinerary lengkap tersedia bersama tiket paket.</small>
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export function bookingStatusLabel(booking: TravelBooking) {
  if (booking.status === 'pending') return 'Menunggu pembayaran'
  if (booking.status === 'expired') return 'Kedaluwarsa'
  if (booking.status === 'cancelled') return 'Dibatalkan'
  if (booking.status === 'payment_review') return 'Perlu ditinjau pengelola'
  return booking.paymentMode === 'production' ? 'Lunas' : 'Lunas · pengujian'
}

function PendingBooking({
  booking,
  onBack,
  onExplore,
}: {
  booking: TravelBooking
  onBack: () => void
  onExplore: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const action = async (
    kind: 'refresh-payment' | 'demo-payment',
    success?: boolean
  ) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await bookingAction(booking.id, kind, success)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status belum dapat diperiksa.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="consumer-container travel-page">
      <button className="travel-text-button mb-6" onClick={onBack}>
        <ArrowLeft size={16} />
        Semua pesanan
      </button>
      <div className="travel-panel max-w-2xl mx-auto">
        <p className="section-eyebrow">{booking.id}</p>
        <h1>{bookingStatusLabel(booking)}</h1>
        <h2 className="mt-5">{booking.title}</h2>
        <p className="travel-description">
          {dateLabel(booking.draft.date)} · {booking.draft.quantity}{' '}
          {booking.category === 'Hotel' ? 'kamar' : 'orang'} ·{' '}
          {rupiah(booking.total)}
        </p>
        <p className="travel-info mt-5">
          {booking.status === 'pending'
            ? 'Voucher dan itinerary lengkap belum diterbitkan. Selesaikan pembayaran, lalu periksa status. Status di halaman penyedia belum menjadi bukti pelunasan sampai server memverifikasinya.'
            : booking.status === 'payment_review'
              ? 'Pembayaran memerlukan pemeriksaan pengelola. Jangan membayar ulang. Hubungi pengelola dengan nomor pesanan ini untuk konfirmasi atau pengembalian dana.'
              : 'Pesanan ini tidak memiliki voucher aktif. Mulai pesanan baru untuk memilih tanggal dan kuota yang tersedia.'}
        </p>
        {booking.expiresAt && booking.status === 'pending' && (
          <p className="travel-help">
            Batas reservasi:{' '}
            {new Date(booking.expiresAt).toLocaleString('id-ID', {
              timeZone: 'Asia/Makassar',
            })}{' '}
            WITA. Halaman Midtrans dapat memiliki batas pembayaran yang lebih
            awal.
          </p>
        )}
        {error && (
          <p className="travel-error mt-5" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {booking.status === 'pending' && booking.paymentUrl && (
            <a className="travel-primary" href={booking.paymentUrl}>
              Lanjutkan pembayaran
              <ArrowRight size={15} />
            </a>
          )}
          {booking.status === 'pending' && booking.paymentMode === 'demo' && (
            <>
              <button
                className="travel-primary"
                disabled={busy}
                onClick={() => action('demo-payment', true)}
              >
                Simulasikan pembayaran berhasil
              </button>
              <button
                className="travel-secondary"
                disabled={busy}
                onClick={() => action('demo-payment', false)}
              >
                Coba pembayaran gagal
              </button>
            </>
          )}
          {booking.status === 'pending' && (
            <button
              className="travel-secondary"
              disabled={busy}
              onClick={() => action('refresh-payment')}
            >
              {busy ? 'Memeriksa…' : 'Periksa status pembayaran'}
            </button>
          )}
          {booking.status !== 'pending' && (
            <button className="travel-primary" onClick={onExplore}>
              Jelajahi pilihan lain
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

async function downloadBooking(booking: TravelBooking) {
  const html = await bookingDocument(booking)
  const url = URL.createObjectURL(
    new Blob([html], { type: 'text/html;charset=utf-8' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `${booking.id}-tiket.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BookingLibrary({
  selectedId,
  onSelect,
  onExplore,
  compact = false,
}: {
  selectedId?: string
  onSelect: (id: string) => void
  onExplore: () => void
  compact?: boolean
}) {
  const { bookings: orders, loading, error } = useBookingState()
  const [filter, setFilter] = useState('Semua')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  async function downloadTickets(booking: TravelBooking) {
    setDownloading(true)
    setDownloadError('')
    try {
      await downloadBooking(booking)
    } catch {
      setDownloadError('Tiket belum dapat diunduh. Silakan coba kembali.')
    } finally {
      setDownloading(false)
    }
  }
  const selected =
    !compact && selectedId ? orders.find((b) => b.id === selectedId) : undefined
  if (loading)
    return (
      <section className="consumer-container travel-page">
        <p className="travel-info" role="status">
          Memuat pesanan dari server…
        </p>
      </section>
    )
  if (error)
    return (
      <section className="consumer-container travel-page">
        <p role="alert" className="travel-error">
          {error}
        </p>
        <button
          className="travel-primary"
          onClick={() => void refreshBookings()}
        >
          Muat ulang pesanan
        </button>
      </section>
    )
  if (selected && selected.status !== 'paid')
    return (
      <PendingBooking
        booking={selected}
        onBack={() => onSelect('')}
        onExplore={onExplore}
      />
    )
  if (selected) {
    const product = MARKET_PRODUCTS.find((p) => p.id === selected.productId)
    return (
      <section className="consumer-container travel-page">
        <button
          className="travel-text-button mb-6"
          onClick={() => onSelect('')}
        >
          <ArrowLeft size={16} />
          Semua pesanan
        </button>
        <div className="booking-success">
          <CheckCircle2 size={28} />
          <div>
            <h1>
              {selected.paymentMode === 'production'
                ? 'Pembayaran berhasil.'
                : 'Pembayaran uji berhasil.'}
            </h1>
            <p>
              Voucher sudah terbit. Semua rencana tersimpan dalam satu pesanan.
            </p>
          </div>
          <span>{selected.id}</span>
        </div>
        <div className="checkout-layout mt-6">
          <div>
            <article className="travel-panel">
              <p className="section-eyebrow">{selected.category}</p>
              <h2>{selected.title}</h2>
              <p className="travel-help">
                {selected.draft.customerName} · {dateLabel(selected.draft.date)}
                {selected.draft.departure &&
                  ` · ${selected.draft.departure} WITA`}{' '}
                · {selected.vouchers.length} voucher
              </p>
              <div className="voucher-grid">
                {selected.vouchers.map((v) => (
                  <div className="travel-voucher" key={v.id}>
                    <div>
                      <span className="voucher-type">
                        <Ticket size={14} />
                        {v.category}
                      </span>
                      <span
                        className={`voucher-status ${v.checkedIn ? 'used' : ''}`}
                      >
                        {v.checkedIn
                          ? 'Sudah digunakan'
                          : selected.paymentMode === 'production'
                            ? 'Aktif'
                            : 'Aktif · uji'}
                      </span>
                    </div>
                    <h3>{v.title}</h3>
                    <p>
                      {dateLabel(v.date)}
                      {v.endDate ? ` – ${dateLabel(v.endDate)}` : ''} ·{' '}
                      {v.quantity} {v.category === 'Hotel' ? 'kamar' : 'orang'}
                    </p>
                    {v.category === 'Tiket Kapal' &&
                      selected.draft.departure && (
                        <p>Keberangkatan: {selected.draft.departure} WITA</p>
                      )}
                    <VoucherQRCode code={v.id} title={v.title} />
                    <code>{v.id}</code>
                    <small>
                      {selected.paymentMode === 'production'
                        ? 'Kode validasi voucher'
                        : 'Voucher pengujian · bukan tiket perjalanan nyata'}
                    </small>
                  </div>
                ))}
              </div>
            </article>
            {selected.itinerary.length > 0 && (
              <article className="travel-panel mt-5">
                <p className="section-eyebrow">Rencana perjalanan lengkap</p>
                <h2>Itinerary untuk ceritamu.</h2>
                <p className="travel-help">
                  Semua waktu dalam WITA. Jam kunjungan adalah saran dan dapat
                  disesuaikan; transportasi antar tempat diatur mandiri.
                </p>
                <div className="itinerary-timeline">
                  {selected.itinerary.map((stop, i) => (
                    <div className="itinerary-stop" key={i}>
                      <span className={`timeline-symbol ${stop.type}`}>
                        {stop.type === 'hotel' ? (
                          <Hotel size={16} />
                        ) : stop.type === 'kuliner' ? (
                          <UtensilsCrossed size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </span>
                      <div>
                        <p className="timeline-time">
                          Hari {stop.day} ·{' '}
                          {dateLabel(
                            addDays(selected.draft.date, stop.day - 1)
                          )}{' '}
                          · {stop.time}
                        </p>
                        <h3>{stop.title}</h3>
                        <span
                          className={`itinerary-status ${stop.included ? 'included' : ''}`}
                        >
                          {stop.included
                            ? 'Termasuk pesanan'
                            : stop.type === 'hotel'
                              ? 'Rekomendasi · belum dipesan'
                              : 'Rekomendasi · bayar di tempat'}
                        </span>
                        <p>{stop.description}</p>
                        <a
                          href={mapLink(stop.address)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin size={13} />
                          {stop.address}
                          <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )}
            {product && selected.itinerary.length === 0 && (
              <article className="travel-panel mt-5">
                <h2>Informasi kedatangan</h2>
                <p className="travel-description">
                  {product.highlights.join(' · ')}
                </p>
                <a
                  className="travel-text-button mt-4"
                  href={mapLink(product.address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={16} />
                  {product.address}
                  <ArrowRight size={14} />
                </a>
                {product.arrival && (
                  <p className="travel-help">
                    Tujuan: {product.arrival} · durasi {product.duration} ·{' '}
                    {selected.draft.departure} WITA
                  </p>
                )}
              </article>
            )}
          </div>
          <aside className="travel-panel checkout-summary">
            <h2>Bukti pembayaran</h2>
            <div className="summary-lines">
              <p>
                <span>Pesanan</span>
                <strong>{rupiah(selected.subtotal)}</strong>
              </p>
              {selected.hotelTotal > 0 && (
                <p>
                  <span>Hotel tambahan</span>
                  <strong>{rupiah(selected.hotelTotal)}</strong>
                </p>
              )}
              <p>
                <span>Biaya layanan</span>
                <strong>{rupiah(selected.fee)}</strong>
              </p>
              <p>
                <span>Metode</span>
                <strong>{selected.draft.paymentMethod}</strong>
              </p>
            </div>
            <div className="summary-total">
              <span>
                Total{' '}
                {selected.paymentMode === 'production'
                  ? 'dibayar'
                  : 'pengujian'}
              </span>
              <strong>{rupiah(selected.total)}</strong>
            </div>
            <button
              className="travel-primary w-full justify-center"
              disabled={downloading}
              onClick={() => void downloadTickets(selected)}
            >
              <Download size={16} />
              {downloading ? 'Menyiapkan tiket…' : 'Unduh voucher & itinerary'}
            </button>
            {downloadError && (
              <p role="alert" className="travel-error mt-3">
                {downloadError}
              </p>
            )}
            <p className="travel-help mt-3">
              File HTML berisi QR setiap voucher dan itinerary. Bisa dibuka
              offline atau dicetak ke PDF melalui browser.
            </p>
            <p className="travel-demo-note mt-4">
              {selected.paymentMode === 'production'
                ? 'Pesanan tersimpan pada akunmu. Tunjukkan kode voucher kepada petugas terkait.'
                : 'Pesanan tersimpan di server. Voucher pengujian tidak berlaku untuk perjalanan nyata.'}
            </p>
          </aside>
        </div>
      </section>
    )
  }
  const visible = orders.filter(
    (b) => filter === 'Semua' || b.category === filter
  )
  return (
    <section
      className={
        compact ? 'travel-history-section' : 'consumer-container travel-page'
      }
    >
      <div className="travel-section-heading">
        <div>
          <p className="section-eyebrow">Rencana yang sudah siap</p>
          <h1 className="section-title">
            {compact ? 'Pesanan perjalananmu' : 'Tiket & pesanan saya'}
          </h1>
          <p className="section-description">
            Tiket destinasi, paket wisata, voucher hotel, dan tiket kapal dalam
            satu tempat.
          </p>
        </div>
        <button className="travel-text-button" onClick={onExplore}>
          Jelajahi lagi
          <ArrowRight size={15} />
        </button>
      </div>
      {!compact && (
        <div className="travel-filter-chips">
          {['Semua', 'Destinasi', 'Paket Wisata', 'Hotel', 'Tiket Kapal'].map(
            (f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            )
          )}
        </div>
      )}
      {visible.length === 0 ? (
        <div className="travel-empty">
          <Ticket size={35} />
          <h3>
            Belum ada {filter === 'Semua' ? 'pesanan' : filter.toLowerCase()}
          </h3>
          <p>Pesanan dan itinerary akan muncul setelah pembayaran berhasil.</p>
          <button className="travel-primary" onClick={onExplore}>
            Mulai menjelajah
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="booking-list">
          {visible.map((order) => (
            <button
              key={order.id}
              onClick={() => onSelect(order.id)}
              className="booking-list-item"
            >
              <img src={order.image} alt="" />
              <span>
                <small>
                  {order.category} · {order.id}
                </small>
                <strong>{order.title}</strong>
                <span>
                  {dateLabel(order.draft.date)} · {order.vouchers.length}{' '}
                  voucher · {order.draft.quantity}{' '}
                  {order.category === 'Hotel' ? 'kamar' : 'orang'}
                </span>
              </span>
              <span className="booking-list-price">
                <strong>{rupiah(order.total)}</strong>
                <small>{bookingStatusLabel(order)}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
