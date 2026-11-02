const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const jsQR = require('jsqr')
const { PNG } = require('pngjs')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3300'
const OUT = path.resolve('artifacts/presentation')
const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((file) => fs.existsSync(file))

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = [],
    backendCalls = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (
      new URL(request.url()).pathname.startsWith('/api/') &&
      !request.url().endsWith('/api/config')
    )
      backendCalls.push(request.url())
  })
  const nav = (name) =>
    page
      .locator('header nav')
      .getByRole('button', { name, exact: true })
      .click()
  const orders = () =>
    page.evaluate(() =>
      JSON.parse(
        localStorage.getItem('silaq.presentation.v1') || '{"orders":[]}'
      ).orders.map((order) => order.booking)
    )
  async function login(role = 'Wisatawan') {
    await page.goto(BASE)
    await page
      .locator('.role-grid')
      .getByRole('button', { name: new RegExp(`^${role}`) })
      .click()
    await page.getByRole('button', { name: /^Masuk sebagai/ }).click()
    await page
      .locator(role === 'Wisatawan' ? '.consumer-main' : '.admin-main')
      .waitFor()
  }
  const logoutConsumer = () =>
    page.locator('header button[title="Keluar dari akun"]').click()
  async function checkout(category, title) {
    await nav('Jelajahi')
    await page.getByRole('tab', { name: category, exact: true }).click()
    await page
      .locator('.travel-card')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
      .getByRole('button', { name: /Pilih paket|^Pesan$/ })
      .click()
    const today = await page.evaluate(() =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())
    )
    await page
      .getByLabel(
        category === 'Hotel'
          ? 'Check-in'
          : category === 'Tiket Kapal'
            ? 'Tanggal keberangkatan'
            : 'Tanggal mulai',
        {
          exact: true,
        }
      )
      .fill(today)
    await page
      .getByLabel('Nama lengkap', { exact: true })
      .fill('Gilang Khaerul Afan')
    await page
      .getByLabel('Email', { exact: true })
      .fill('gilang.wisatawan@silaq.local')
    await page.getByLabel('Nomor telepon', { exact: true }).fill('081234567890')
  }
  async function payment() {
    await page
      .getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
      .click()
    await page.getByRole('checkbox', { name: /Saya sudah memeriksa/ }).check()
  }
  async function pay() {
    await page
      .getByRole('button', {
        name: 'Simulasikan pembayaran berhasil',
        exact: true,
      })
      .click()
    await page
      .getByRole('heading', { name: 'Pembayaran uji berhasil.', exact: true })
      .waitFor()
  }
  async function decodeQrs(booking, target = page) {
    const images = target.locator('img[data-voucher-code], img.qr')
    await target.waitForFunction(
      (n) =>
        document.querySelectorAll('img[data-voucher-code], img.qr').length ===
        n,
      booking.vouchers.length
    )
    for (let i = 0; i < booking.vouchers.length; i++) {
      await images.nth(i).evaluate(async (element) => {
        await element.decode()
        element.scrollIntoView({ block: 'center', behavior: 'instant' })
      })
      const png = PNG.sync.read(await images.nth(i).screenshot())
      assert.equal(
        jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
        booking.vouchers[i].id
      )
    }
  }
  try {
    const config = await (
      await context.request.get(`${BASE}/api/config`)
    ).json()
    assert.equal(config.browserDemo, true)
    assert.equal(config.paymentMode, 'demo')
    assert.equal(config.paymentReady, true)
    await login()
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await checkout('Paket Wisata', 'Rimbun Lombok Utara')
    await page.getByLabel('Peserta', { exact: true }).selectOption('2')
    await page.getByRole('checkbox', { name: /Tambahkan Rimbun Lodge/ }).check()
    await payment()
    await page
      .getByRole('button', { name: 'Coba pembayaran gagal', exact: true })
      .click()
    await page
      .getByRole('alert')
      .filter({ hasText: 'Pembayaran uji gagal' })
      .waitFor()
    assert.equal((await orders())[0].status, 'cancelled')
    assert.deepEqual((await orders())[0].vouchers, [])
    await pay()
    const bundle = (await orders()).find((order) => order.status === 'paid')
    assert.equal(bundle.total, 535000)
    assert.equal(bundle.vouchers.length, 3)
    assert(
      bundle.itinerary.some((stop) => stop.type === 'hotel' && stop.included)
    )
    await decodeQrs(bundle)
    const downloadReady = page.waitForEvent('download')
    await page
      .getByRole('button', { name: 'Unduh voucher & itinerary' })
      .click()
    const download = await downloadReady
    const file = path.join(OUT, 'contoh-tiket-demo.html')
    await download.saveAs(file)
    const offline = await browser.newContext({ offline: true })
    const offlinePage = await offline.newPage()
    await offlinePage.setContent(fs.readFileSync(file, 'utf8'))
    await decodeQrs(bundle, offlinePage)
    await offline.close()
    for (const [category, title] of [
      ['Hotel', 'Sagara Stay Kuta'],
      ['Tiket Kapal', 'Padangbai → Bangsal'],
      ['Destinasi', 'Gili Trawangan'],
    ]) {
      await checkout(category, title)
      await payment()
      await pay()
      const saved = (await orders())
        .filter((order) => order.status === 'paid')
        .at(-1)
      await decodeQrs(saved)
    }
    const issued = (await orders()).flatMap((order) =>
      order.vouchers.map((voucher) => voucher.id)
    )
    assert.equal(issued.length, new Set(issued).size)
    await page.reload()
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await nav('Tiket Saya')
    await page
      .locator('.booking-list-item')
      .filter({ hasText: bundle.id })
      .click()
    await decodeQrs(bundle)
    await page.setViewportSize({ width: 390, height: 844 })
    await page
      .locator('.voucher-qr')
      .first()
      .evaluate((element) =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' })
      )
    await page.screenshot({ path: path.join(OUT, '01-qr-handphone.png') })
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    )
    await page.setViewportSize({ width: 1440, height: 1000 })
    await logoutConsumer()
    for (const role of ['Admin Mitra', 'SuperAdmin']) {
      await login(role)
      await page
        .locator('.admin-sidebar nav')
        .getByText('Layanan & Pesanan', { exact: true })
        .click()
      const order = page.locator('.ops-order').filter({ hasText: bundle.id })
      await order.waitFor()
      if (role === 'Admin Mitra') {
        await order
          .getByRole('button', { name: 'Validasi & check-in', exact: true })
          .first()
          .click()
        await page
          .getByRole('status')
          .filter({ hasText: 'Check-in berhasil' })
          .waitFor()
      } else
        assert(
          await order
            .getByRole('button', { name: 'Check-in tercatat', exact: true })
            .first()
            .isDisabled()
        )
      await page.screenshot({
        path: path.join(
          OUT,
          role === 'Admin Mitra' ? '02-admin.png' : '03-superadmin.png'
        ),
      })
      await page.getByRole('button', { name: 'Keluar', exact: true }).click()
    }
    const fresh = await browser.newContext()
    const freshPage = await fresh.newPage()
    await freshPage.goto(BASE)
    await freshPage.getByRole('button', { name: /^Masuk sebagai/ }).click()
    await freshPage
      .getByRole('heading', { name: /Lombok, lebih dekat/ })
      .waitFor()
    await freshPage
      .locator('header nav')
      .getByRole('button', { name: 'Tiket Saya', exact: true })
      .click()
    await freshPage
      .getByRole('heading', { name: 'Belum ada pesanan', exact: true })
      .waitFor()
    await fresh.close()
    assert.deepEqual(
      backendCalls,
      [],
      'Presentation must not call database-backed APIs'
    )
    assert.deepEqual(errors, [])
    console.log(
      'PASS: no-database Gilang login for all roles, bundle/hotel/boat/destination payment, persistent unique QR tickets, offline download, operator check-in, mobile layout, and isolated browser data.'
    )
  } finally {
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
