'use client'

import { useEffect, useState } from 'react'
import { voucherQrDataUrl } from '@/lib/voucher-document'

export function VoucherQRCode({
  code,
  title,
}: {
  code: string
  title: string
}) {
  const [image, setImage] = useState('')
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    setImage('')
    setError(false)
    voucherQrDataUrl(code).then(
      (url) => {
        if (active) setImage(url)
      },
      () => {
        if (active) setError(true)
      }
    )
    return () => {
      active = false
    }
  }, [code])
  return (
    <figure className="voucher-qr">
      {image ? (
        <img
          src={image}
          width={192}
          height={192}
          alt={`QR voucher ${title}`}
          data-voucher-code={code}
        />
      ) : (
        <p role="status">
          {error
            ? 'QR belum dapat ditampilkan. Gunakan kode voucher di bawah.'
            : 'Menyiapkan QR voucher…'}
        </p>
      )}
      {image && (
        <figcaption>
          QR unik untuk voucher ini. Tunjukkan kepada petugas untuk validasi.
        </figcaption>
      )}
    </figure>
  )
}
