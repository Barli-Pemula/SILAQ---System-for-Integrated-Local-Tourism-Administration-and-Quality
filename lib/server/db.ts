import 'server-only'
import { Pool } from 'pg'
import { resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { attachDatabasePool } from '@vercel/functions'

export interface Sql {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: T[] }>
}

type DatabaseState = {
  pool?: Pool
  local?: Promise<import('@electric-sql/pglite').PGlite>
  migration?: Promise<void>
}
const globalState = globalThis as typeof globalThis & {
  silaqDatabase?: DatabaseState
}
const state = (globalState.silaqDatabase ??= {})

function hostedPool() {
  if (!process.env.DATABASE_URL)
    throw new Error(
      'DATABASE_URL belum dikonfigurasi. Hubungkan PostgreSQL melalui Vercel Marketplace.'
    )
  if (!state.pool) {
    state.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 10000,
      allowExitOnIdle: true,
    })
    if (process.env.VERCEL) attachDatabasePool(state.pool)
  }
  return state.pool
}

const localEnabled = () =>
  process.env.LOCAL_DATABASE === 'true' && !process.env.VERCEL
async function localDatabase() {
  if (!localEnabled())
    throw new Error(
      'Database lokal hanya tersedia di luar Vercel dengan LOCAL_DATABASE=true.'
    )
  return (state.local ??= import('@electric-sql/pglite').then(
    async ({ PGlite }) => {
      const directory = resolve(
        process.env.LOCAL_DATABASE_PATH || '.data/postgres'
      )
      await mkdir(directory, { recursive: true })
      return new PGlite(directory)
    }
  ))
}

async function rawQuery<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = []
): Promise<{ rows: T[] }> {
  return localEnabled()
    ? (await localDatabase()).query<T>(text, values)
    : hostedPool().query<T>(text, values)
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS silaq_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('consumer','admin','superadmin')), partner_products JSONB NOT NULL DEFAULT '[]', created_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS silaq_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES silaq_users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS silaq_rate_limits (key TEXT PRIMARY KEY, hits INT NOT NULL, expires_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS silaq_bookings (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES silaq_users(id), idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL, status TEXT NOT NULL, data JSONB NOT NULL, allocations_released BOOLEAN NOT NULL DEFAULT false, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL, UNIQUE(user_id,idempotency_key))`,
  `CREATE TABLE IF NOT EXISTS silaq_inventory (key TEXT PRIMARY KEY, product_id TEXT NOT NULL, day TEXT NOT NULL, capacity INT NOT NULL CHECK (capacity >= 0), reserved INT NOT NULL DEFAULT 0 CHECK (reserved >= 0))`,
  `CREATE TABLE IF NOT EXISTS silaq_allocations (booking_id TEXT NOT NULL REFERENCES silaq_bookings(id), inventory_key TEXT NOT NULL REFERENCES silaq_inventory(key), quantity INT NOT NULL, PRIMARY KEY(booking_id,inventory_key))`,
  `CREATE INDEX IF NOT EXISTS silaq_booking_user_idx ON silaq_bookings(user_id,created_at)`,
  `CREATE INDEX IF NOT EXISTS silaq_pending_idx ON silaq_bookings(status,expires_at)`,
]

export async function ensureDatabase() {
  if (!state.migration)
    state.migration = rawTransaction(async (sql) => {
      // Cold serverless instances may initialize concurrently against the same schema.
      await sql.query('SELECT pg_advisory_xact_lock(84192026)')
      for (const statement of SCHEMA) await sql.query(statement)
    }).catch((error) => {
      state.migration = undefined
      throw error
    })
  return state.migration
}

export async function query<
  T extends Record<string, unknown> = Record<string, unknown>,
>(text: string, values: unknown[] = []) {
  await ensureDatabase()
  return rawQuery<T>(text, values)
}

async function rawTransaction<T>(action: (sql: Sql) => Promise<T>): Promise<T> {
  if (localEnabled())
    return (await localDatabase()).transaction((tx) => action(tx as Sql))
  const client = await hostedPool().connect()
  try {
    await client.query('BEGIN')
    const result = await action(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function transaction<T>(
  action: (sql: Sql) => Promise<T>
): Promise<T> {
  await ensureDatabase()
  return rawTransaction(action)
}

export async function closeDatabase() {
  if (state.local) await (await state.local).close()
  if (state.pool) await state.pool.end()
  state.local = undefined
  state.pool = undefined
  state.migration = undefined
}
