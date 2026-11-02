import { Role } from './smart-tourism'

export interface DemoLoginTemplate {
  name: string
  emails: Record<Role, string>
  password: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  partnerProducts: string[]
}
