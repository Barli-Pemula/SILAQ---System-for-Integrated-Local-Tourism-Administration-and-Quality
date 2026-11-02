'use client'

import { useState } from 'react'
import { CircleAlert, Layers3, Search, Ticket } from 'lucide-react'
import {
  checkInVoucher,
  refreshBookings,
  useBookingState,
} from '@/lib/booking-store'
import { bookingStatusLabel } from '@/components/consumer/TravelMarketplace'
import {
  CULINARY_PLACES,
  dateLabel,
  MARKET_PRODUCTS,
  rupiah,
} from '@/lib/marketplace-data'

export default function TravelOperations() {
  const { bookings, loading, error } = useBookingState()
  const paid = bookings.filter((b) => b.status === 'paid')
  const [checking, setChecking] = useState('')
  const validate = async (id: string, code: string) => {
    if (checking) return
    setChecking(code)
    try {
      setNotice(await checkInVoucher(id, code))
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Check-in gagal.')
    } finally {
      setChecking('')
    }
  }
  const [filter, setFilter] = useState('Semua')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('Pesanan')
  const [notice, setNotice] = useState('')
  const visible = bookings.filter(
    (b) =>
      (filter === 'Semua' || b.category === filter) &&
      `${b.id} ${b.title} ${b.draft.customerName}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  const catalog = MARKET_PRODUCTS.filter(
    (p) =>
      (filter === 'Semua' || p.category === filter) &&
      `${p.name} ${p.location}`.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div>
      <div className="travel-info mb-5">
        <CircleAlert size={19} />
        <p>
          Pesanan dan validasi voucher tersimpan di server. Mitra hanya dapat
          memvalidasi layanan yang ditugaskan ke akunnya. Label pengujian
          berarti transaksi tanpa tagihan perjalanan nyata.
        </p>
      </div>
      {loading && <p className="travel-info mb-4">Memuat pesanan…</p>}
      {error && (
        <div className="travel-error" role="alert">
          {error}
          <button
            className="ml-3 underline"
            onClick={() => void refreshBookings()}
          >
            Muat ulang
          </button>
        </div>
      )}
      <div className="ops-metrics">
        {[
          ['Pesanan lunas', String(paid.length)],
          [
            'Nilai pesanan lunas',
            rupiah(paid.reduce((n, b) => n + b.total, 0)),
          ],
          [
            'Voucher terbit',
            String(bookings.reduce((n, b) => n + b.vouchers.length, 0)),
          ],
          [
            'Pilihan layanan',
            String(MARKET_PRODUCTS.length + CULINARY_PLACES.length),
          ],
        ].map(([label, value]) => (
          <div className="travel-panel" key={label}>
            <span>{label}</span>
            <strong
              style={{
                fontSize: label.includes('Nilai') ? '1.1rem' : undefined,
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>
      <div className="travel-tabs">
        {['Pesanan', 'Katalog layanan'].map((v) => (
          <button
            key={v}
            className={v === view ? 'active' : ''}
            onClick={() => {
              setView(v)
              setFilter('Semua')
            }}
          >
            {v === 'Pesanan' ? <Ticket size={17} /> : <Layers3 size={17} />}
            {v}
          </button>
        ))}
      </div>
      <div className="travel-search-row">
        <label className="travel-search">
          <Search size={17} />
          <input
            aria-label="Cari pesanan atau layanan"
            placeholder="Cari nomor pesanan, nama, atau layanan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Kategori operasional"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            'Semua',
            'Destinasi',
            'Paket Wisata',
            'Hotel',
            'Tiket Kapal',
            ...(view === 'Katalog layanan' ? ['Kuliner'] : []),
          ].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      {notice && (
        <p role="status" className="travel-info mb-4">
          {notice}
          <button className="ml-auto text-xs" onClick={() => setNotice('')}>
            Tutup
          </button>
        </p>
      )}
      {view === 'Pesanan' ? (
        visible.length === 0 ? (
          <div className="travel-empty">
            <Ticket size={30} />
            <h3>Belum ada pesanan yang cocok</h3>
            <p>
              Pesanan wisatawan ditampilkan sesuai status pembayaran dan hak
              akses akun.
            </p>
          </div>
        ) : (
          visible.map((b) => (
            <article className="travel-panel ops-order" key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="section-eyebrow">
                    {b.id} · {b.category}
                  </p>
                  <h3>{b.title}</h3>
                  <p className="travel-help">
                    {b.draft.customerName} · {b.draft.email} ·{' '}
                    {dateLabel(b.draft.date)}
                    {b.draft.departure ? ` · ${b.draft.departure} WITA` : ''}
                  </p>
                </div>
                <strong className="text-sm text-emerald-800">
                  {rupiah(b.total)} · {bookingStatusLabel(b)}
                </strong>
              </div>
              <div className="voucher-grid">
                {b.vouchers.map((v) => (
                  <div className="travel-voucher" key={v.id}>
                    <div>
                      <strong className="text-xs text-slate-700">
                        {v.title}
                      </strong>
                      <span
                        className={`voucher-status ${v.checkedIn ? 'used' : ''}`}
                      >
                        {v.checkedIn ? 'Sudah digunakan' : 'Aktif'}
                      </span>
                    </div>
                    <p>
                      {dateLabel(v.date)}
                      {v.endDate ? ` – ${dateLabel(v.endDate)}` : ''} ·{' '}
                      {v.quantity} {v.category === 'Hotel' ? 'kamar' : 'orang'}
                    </p>
                    <code>{v.id}</code>
                    <button
                      className="travel-secondary"
                      disabled={v.checkedIn || Boolean(checking)}
                      onClick={() => void validate(b.id, v.id)}
                    >
                      {v.checkedIn
                        ? 'Check-in tercatat'
                        : checking === v.id
                          ? 'Memvalidasi…'
                          : 'Validasi & check-in'}
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))
        )
      ) : (
        <>
          <p className="travel-demo-note">
            Katalog referensi bersama seluruh portal. Kuliner hanya menyediakan
            informasi dan alamat; tidak menghasilkan transaksi.
          </p>
          <div className="ops-catalog">
            {catalog.map((p) => (
              <article key={p.id}>
                <small>
                  {p.category} · {p.location}
                </small>
                <h3>{p.name}</h3>
                <p>
                  {rupiah(p.price)} / {p.unit}
                </p>
                <p>
                  {p.destinationIds
                    ? `${p.destinationIds.length} destinasi · ${p.durationDays} hari`
                    : p.departures
                      ? `${p.departures.join(', ')} WITA`
                      : `${p.capacity} kapasitas dasar / tanggal`}
                </p>
              </article>
            ))}
            {(filter === 'Semua' || filter === 'Kuliner') &&
              CULINARY_PLACES.filter((p) =>
                `${p.name} ${p.location}`
                  .toLowerCase()
                  .includes(query.toLowerCase())
              ).map((p) => (
                <article key={p.id}>
                  <small>Kuliner · Informasi saja</small>
                  <h3>{p.name}</h3>
                  <p>{p.address}</p>
                </article>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
