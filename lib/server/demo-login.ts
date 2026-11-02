import 'server-only'
import { DEMO_ACCOUNT_EMAILS, DEMO_ACCOUNT_NAME } from '../demo-accounts'
import { DemoLoginTemplate } from '@/types/auth'

export function demoLoginTemplate(
  mode: 'demo' | 'sandbox' | 'production'
): DemoLoginTemplate | null {
  if (mode !== 'demo' || process.env.DEMO_LOGIN_ENABLED !== 'true') return null
  const password = process.env.DEMO_LOGIN_PASSWORD
  if (!password || password.length < 12) return null
  return { name: DEMO_ACCOUNT_NAME, emails: DEMO_ACCOUNT_EMAILS, password }
}
