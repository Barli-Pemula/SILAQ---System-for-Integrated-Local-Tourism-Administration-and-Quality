import { Role } from '@/types/smart-tourism'
import { DemoLoginTemplate } from '@/types/auth'

export const DEMO_ACCOUNT_NAME = 'Gilang Khaerul Afan'
export const DEMO_ACCOUNT_EMAILS: Record<Role, string> = {
  consumer: 'gilang.wisatawan@silaq.local',
  admin: 'gilang.admin@silaq.local',
  superadmin: 'gilang.superadmin@silaq.local',
}

// Public presentation credentials, never a substitute for server authentication.
// A configured demo password can replace this through /api/config.
export const DEFAULT_DEMO_LOGIN_TEMPLATE: DemoLoginTemplate = {
  name: DEMO_ACCOUNT_NAME,
  emails: DEMO_ACCOUNT_EMAILS,
  password: 'GilangDemo123!',
}
