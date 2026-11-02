'use client'
import { useState } from 'react'
import { Ticket, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/booking-store'

export default function VoucherScanner() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  return (
    <article className="travel-panel max-w-2xl">
      <h2>
        <Ticket size={20} />
        Validasi voucher
      </h2>
      <p className="travel-description">
        Masukkan kode voucher wisatawan atau gunakan pemindai barcode yang
        mengetik ke kolom ini. Server memeriksa pembayaran, tanggal, wewenang
        mitra, dan penggunaan sebelumnya.
      </p>
      <form
        className="mt-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (busy) return
          setBusy(true)
          setResult('')
          setError('')
          try {
            const data = await api<{ message: string }>(
              '/api/vouchers/validate',
              { method: 'POST', body: JSON.stringify({ code: code.trim() }) }
            )
            setResult(data.message)
            setCode('')
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Validasi gagal.')
          } finally {
            setBusy(false)
          }
        }}
      >
        <label className="travel-field">
          Kode voucher
          <input
            required
            autoComplete="off"
            placeholder="V-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <button className="travel-primary mt-4" disabled={busy} type="submit">
          {busy ? 'Memverifikasi…' : 'Verifikasi & check-in'}
        </button>
      </form>
      {result && (
        <p role="status" className="travel-info mt-5">
          <CheckCircle2 size={18} />
          {result}
        </p>
      )}
      {error && (
        <p role="alert" className="travel-error mt-5">
          {error}
        </p>
      )}
    </article>
  )
}
