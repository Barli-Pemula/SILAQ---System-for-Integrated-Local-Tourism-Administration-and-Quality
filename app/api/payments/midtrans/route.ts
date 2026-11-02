import { body, failure, json } from '@/lib/server/http'
import { paymentNotification } from '@/lib/server/payments'

export const runtime = 'nodejs'
export const maxDuration = 30
export async function POST(request: Request) {
  try {
    await paymentNotification(await body(request))
    return json({ received: true })
  } catch (error) {
    return failure(error)
  }
}
