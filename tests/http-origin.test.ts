import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError, sameOrigin } from '../lib/server/http'

test('same-origin validation follows the accessed domain instead of APP_URL', async (t) => {
  const saved = { APP_URL: process.env.APP_URL, VERCEL: process.env.VERCEL }
  const request = (
    url: string,
    origin?: string,
    headers: Record<string, string> = {}
  ) =>
    new Request(url, {
      method: 'POST',
      headers: {
        ...(origin === undefined ? {} : { Origin: origin }),
        ...headers,
      },
    })
  const denied = (value: Request) =>
    assert.throws(
      () => sameOrigin(value),
      (error) => error instanceof HttpError && error.status === 403
    )
  try {
    delete process.env.VERCEL
    process.env.APP_URL = 'https://silaq.example.com'
    await t.test(
      'accepts Vercel preview URLs and custom aliases with a different canonical URL',
      () => {
        for (const origin of [
          'https://silaq-preview-123.vercel.app',
          'https://wisata.example.com',
        ]) {
          assert.doesNotThrow(() =>
            sameOrigin(request(`${origin}/api/auth`, origin))
          )
        }
      }
    )
    await t.test(
      'accepts localhost, loopback IP and IPv6 with their actual ports',
      () => {
        for (const origin of [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://[::1]:3000',
        ]) {
          assert.doesNotThrow(() =>
            sameOrigin(
              request(`${origin}/api/auth`, origin, {
                Host: new URL(origin).host,
              })
            )
          )
        }
      }
    )
    await t.test(
      'does not let a stale or invalid payment URL block same-origin login',
      () => {
        process.env.APP_URL = 'not-a-valid-url'
        assert.doesNotThrow(() =>
          sameOrigin(
            request('http://localhost:3000/api/auth', 'http://localhost:3000')
          )
        )
        process.env.APP_URL = 'https://silaq.example.com'
      }
    )
    await t.test(
      'rejects other domains, similar domain names, ports and protocols',
      () => {
        for (const origin of [
          'https://attacker.example',
          'https://silaq-preview-123.vercel.app.attacker.test',
          'https://other-project.vercel.app',
          'http://silaq-preview-123.vercel.app',
          'https://silaq-preview-123.vercel.app:8443',
          'https://silaq.example.com',
        ]) {
          denied(
            request('https://silaq-preview-123.vercel.app/api/auth', origin)
          )
        }
      }
    )
    await t.test(
      'rejects missing, null, malformed and non-origin values',
      () => {
        for (const origin of [
          undefined,
          'null',
          'invalid',
          'https://silaq-preview-123.vercel.app/',
          'https://silaq-preview-123.vercel.app/path',
          'https://user@silaq-preview-123.vercel.app',
          'file:///tmp/file',
          'https://silaq-preview-123.vercel.app, https://attacker.example',
        ]) {
          denied(
            request('https://silaq-preview-123.vercel.app/api/auth', origin)
          )
        }
      }
    )
    await t.test(
      'does not trust arbitrary forwarded host or protocol headers',
      () => {
        denied(
          request(
            'https://silaq-preview-123.vercel.app/api/auth',
            'https://attacker.example',
            {
              Host: 'silaq-preview-123.vercel.app',
              'X-Forwarded-Host': 'attacker.example',
              'X-Forwarded-Proto': 'https',
            }
          )
        )
        denied(
          request('http://localhost:3000/api/auth', 'https://localhost:3000', {
            'X-Forwarded-Proto': 'https',
          })
        )
      }
    )
    process.env.VERCEL = '1'
    await t.test(
      'uses the external HTTPS Host on Vercel behind an internal function URL',
      () => {
        assert.doesNotThrow(() =>
          sameOrigin(
            request(
              'http://internal-function:3000/api/auth',
              'https://wisata.example.com',
              { Host: 'wisata.example.com' }
            )
          )
        )
        denied(
          request(
            'http://internal-function:3000/api/auth',
            'http://wisata.example.com',
            { Host: 'wisata.example.com' }
          )
        )
        denied(
          request(
            'http://internal-function:3000/api/auth',
            'https://attacker.example',
            {
              Host: 'wisata.example.com',
              'X-Forwarded-Host': 'attacker.example',
            }
          )
        )
      }
    )
    await t.test(
      'rejects malformed Host headers instead of treating them as URLs',
      () => {
        for (const host of [
          'wisata.example.com,attacker.example',
          'user@wisata.example.com',
          'wisata.example.com/path',
          'wisata.example.com?query',
          'wisata.example.com#hash',
        ]) {
          denied(
            request(
              'https://wisata.example.com/api/auth',
              'https://wisata.example.com',
              { Host: host }
            )
          )
        }
      }
    )
  } finally {
    for (const key of ['APP_URL', 'VERCEL'] as const) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
})
