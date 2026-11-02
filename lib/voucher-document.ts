import QRCode from 'qrcode'
import { TravelBooking } from '@/types/marketplace'
import { dateLabel, rupiah } from './marketplace-data'

// Encode the exact value accepted by the operator's voucher validation endpoint.
// Generate locally so voucher codes never go to an external QR service.
export async function voucherQrDataUrl(code: string) {
  if (!/^V-[a-f0-9-]{36}$/.test(code))
    throw new Error('Kode voucher tidak valid.')
  const svg = await QRCode.toString(code, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 240,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!
  )

export async function bookingDocument(booking: TravelBooking) {
  if (booking.status !== 'paid' || !booking.vouchers.length)
    throw new Error('Tiket tersedia setelah pembayaran berhasil.')
  const isLive = booking.paymentMode === 'production'
  const vouchers = await Promise.all(
    booking.vouchers.map(async (voucher) => {
      const qr = await voucherQrDataUrl(voucher.id)
      return `<article class="ticket"><div><span class="tag">${escapeHtml(voucher.category)}</span><span class="status">${voucher.checkedIn ? 'Sudah digunakan' : isLive ? 'Aktif' : 'Aktif · uji'}</span></div>
        <h2>${escapeHtml(voucher.title)}</h2><p>${escapeHtml(dateLabel(voucher.date))}${voucher.endDate ? ` – ${escapeHtml(dateLabel(voucher.endDate))}` : ''} · ${voucher.quantity} ${voucher.category === 'Hotel' ? 'kamar' : 'orang'}</p>
        ${voucher.category === 'Tiket Kapal' && booking.draft.departure ? `<p>Keberangkatan: ${escapeHtml(booking.draft.departure)} WITA</p>` : ''}
        <img class="qr" src="${escapeHtml(qr)}" width="220" height="220" alt="QR voucher ${escapeHtml(voucher.title)}"><p class="scan">Tunjukkan QR kepada petugas untuk validasi.</p><code>${escapeHtml(voucher.id)}</code></article>`
    })
  )
  const itinerary = booking.itinerary.length
    ? `<section><h2>Saran itinerary lengkap</h2><p>Waktu dalam WITA. Jam kunjungan fleksibel; transportasi antar tempat diatur mandiri.</p>${booking.itinerary.map((stop) => `<article class="stop"><span class="tag">Hari ${stop.day} · ${escapeHtml(stop.time)} WITA</span><h3>${escapeHtml(stop.title)}</h3><p>${escapeHtml(stop.address)}</p><p>${escapeHtml(stop.description)}</p><strong>${stop.included ? 'Termasuk pesanan' : 'Rekomendasi · biaya terpisah'}</strong></article>`).join('')}</section>`
    : ''
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(booking.id)} · Tiket SILAQ</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#0f172a;font:15px/1.6 system-ui,sans-serif}main{max-width:850px;margin:32px auto;padding:24px}header,section{margin-bottom:24px}h1{font-size:28px;line-height:1.2}h2{font-size:20px}h3{margin-bottom:4px}p{color:#64748b;margin:8px 0}.notice{padding:14px 18px;background:#fff3db;border:1px solid #efd6a7;border-radius:12px}.tickets{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:20px}.ticket{background:white;border:1px solid #e2e8f0;border-radius:18px;padding:24px;break-inside:avoid}.ticket>div{display:flex;justify-content:space-between;gap:10px}.tag,.status{font-size:12px;font-weight:650}.status{color:#207451}.qr{display:block;margin:16px auto;background:white;max-width:100%;height:auto}.scan{text-align:center;font-size:13px}code{display:block;border-top:1px dashed #e2e8f0;padding-top:12px;overflow-wrap:anywhere;font-size:12px}.stop{border-left:3px solid #bae6fd;padding:12px 20px;margin:16px 0;break-inside:avoid}.stop strong{font-size:12px}footer{font-size:12px;color:#64748b}@media(max-width:480px){main{margin:0;padding:18px}.ticket{padding:18px}}@media print{body{background:white}main{max-width:none;margin:0;padding:0}.print-help{display:none}.ticket{box-shadow:none}section{break-before:auto}a{color:inherit}}
    </style></head><body><main><header><strong>SILAQ / E-TICKET</strong><h1>${escapeHtml(booking.title)}</h1><p>${escapeHtml(booking.id)}</p><p>Pemesan: ${escapeHtml(booking.draft.customerName)} · ${escapeHtml(dateLabel(booking.draft.date))}</p><p>Pembayaran berhasil · ${escapeHtml(rupiah(booking.total))} · ${escapeHtml(booking.draft.paymentMethod)}</p>${isLive ? '' : '<p class="notice">CONTOH TIKET PENGUJIAN — tidak berlaku untuk perjalanan nyata.</p>'}<p class="print-help">Simpan file ini untuk membuka QR secara offline. Gunakan menu browser → Cetak untuk menyimpan sebagai PDF.</p></header><section class="tickets">${vouchers.join('')}</section>${itinerary}<footer>Status dan tanggal voucher diperiksa kembali oleh server saat check-in. Satu QR berlaku untuk jumlah tamu/kamar yang tercantum; setiap voucher divalidasi sekali.</footer></main></body></html>`
}
