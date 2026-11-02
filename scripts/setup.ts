import { loadEnvConfig } from '@next/env'
import { closeDatabase, ensureDatabase, query } from '../lib/server/db'
import { createUser } from '../lib/server/auth'
import { MARKET_PRODUCTS } from '../lib/marketplace-data'
import { Role } from '../types/smart-tourism'

async function main() {
  loadEnvConfig(process.cwd())
  await ensureDatabase()
  console.log('Schema PostgreSQL siap.')
  const email = process.env.PROVISION_EMAIL
  const password = process.env.PROVISION_PASSWORD
  if (!email || !password) {
    console.log(
      'Untuk membuat akun pengelola, isi PROVISION_EMAIL, PROVISION_PASSWORD, PROVISION_NAME, dan PROVISION_ROLE lalu jalankan setup kembali.'
    )
    return
  }
  const role = (process.env.PROVISION_ROLE || 'superadmin') as Role
  if (!['consumer', 'admin', 'superadmin'].includes(role))
    throw new Error('PROVISION_ROLE tidak valid.')
  const products = (process.env.PROVISION_PRODUCTS || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (
    role === 'admin' &&
    (!products.length ||
      products.some((id) => !MARKET_PRODUCTS.some((p) => p.id === id)))
  )
    throw new Error(
      'Akun mitra memerlukan PROVISION_PRODUCTS berupa ID layanan yang valid, dipisahkan koma.'
    )
  const existing = await query('SELECT id FROM silaq_users WHERE email=$1', [
    email.trim().toLowerCase(),
  ])
  if (existing.rows.length) {
    console.log(
      'Akun sudah ada. Setup tidak mengubah kata sandi atau hak akses akun yang sudah terdaftar.'
    )
    return
  }
  await createUser(
    process.env.PROVISION_NAME || 'Pengelola SILAQ',
    email,
    password,
    role,
    products
  )
  console.log(
    `Akun ${role} berhasil dibuat. Hapus PROVISION_PASSWORD dari environment setelah selesai.`
  )
}
main()
  .catch(() => {
    console.error(
      'Setup gagal. Periksa koneksi database, peran, ID layanan, serta password minimal 12 karakter.'
    )
    process.exitCode = 1
  })
  .finally(() => closeDatabase())
