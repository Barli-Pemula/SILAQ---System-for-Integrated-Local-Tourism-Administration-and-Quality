import 'server-only'
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { query } from './db'
import { HttpError } from './http'
import { SessionUser } from '@/types/auth'

const scrypt = promisify(scryptCallback)
const COOKIE = 'silaq_session'
const SESSION_SECONDS = 60 * 60 * 24 * 7
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

async function passwordMatches(password: string, stored: string) {
  const [salt, hex] = stored.split(':')
  if (!salt || !hex || hex.length !== 128) return false
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return timingSafeEqual(derived, Buffer.from(hex, 'hex'))
}

type UserRow = Record<string, unknown> & {
  id: string
  name: string
  email: string
  role: SessionUser['role']
  partner_products: string[]
  password_hash: string
}
const publicUser = (row: UserRow): SessionUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  partnerProducts: row.partner_products,
})

export async function rateLimit(key: string, limit: number, minutes = 15) {
  const now = Date.now()
  const result = await query<{ hits: number }>(
    `INSERT INTO silaq_rate_limits(key,hits,expires_at) VALUES($1,1,$2)
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN silaq_rate_limits.expires_at < $3 THEN 1 ELSE silaq_rate_limits.hits+1 END,
    expires_at=CASE WHEN silaq_rate_limits.expires_at < $3 THEN $2 ELSE silaq_rate_limits.expires_at END RETURNING hits`,
    [hash(key), now + minutes * 60000, now]
  )
  if (result.rows[0].hits > limit)
    throw new HttpError(
      429,
      'Terlalu banyak percobaan. Coba kembali beberapa menit lagi.'
    )
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: SessionUser['role'] = 'consumer',
  partnerProducts: string[] = []
) {
  if (
    name.trim().length < 3 ||
    name.length > 100 ||
    email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    throw new HttpError(400, 'Nama atau email tidak valid.')
  if (password.length < 12 || password.length > 128)
    throw new HttpError(400, 'Kata sandi harus 12–128 karakter.')
  const result = await query<UserRow>(
    `INSERT INTO silaq_users(id,name,email,password_hash,role,partner_products,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(email) DO NOTHING RETURNING *`,
    [
      randomUUID(),
      name.trim(),
      email.toLowerCase().trim(),
      await passwordHash(password),
      role,
      JSON.stringify(partnerProducts),
      Date.now(),
    ]
  )
  if (!result.rows[0])
    throw new HttpError(409, 'Email sudah terdaftar. Silakan masuk.')
  return publicUser(result.rows[0])
}

export async function authenticate(email: string, password: string) {
  await rateLimit(`login:${email.trim().toLowerCase()}`, 10)
  const result = await query<UserRow>(
    'SELECT * FROM silaq_users WHERE email=$1',
    [email.trim().toLowerCase()]
  )
  const row = result.rows[0]
  // Keep missing-account and incorrect-password requests computationally comparable.
  const fallback = `${'0'.repeat(32)}:${'0'.repeat(128)}`
  const valid = await passwordMatches(password, row?.password_hash || fallback)
  if (!row || !valid)
    throw new HttpError(401, 'Email atau kata sandi tidak sesuai.')
  return publicUser(row)
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  await query('DELETE FROM silaq_sessions WHERE expires_at < $1', [Date.now()])
  await query(
    'INSERT INTO silaq_sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)',
    [hash(token), userId, Date.now() + SESSION_SECONDS * 1000]
  )
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:
      Boolean(process.env.VERCEL) ||
      process.env.APP_URL?.startsWith('https:') === true,
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export async function sessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null
  const result = await query<UserRow>(
    `SELECT u.* FROM silaq_sessions s JOIN silaq_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > $2`,
    [hash(token), Date.now()]
  )
  return result.rows[0] ? publicUser(result.rows[0]) : null
}

export async function requireUser() {
  const user = await sessionUser()
  if (!user) throw new HttpError(401, 'Silakan masuk kembali.')
  return user
}

export async function endSession() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (token)
    await query('DELETE FROM silaq_sessions WHERE token_hash=$1', [hash(token)])
  jar.delete(COOKIE)
}
