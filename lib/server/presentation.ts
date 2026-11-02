import 'server-only'

export function presentationEnabled() {
  if (
    process.env.PRESENTATION_MODE === 'false' ||
    process.env.PAYMENT_MODE === 'production' ||
    process.env.CATALOG_APPROVED === 'true'
  )
    return false
  if (process.env.PRESENTATION_MODE === 'true') return true
  const databaseConfigured =
    Boolean(process.env.DATABASE_URL) ||
    (process.env.LOCAL_DATABASE === 'true' && !process.env.VERCEL)
  return !databaseConfigured && !process.env.MIDTRANS_SERVER_KEY
}
