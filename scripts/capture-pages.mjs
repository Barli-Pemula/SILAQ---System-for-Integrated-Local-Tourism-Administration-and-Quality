import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import nextEnv from '@next/env'
import { randomBytes } from 'node:crypto'

nextEnv.loadEnvConfig(process.cwd(), true)
const directory = await mkdtemp(join(tmpdir(), 'silaq-capture-'))
const port = process.env.CAPTURE_PORT || '3200'
const env = {
  ...process.env,
  VERCEL: '',
  DATABASE_URL: '',
  LOCAL_DATABASE: 'true',
  LOCAL_DATABASE_PATH: directory,
  PAYMENT_MODE: 'demo',
  ALLOW_DEMO_PAYMENTS: 'true',
  CATALOG_APPROVED: 'false',
  DEMO_LOGIN_ENABLED: 'true',
  DEMO_LOGIN_PASSWORD:
    process.env.DEMO_LOGIN_PASSWORD || randomBytes(15).toString('base64url'),
  APP_URL: `http://127.0.0.1:${port}`,
  BASE_URL: `http://127.0.0.1:${port}`,
  CAPTURE_FIXTURE: 'true',
}
const run = (args) => spawn(process.execPath, args, { env, stdio: 'inherit' })
const finished = (child) =>
  new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Capture subprocess exited ${code}`))
    )
  })
let server
try {
  await finished(
    run([
      '--conditions=react-server',
      '--import',
      'tsx',
      'scripts/seed-capture-data.ts',
    ])
  )
  server = run([
    'node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    port,
  ])
  let ready = false
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Server screenshot berhenti.')
    try {
      if ((await fetch(env.BASE_URL)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Server screenshot belum siap.')
  await finished(
    run(['scripts/capture-all-pages.cjs', ...process.argv.slice(2)])
  )
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (server && server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once('exit', resolve))
    server.kill()
    await stopped
  }
  if (!directory.startsWith(join(tmpdir(), 'silaq-capture-')))
    throw new Error('Jalur cleanup tidak sesuai.')
  await rm(directory, { recursive: true, force: true })
}
