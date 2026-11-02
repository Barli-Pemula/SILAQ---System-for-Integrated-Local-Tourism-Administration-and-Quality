import { spawn } from 'node:child_process'
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd(), true)
const env = { ...process.env }
// Explicit development-only defaults. Vercel must configure its own database and gateway.
if (!env.VERCEL) {
  if (!env.DATABASE_URL) env.LOCAL_DATABASE ||= 'true'
  env.PAYMENT_MODE ||= 'demo'
  if (env.PAYMENT_MODE === 'demo') env.ALLOW_DEMO_PAYMENTS ||= 'true'
}
const child = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--webpack',
    ...process.argv.slice(2),
  ],
  { env, stdio: 'inherit' }
)
child.on('exit', (code) => {
  process.exitCode = code || 0
})
