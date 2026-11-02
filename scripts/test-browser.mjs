import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

const directory = await mkdtemp(join(tmpdir(), 'silaq-browser-test-'))
const password = randomBytes(24).toString('base64url')
const email = 'admin-browser@example.test'
const port = process.env.E2E_PORT || '3100'
const base = `http://127.0.0.1:${port}`
const env = {
  ...process.env,
  VERCEL: '',
  LOCAL_DATABASE: 'true',
  LOCAL_DATABASE_PATH: directory,
  DATABASE_URL: '',
  APP_URL: base,
  PAYMENT_MODE: 'demo',
  ALLOW_DEMO_PAYMENTS: 'true',
  PROVISION_EMAIL: email,
  PROVISION_PASSWORD: password,
  PROVISION_ROLE: 'superadmin',
  E2E_ADMIN_EMAIL: email,
  E2E_ADMIN_PASSWORD: password,
  BASE_URL: base,
}
const child = (args) => spawn(process.execPath, args, { env, stdio: 'inherit' })
const finished = (process) =>
  new Promise((resolve, reject) => {
    process.once('error', reject)
    process.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Test subprocess exited ${code}`))
    )
  })
let server
try {
  await finished(
    child(['--conditions=react-server', '--import', 'tsx', 'scripts/setup.ts'])
  )
  server = child([
    'node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    port,
  ])
  let ready = false
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null)
      throw new Error('Preview server stopped unexpectedly')
    try {
      if ((await fetch(base)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Preview server not ready')
  await finished(child(['scripts/marketplace-smoke.cjs']))
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (server && server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once('exit', resolve))
    server.kill()
    await stopped
  }
  if (!directory.startsWith(join(tmpdir(), 'silaq-browser-test-')))
    throw new Error('Unexpected cleanup path')
  await rm(directory, { recursive: true, force: true })
}
