const { chromium, request } = require('playwright')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const jsQR = require('jsqr')
const { PNG } = require('pngjs')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'
const OUT = path.join(__dirname, '..', 'artifacts', 'marketplace')
const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p))

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const email = `traveler-${randomUUID()}@example.test`
  const password = `Secure-test-${randomUUID()}`
  const nav = (name) =>
    page
      .locator('header nav')
      .getByRole('button', { name, exact: true })
      .click()
  const tab = (name) => page.getByRole('tab', { name, exact: true }).click()
  const orders = async () => {
    const response = await context.request.get(`${BASE}/api/bookings`)
    assert.equal(response.status(), 200)
    return (await response.json()).bookings
  }
  const readableQrs = async (booking, target = page) => {
    const images = target.locator('img[data-voucher-code], img.qr')
    await target.waitForFunction(
      (count) =>
        document.querySelectorAll('img[data-voucher-code], img.qr').length ===
        count,
      booking.vouchers.length
    )
    for (let i = 0; i < booking.vouchers.length; i++) {
      const image = images.nth(i)
      await image.evaluate((element) => element.decode())
      await image.evaluate((element) =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' })
      )
      await target.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
      )
      const png = PNG.sync.read(await image.screenshot())
      const decoded = jsQR(
        new Uint8ClampedArray(png.data),
        png.width,
        png.height
      )
      if (!decoded)
        fs.writeFileSync(
          path.join(OUT, `qr-decode-failure-${i}.png`),
          PNG.sync.write(png)
        )
      assert.equal(
        decoded?.data,
        booking.vouchers[i].id,
        'QR harus terbaca sebagai kode voucher yang persis sama'
      )
    }
  }
  const details = async () => {
    await page
      .getByLabel('Nama lengkap', { exact: true })
      .fill('Wisatawan Pengujian')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Nomor telepon', { exact: true }).fill('081234567890')
  }
  const pay = async () => {
    await page.getByRole('checkbox', { name: /Saya sudah memeriksa/ }).check()
    await page
      .getByRole('button', { name: 'Simulasikan pembayaran berhasil' })
      .click()
    await page
      .getByRole('heading', { name: 'Pembayaran uji berhasil.', exact: true })
      .waitFor()
  }
  const shot = async (name) => {
    await page.evaluate(async () => {
      ;[...document.images].forEach((img) => {
        img.loading = 'eager'
      })
      await Promise.race([
        Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {}))
        ),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ])
    })
    await page.screenshot({ path: path.join(OUT, name), fullPage: true })
  }
  const noOverflow = async () =>
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      ),
      'No horizontal overflow'
    )
  const login = async (accountEmail, accountPassword, portal = 'Wisatawan') => {
    await page.goto(BASE)
    await page
      .getByRole('button', { name: new RegExp(portal) })
      .first()
      .click()
    await page.getByLabel('Alamat email', { exact: true }).fill(accountEmail)
    await page.locator('input[type=password]').fill(accountPassword)
    await page.getByRole('button', { name: /^Masuk sebagai/ }).click()
  }
  try {
    const unauth = await request.newContext()
    assert.equal((await unauth.get(`${BASE}/api/bookings`)).status(), 401)
    await unauth.dispose()
    await page.goto(BASE)
    await page
      .getByRole('button', { name: 'Buat akun wisatawan', exact: true })
      .click()
    await page
      .getByLabel('Nama lengkap', { exact: true })
      .fill('Wisatawan Pengujian')
    await page.getByLabel('Alamat email', { exact: true }).fill(email)
    await page.locator('input[type=password]').fill(password)
    await page
      .getByRole('button', { name: 'Daftar wisatawan', exact: true })
      .click()
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await shot('01-home-desktop.png')
    await noOverflow()
    assert(
      (await context.cookies()).some(
        (c) => c.name === 'silaq_session' && c.httpOnly && c.sameSite === 'Lax'
      )
    )
    const crossSite = await context.request.post(`${BASE}/api/bookings`, {
      headers: { Origin: 'https://untrusted.example' },
      data: { draft: {} },
    })
    assert.equal(crossSite.status(), 403)
    await nav('Tiket Saya')
    await page
      .getByRole('heading', { name: 'Belum ada pesanan', exact: true })
      .waitFor()
    await page.evaluate(() =>
      localStorage.setItem(
        'silaq.travel-bookings.v1',
        JSON.stringify([{ id: 'FORGED', status: 'paid', title: 'FORGED' }])
      )
    )
    await page.reload()
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await nav('Tiket Saya')
    assert.equal(await page.getByText('FORGED').count(), 0)

    await nav('Jelajahi')
    await tab('Kuliner')
    assert.equal(
      await page.getByRole('link', { name: 'Lihat peta' }).count(),
      3
    )
    assert.equal(
      await page
        .locator('.travel-card')
        .getByRole('button', { name: /Pesan|Bayar/ })
        .count(),
      0
    )
    await shot('02-culinary.png')
    await page
      .getByRole('textbox', { name: 'Cari Kuliner' })
      .fill('tidak-ada-hasil')
    await page
      .getByRole('heading', { name: 'Belum ada hasil yang cocok' })
      .waitFor()
    await page.getByRole('button', { name: 'Reset pencarian' }).click()

    await tab('Paket Wisata')
    const bundleCard = page
      .locator('.travel-card')
      .filter({ hasText: 'Rimbun Lombok Utara' })
    assert(
      await bundleCard
        .getByRole('heading', { name: 'Saran itinerary', exact: true })
        .isVisible()
    )
    await bundleCard
      .getByRole('button', { name: 'Lihat overview & itinerary' })
      .click()
    const overview = page.getByRole('dialog')
    await overview.waitFor()
    assert(await overview.getByText('Hari 2', { exact: true }).isVisible())
    assert(
      await overview
        .getByText('Warung Rimbun Senaru', { exact: true })
        .isVisible()
    )
    assert(
      await overview
        .getByText('Rimbun Lodge Senaru', { exact: true })
        .isVisible()
    )
    assert.equal(
      await overview.locator('.itinerary-timeline, .voucher-qr').count(),
      0
    )
    await shot('02b-bundle-overview.png')
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('dialog').count(), 0)
    await page
      .locator('.travel-card')
      .filter({ hasText: 'Rimbun Lombok Utara' })
      .getByRole('button', { name: 'Pilih paket' })
      .click()
    const today = await page.evaluate(() =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())
    )
    await page.getByLabel('Tanggal mulai', { exact: true }).fill(today)
    await page.getByLabel('Peserta', { exact: true }).selectOption('2')
    await page.getByRole('checkbox', { name: /Tambahkan Rimbun Lodge/ }).check()
    await details()
    await shot('03-bundle-checkout.png')
    await page.getByRole('button', { name: 'Lanjut ke pembayaran' }).click()
    assert(
      await page
        .getByRole('button', { name: 'Simulasikan pembayaran berhasil' })
        .isDisabled()
    )
    await page.getByRole('checkbox', { name: /Saya sudah memeriksa/ }).check()
    await page.getByRole('button', { name: 'Coba pembayaran gagal' }).click()
    await page
      .getByRole('alert')
      .filter({ hasText: 'Pembayaran uji gagal' })
      .waitFor()
    let saved = await orders()
    assert.equal(saved.length, 1)
    assert.equal(saved[0].status, 'cancelled')
    assert.equal(saved[0].vouchers.length, 0)
    assert.equal(saved[0].itinerary.length, 0)
    assert.equal(await page.locator('.voucher-qr').count(), 0)
    await pay()
    saved = await orders()
    const primaryOrder = saved[0]
    assert.equal(primaryOrder.total, 535000)
    assert.equal(primaryOrder.vouchers.length, 3)
    assert.equal(
      primaryOrder.itinerary.find((s) => s.type === 'hotel').included,
      true
    )
    assert.equal(
      primaryOrder.itinerary.find((s) => s.type === 'kuliner').included,
      false
    )
    assert.equal('voucherPlan' in primaryOrder, false)
    await readableQrs(primaryOrder)
    const downloadPromise = page.waitForEvent('download')
    await page
      .getByRole('button', { name: 'Unduh voucher & itinerary' })
      .click()
    const download = await downloadPromise
    assert(download.suggestedFilename().endsWith('-tiket.html'))
    const ticketPath = path.join(OUT, 'server-voucher-example.html')
    await download.saveAs(ticketPath)
    const offline = await browser.newContext({ offline: true })
    const offlinePage = await offline.newPage()
    await offlinePage.setContent(fs.readFileSync(ticketPath, 'utf8'))
    await readableQrs(primaryOrder, offlinePage)
    assert(
      await offlinePage
        .getByRole('heading', { name: 'Saran itinerary lengkap' })
        .isVisible()
    )
    await offline.close()
    await shot('04-tickets-itinerary.png')

    const outsider = await request.newContext()
    const signUp = await outsider.post(`${BASE}/api/auth`, {
      headers: { Origin: BASE },
      data: {
        action: 'register',
        name: 'Akun Lain',
        email: `outsider-${randomUUID()}@example.test`,
        password,
        role: 'superadmin',
      },
    })
    assert.equal(signUp.status(), 200)
    assert.equal((await signUp.json()).user.role, 'consumer')
    assert.equal(
      (await outsider.get(`${BASE}/api/bookings/${primaryOrder.id}`)).status(),
      404
    )
    assert.equal(
      (
        await outsider.post(`${BASE}/api/vouchers/validate`, {
          headers: { Origin: BASE },
          data: { code: primaryOrder.vouchers[0].id },
        })
      ).status(),
      403
    )
    await outsider.dispose()

    await nav('Jelajahi')
    await tab('Hotel')
    await page
      .locator('.travel-card')
      .filter({ hasText: 'Sagara Stay Kuta' })
      .getByRole('button', { name: 'Pesan', exact: true })
      .click()
    const start = await page
      .getByLabel('Check-in', { exact: true })
      .inputValue()
    await page.getByLabel('Check-in', { exact: true }).fill('')
    await page.getByRole('heading', { name: 'Detail menginap' }).waitFor()
    await page.getByLabel('Check-in', { exact: true }).fill(start)
    const end = new Date(`${start}T12:00:00Z`)
    end.setUTCDate(end.getUTCDate() + 3)
    await page
      .getByLabel('Check-out', { exact: true })
      .fill(end.toISOString().slice(0, 10))
    await page.getByLabel('Jumlah kamar', { exact: true }).selectOption('2')
    await details()
    await page.getByRole('button', { name: 'Lanjut ke pembayaran' }).click()
    await pay()
    assert.equal((await orders())[0].total, 3905000)
    await readableQrs((await orders())[0])

    await nav('Jelajahi')
    await tab('Tiket Kapal')
    await page
      .locator('.travel-card')
      .filter({ hasText: 'Padangbai → Bangsal' })
      .getByRole('button', { name: 'Pesan', exact: true })
      .click()
    await page
      .getByLabel('Jam berangkat (WITA)', { exact: true })
      .selectOption('13:00')
    await page.getByLabel('Penumpang', { exact: true }).selectOption('3')
    await details()
    await page.getByRole('button', { name: 'Lanjut ke pembayaran' }).click()
    await pay()
    saved = await orders()
    assert.equal(saved[0].total, 1130000)
    assert.equal(saved[0].draft.departure, '13:00')
    await readableQrs(saved[0])

    await nav('Jelajahi')
    await tab('Destinasi')
    await page
      .locator('.travel-card')
      .filter({
        has: page.getByRole('heading', { name: 'Gili Trawangan', exact: true }),
      })
      .getByRole('button', { name: 'Pesan', exact: true })
      .click()
    await page
      .getByLabel('Jenis tiket', { exact: true })
      .selectOption('tier-vip')
    await page.getByLabel('Peserta', { exact: true }).selectOption('2')
    await details()
    await page.getByRole('button', { name: 'Lanjut ke pembayaran' }).click()
    await pay()
    assert.equal((await orders())[0].total, 505000)
    await readableQrs((await orders())[0])
    await page.reload()
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await nav('Tiket Saya')
    await page.locator('.booking-list-item').first().waitFor()
    assert.equal(await page.locator('.booking-list-item').count(), 5)
    await shot('05-booking-history.png')

    const secondDevice = await browser.newContext()
    const signedIn = await secondDevice.request.post(`${BASE}/api/auth`, {
      headers: { Origin: BASE },
      data: { action: 'login', email, password },
    })
    assert.equal(signedIn.status(), 200)
    assert.equal(
      (await (await secondDevice.request.get(`${BASE}/api/bookings`)).json())
        .bookings.length,
      5
    )
    await secondDevice.close()

    await page.locator('header button[title="Keluar dari akun"]').click()
    await page
      .getByRole('button', { name: 'Buat akun wisatawan', exact: true })
      .waitFor()
    if (process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD) {
      await login(
        process.env.E2E_ADMIN_EMAIL,
        process.env.E2E_ADMIN_PASSWORD,
        'SuperAdmin'
      )
      await page
        .locator('.admin-sidebar nav')
        .getByText('Layanan & Pesanan', { exact: true })
        .click()
      await page.locator('.ops-order').first().waitFor()
      const voucher = page
        .locator('.ops-order')
        .filter({ hasText: primaryOrder.id })
        .locator('.travel-voucher')
        .first()
      await voucher
        .getByRole('button', { name: 'Validasi & check-in', exact: true })
        .click()
      await page
        .getByRole('status')
        .filter({ hasText: 'Check-in berhasil' })
        .waitFor()
      assert(
        await voucher
          .getByRole('button', { name: 'Check-in tercatat', exact: true })
          .isDisabled()
      )
      await shot('06-admin-operations.png')
      await page.getByRole('button', { name: 'Keluar', exact: true }).click()
      await page
        .getByRole('button', { name: 'Buat akun wisatawan', exact: true })
        .waitFor()
    }
    await login(email, password)
    await page.getByRole('heading', { name: /Lombok, lebih dekat/ }).waitFor()
    await page.setViewportSize({ width: 390, height: 844 })
    await shot('07-home-mobile.png')
    await noOverflow()
    await page
      .locator('.travel-services')
      .getByRole('button', { name: /Paket Wisata/ })
      .click()
    await shot('08-bundles-mobile.png')
    await noOverflow()
    await page
      .locator('.travel-card')
      .first()
      .getByRole('button', { name: 'Pilih paket' })
      .click()
    await shot('09-checkout-mobile.png')
    await noOverflow()
    await page
      .locator('.consumer-mobile-nav')
      .getByRole('button', { name: 'Tiket Saya', exact: true })
      .click()
    await page
      .locator('.booking-list-item')
      .filter({ hasText: primaryOrder.id })
      .click()
    await shot('10-itinerary-mobile.png')
    await readableQrs(primaryOrder)
    await noOverflow()
    assert.deepEqual(errors, [])
    console.log(
      'PASS: server sessions, roles, CSRF, account isolation, payments, bundle/hotel/boat/destination tickets, readable QR codes on desktop/mobile and offline downloads, overview itinerary, admin check-in and layout.'
    )
  } finally {
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
