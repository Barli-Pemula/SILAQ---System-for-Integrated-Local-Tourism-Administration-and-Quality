import { loadEnvConfig } from '@next/env'
import { randomBytes } from 'node:crypto'
import { authenticate, createUser } from '../lib/server/auth'
import { closeDatabase, ensureDatabase, query } from '../lib/server/db'
import { MARKET_PRODUCTS } from '../lib/marketplace-data'
import { Role } from '../types/smart-tourism'
import { DEMO_ACCOUNT_EMAILS, DEMO_ACCOUNT_NAME } from '../lib/demo-accounts'

const name = DEMO_ACCOUNT_NAME
const accounts = (['consumer', 'admin', 'superadmin'] as Role[]).map(
  (role) => ({
    role,
    email: DEMO_ACCOUNT_EMAILS[role],
  })
)

async function main() {
  loadEnvConfig(process.cwd(), true)
  if (!process.env.DATABASE_URL && !process.env.VERCEL)
    process.env.LOCAL_DATABASE ||= 'true'
  await ensureDatabase()
  const password =
    process.env.GILANG_INITIAL_PASSWORD ||
    process.env.DEMO_LOGIN_PASSWORD ||
    randomBytes(15).toString('base64url')
  let created = 0
  for (const account of accounts) {
    const existing = await query<{ name: string; role: Role }>(
      'SELECT name,role FROM silaq_users WHERE email=$1',
      [account.email]
    )
    if (existing.rows.length) {
      console.log(
        `Sudah ada: ${account.email}; password dan hak akses tidak diubah.`
      )
      continue
    }
    await createUser(
      name,
      account.email,
      password,
      account.role,
      account.role === 'admin'
        ? MARKET_PRODUCTS.map((product) => product.id)
        : []
    )
    const verified = await authenticate(account.email, password)
    if (verified.name !== name || verified.role !== account.role)
      throw new Error('Verifikasi akun gagal.')
    console.log(
      `Login terverifikasi: ${account.email} (${account.role}) — ${verified.name}`
    )
    created++
  }
  if (created) console.log(`Password awal akun yang baru dibuat: ${password}`)
  console.log(
    `Database: ${process.env.LOCAL_DATABASE === 'true' && !process.env.VERCEL ? 'PostgreSQL lokal' : 'PostgreSQL eksternal'}`
  )
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : 'Pembuatan akun gagal.'
    )
    process.exitCode = 1
  })
  .finally(() => closeDatabase())
