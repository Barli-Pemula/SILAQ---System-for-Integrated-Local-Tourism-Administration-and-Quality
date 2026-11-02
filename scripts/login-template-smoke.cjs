const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100'
const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((file) => fs.existsSync(file))
const PASSWORD = 'GilangDemo123!'
const EMAILS = {
  consumer: 'gilang.wisatawan@silaq.local',
  admin: 'gilang.admin@silaq.local',
  superadmin: 'gilang.superadmin@silaq.local',
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    let releaseConfig
    let firstConfig = true
    const gate = new Promise((resolve) => {
      releaseConfig = resolve
    })
    await page.route('**/api/config', async (route) => {
      await gate
      const demoLogin = firstConfig
        ? {
            name: 'Gilang Khaerul Afan',
            emails: EMAILS,
            password: 'Server-demo-password-123',
          }
        : null
      firstConfig = false
      await route.fulfill({ json: { paymentMode: 'demo', demoLogin } })
    })
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const email = page.getByLabel('Alamat email', { exact: true })
    const password = page.locator('input[type=password]')
    await email.waitFor()
    // No configuration response or template button is required to fill the form.
    assert.equal(await email.inputValue(), EMAILS.consumer)
    assert.equal(await password.inputValue(), PASSWORD)
    await page
      .getByRole('button', { name: 'Gunakan akun lain', exact: true })
      .click()
    assert.equal(await email.inputValue(), '')
    assert.equal(await password.inputValue(), '')
    await email.fill('another@example.test')
    await password.fill('Another-password-123')
    const received = page.waitForResponse((response) =>
      response.url().endsWith('/api/config')
    )
    releaseConfig()
    await received
    await page.getByRole('button', { name: /^Masuk sebagai/ }).waitFor()
    assert.equal(await email.inputValue(), 'another@example.test')
    assert.equal(await password.inputValue(), 'Another-password-123')
    await page.reload()
    await email.waitFor()
    assert.equal(await email.inputValue(), EMAILS.consumer)
    assert.equal(await password.inputValue(), PASSWORD)
    for (const [role, label] of [
      ['admin', 'Admin Mitra'],
      ['superadmin', 'SuperAdmin'],
      ['consumer', 'Wisatawan'],
    ]) {
      await page
        .locator('.role-grid')
        .getByRole('button', { name: new RegExp(`^${label}`) })
        .click()
      assert.equal(await email.inputValue(), EMAILS[role])
      assert.equal(await password.inputValue(), PASSWORD)
    }
    const fresh = await browser.newContext()
    const freshPage = await fresh.newPage()
    await freshPage.route('**/api/config', (route) =>
      route.fulfill({
        status: 503,
        json: { error: 'Configuration unavailable' },
      })
    )
    await freshPage.goto(BASE, { waitUntil: 'domcontentloaded' })
    await freshPage.getByLabel('Alamat email', { exact: true }).waitFor()
    assert.equal(
      await freshPage.getByLabel('Alamat email', { exact: true }).inputValue(),
      EMAILS.consumer
    )
    assert.equal(
      await freshPage.locator('input[type=password]').inputValue(),
      PASSWORD
    )
    await fresh.close()
    await context.close()
    console.log(
      'PASS: Gilang is prefilled on first visit, reload, new browser, and role changes without configuration; custom credentials remain editable.'
    )
  } finally {
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
