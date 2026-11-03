const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3300'
const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((file) => fs.existsSync(file))
const format = (n) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 })

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    geolocation: { latitude: -8.757, longitude: 116.277 },
    permissions: ['geolocation'],
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const nav = (name) =>
    page
      .locator('header nav')
      .getByRole('button', { name, exact: true })
      .click()
  const data = () =>
    page.evaluate(() =>
      JSON.parse(
        localStorage.getItem('silaq.presentation.v1') || '{"orders":[]}'
      )
    )
  const totalIs = (value) =>
    page.waitForFunction(
      (value) =>
        document.querySelector('[data-testid="carbon-total"]')?.textContent ===
        value,
      value
    )
  const continuePayment = async () => {
    await page
      .getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
      .click()
    await page.getByRole('checkbox', { name: /Saya sudah memeriksa/ }).check()
  }
  try {
    fs.mkdirSync('artifacts/carbon', { recursive: true })
    await page.goto(BASE)
    await page
      .locator('.role-grid')
      .getByRole('button', { name: /^Wisatawan/ })
      .click()
    await page.getByRole('button', { name: /^Masuk sebagai/ }).click()
    await page.locator('.consumer-main').waitFor()
    await nav('Jelajahi')
    await page.getByRole('tab', { name: 'Paket Wisata', exact: true }).click()
    assert.ok(
      (await page.getByText(/Estimasi jarak antar destinasi:/).count()) >= 3
    )
    await page
      .locator('.travel-card')
      .filter({
        has: page.getByRole('heading', {
          name: 'Cerita dari Selatan',
          exact: true,
        }),
      })
      .getByRole('button', { name: 'Pilih paket', exact: true })
      .click()
    await page.getByLabel('Peserta', { exact: true }).selectOption('2')
    await page
      .getByLabel('Nama lengkap', { exact: true })
      .fill('Pengujian Karbon')
    await page.getByLabel('Email', { exact: true }).fill('carbon@example.test')
    await page.getByLabel('Nomor telepon', { exact: true }).fill('081234567890')
    await page
      .getByRole('button', { name: 'Gunakan lokasi saya', exact: true })
      .click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Titik terdekat: Bandara Lombok' })
      .waitFor()
    assert.equal(
      await page
        .getByLabel('Titik keberangkatan', { exact: true })
        .inputValue(),
      'airport'
    )
    await page
      .getByLabel('Peserta per kendaraan', { exact: true })
      .selectOption('2')
    await page
      .getByLabel('Sertakan perjalanan kembali ke titik keberangkatan')
      .check()

    // Exercise denied permission without requiring an interactive browser prompt.
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: { getCurrentPosition: (_success, error) => error({ code: 1 }) },
      })
    )
    await page
      .getByRole('button', { name: 'Gunakan lokasi saya', exact: true })
      .click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Izin lokasi tidak diberikan' })
      .waitFor()
    assert.equal(
      await page
        .getByLabel('Titik keberangkatan', { exact: true })
        .inputValue(),
      'airport'
    )
    await page.evaluate(() => delete navigator.geolocation)
    await page.screenshot({
      path: 'artifacts/carbon/checkout-desktop.png',
      fullPage: true,
    })

    await page
      .getByRole('button', { name: 'Lihat Carbon Footprint', exact: true })
      .click()
    await page
      .getByRole('heading', { name: 'Carbon Footprint', exact: true })
      .waitFor()
    await totalIs('0')
    await page.locator('.carbon-preview').waitFor()
    await page
      .getByRole('button', { name: 'Kembali ke pemesanan', exact: true })
      .click()
    assert.equal(
      await page.getByLabel('Email', { exact: true }).inputValue(),
      'carbon@example.test'
    )
    assert.equal(
      await page
        .getByLabel('Peserta per kendaraan', { exact: true })
        .inputValue(),
      '2'
    )
    assert.equal(
      await page
        .getByLabel('Sertakan perjalanan kembali ke titik keberangkatan')
        .isChecked(),
      true
    )
    await continuePayment()
    await page
      .getByRole('button', { name: 'Coba pembayaran gagal', exact: true })
      .click()
    await page
      .getByRole('alert')
      .filter({ hasText: 'Pembayaran uji gagal' })
      .waitFor()
    assert.equal((await data()).orders[0].booking.status, 'cancelled')
    await page
      .getByRole('button', { name: 'Lihat Carbon Footprint', exact: true })
      .click()
    await totalIs('0')
    await page
      .getByRole('button', { name: 'Kembali ke pemesanan', exact: true })
      .click()
    await continuePayment()
    await page
      .getByRole('button', {
        name: 'Simulasikan pembayaran berhasil',
        exact: true,
      })
      .click()
    await page
      .getByRole('heading', { name: 'Pembayaran uji berhasil.', exact: true })
      .waitFor()
    const paid = (await data()).orders.find(
      (order) => order.booking.status === 'paid'
    ).booking
    assert.ok(paid.carbon.totalKg > 0)
    assert.ok(paid.carbon.distanceKm > 0)
    assert.equal(paid.draft.travel.originId, 'airport')
    assert.equal(JSON.stringify(paid).includes('latitude'), false)
    assert.equal(JSON.stringify(paid).includes('longitude'), false)
    await page
      .getByRole('button', { name: 'Lihat Carbon Footprint', exact: true })
      .click()
    await totalIs(format(paid.carbon.totalKg))
    assert.equal(await page.locator('.carbon-preview').count(), 0)
    assert.equal(await page.locator('.carbon-order-list > article').count(), 1)
    await page.screenshot({
      path: 'artifacts/carbon/report-desktop.png',
      fullPage: true,
    })

    await page.reload()
    await page.getByRole('button', { name: /Wisata lebih hijau/ }).click()
    await totalIs(format(paid.carbon.totalKg))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: 'artifacts/carbon/report-mobile.png',
      fullPage: true,
    })
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1
      )
    )
    await page
      .locator('.consumer-mobile-nav')
      .getByRole('button', { name: 'Jelajahi', exact: true })
      .click()
    await page.getByRole('tab', { name: 'Destinasi', exact: true }).click()
    await page
      .locator('.travel-card')
      .filter({
        has: page.getByRole('heading', {
          name: 'Pantai Kuta Mandalika',
          exact: true,
        }),
      })
      .getByRole('button', { name: 'Pesan', exact: true })
      .click()
    await page
      .getByLabel('Titik keberangkatan', { exact: true })
      .selectOption('airport')
    await page
      .getByLabel('Transportasi darat', { exact: true })
      .selectOption('motorbike')
    await page.locator('.carbon-travel-options').scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'artifacts/carbon/checkout-mobile.png' })
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1
      )
    )
    assert.deepEqual(errors, [])
    console.log(
      'PASS: GPS permission/fallback, bundle distance, preserved checkout preview, failed payment exclusion, paid report, reload persistence, mobile ticket options/layout.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'artifacts/carbon/failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
