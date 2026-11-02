import { spawn } from 'node:child_process'
const port = process.env.PRESENTATION_PORT || '3300'
const env = {
  ...process.env,
  DATABASE_URL: '',
  LOCAL_DATABASE: 'false',
  VERCEL: '',
  PRESENTATION_MODE: 'true',
  CATALOG_APPROVED: 'false',
  PAYMENT_MODE: 'sandbox',
  MIDTRANS_SERVER_KEY: '',
  APP_URL: 'https://canonical.example.test',
  BASE_URL: `http://127.0.0.1:${port}`,
}
const run = (args) => spawn(process.execPath, args, { env, stdio: 'inherit' })
const finished = (child) =>
  new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Presentation test exited ${code}`))
    )
  })
const server = run([
  'node_modules/next/dist/bin/next',
  'start',
  '--hostname',
  '127.0.0.1',
  '--port',
  port,
])
try {
  let ready = false
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error('Presentation server stopped')
    try {
      if ((await fetch(env.BASE_URL)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Presentation server not ready')
  await finished(run(['scripts/presentation-smoke.cjs']))
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once('exit', resolve))
    server.kill()
    await stopped
  }
}
