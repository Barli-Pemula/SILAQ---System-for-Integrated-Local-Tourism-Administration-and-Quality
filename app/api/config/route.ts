import { appOrigin, json, paymentMode, failure } from '@/lib/server/http'
import { demoLoginTemplate } from '@/lib/server/demo-login'

export const runtime = 'nodejs'
export async function GET() {
  try {
    const mode = paymentMode()
    const catalogApproved = process.env.CATALOG_APPROVED === 'true'
    return json({
      databaseConfigured:
        Boolean(process.env.DATABASE_URL) ||
        (process.env.LOCAL_DATABASE === 'true' && !process.env.VERCEL),
      paymentMode: mode,
      catalogApproved,
      demoLogin: demoLoginTemplate(mode),
      paymentReady:
        mode === 'demo'
          ? process.env.ALLOW_DEMO_PAYMENTS === 'true'
          : Boolean(
              process.env.MIDTRANS_SERVER_KEY &&
              appOrigin() &&
              (mode !== 'production' || catalogApproved)
            ),
    })
  } catch (error) {
    return failure(error)
  }
}
