import { appOrigin, json, paymentMode, failure } from '@/lib/server/http'
import { demoLoginTemplate } from '@/lib/server/demo-login'
import { presentationEnabled } from '@/lib/server/presentation'
import { DEFAULT_DEMO_LOGIN_TEMPLATE } from '@/lib/demo-accounts'

export const runtime = 'nodejs'
export async function GET() {
  try {
    if (presentationEnabled())
      return json({
        browserDemo: true,
        databaseConfigured: false,
        paymentMode: 'demo',
        catalogApproved: false,
        paymentReady: true,
        demoLogin: DEFAULT_DEMO_LOGIN_TEMPLATE,
      })
    const mode = paymentMode()
    const catalogApproved = process.env.CATALOG_APPROVED === 'true'
    return json({
      browserDemo: false,
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
