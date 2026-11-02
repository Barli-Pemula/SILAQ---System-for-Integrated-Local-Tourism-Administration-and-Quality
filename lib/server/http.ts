import 'server-only'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (text.length > 16000) throw new HttpError(413, 'Permintaan terlalu besar.')
  try {
    const data: unknown = JSON.parse(text)
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new Error()
    return data as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Format JSON tidak valid.')
  }
}

export function appOrigin() {
  const value =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (!value) return null
  try {
    const parsed = new URL(value)
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      (process.env.VERCEL && parsed.protocol !== 'https:')
    )
      throw new Error()
    return parsed.origin
  } catch {
    throw new HttpError(503, 'APP_URL tidak valid.')
  }
}

export function sameOrigin(request: Request) {
  const expected = appOrigin() || new URL(request.url).origin
  if (request.headers.get('origin') !== expected)
    throw new HttpError(403, 'Asal permintaan tidak diizinkan.')
}

export function failure(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status)
  console.error(
    '[SILAQ API]',
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[database]')
      : 'Unknown error'
  )
  return json(
    {
      error:
        'Layanan belum tersedia. Periksa konfigurasi server atau coba lagi.',
    },
    503
  )
}

export function paymentMode(): 'demo' | 'sandbox' | 'production' {
  const mode = process.env.PAYMENT_MODE || 'sandbox'
  if (!['demo', 'sandbox', 'production'].includes(mode))
    throw new HttpError(503, 'PAYMENT_MODE tidak valid.')
  if (mode === 'demo' && process.env.ALLOW_DEMO_PAYMENTS !== 'true')
    throw new HttpError(503, 'Pembayaran demo belum diaktifkan oleh pengelola.')
  return mode as 'demo' | 'sandbox' | 'production'
}
