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
  // APP_URL is the canonical payment callback URL, not the only address where
  // this app can be opened. Vercel's Host header retains the accessed alias or
  // custom domain, even when the function's request URL uses an internal host.
  // https://vercel.com/docs/headers/request-headers#host
  try {
    const origin = request.headers.get('origin')
    if (!origin) throw new Error()
    const source = new URL(origin)
    const target = new URL(request.url)
    const host = request.headers.get('host') ?? target.host
    // Do not accept host lists, credentials, paths, or forwarded-host overrides.
    if (!host || /[\s/\\?#@,%]/.test(host)) throw new Error()
    const protocol = process.env.VERCEL ? 'https:' : target.protocol
    const expected = new URL(`${protocol}//${host}`).origin
    if (
      !['http:', 'https:'].includes(source.protocol) ||
      source.origin !== origin ||
      source.origin !== expected
    )
      throw new Error()
  } catch {
    throw new HttpError(403, 'Asal permintaan tidak diizinkan.')
  }
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
