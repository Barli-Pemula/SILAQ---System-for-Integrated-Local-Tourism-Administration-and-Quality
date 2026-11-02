const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = path.join(__dirname, '..', 'screenshot', 'terbaru')
const PROBE = process.argv.includes('--probe')
const AUDIT = process.argv.includes('--audit') || PROBE
const ROLE = {
  consumer: 'Wisatawan',
  admin: 'Admin Mitra',
  superadmin: 'Superadmin',
}
const EMAIL = {
  consumer: 'gilang.wisatawan@silaq.local',
  admin: 'gilang.admin@silaq.local',
  superadmin: 'gilang.superadmin@silaq.local',
}
const DEVICES = [
  {
    id: 'handphone',
    label: 'Handphone',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'desktop',
    label: 'Desktop',
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
]
const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p))
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  )
const entries = [],
  audit = [],
  errors = []

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  let framePage
  try {
    for (const device of DEVICES) {
      if (PROBE && !device.isMobile) continue
      const frame = await browser.newContext({
        deviceScaleFactor: device.deviceScaleFactor,
        reducedMotion: 'reduce',
      })
      framePage = await frame.newPage()
      const context = await browser.newContext({
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: device.isMobile,
        hasTouch: device.hasTouch,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      page.on('pageerror', (error) =>
        errors.push({ device: device.id, message: error.message })
      )
      const consumerNav = async (name) => {
        const nav = device.isMobile
          ? page.locator('.consumer-mobile-nav')
          : page.locator('header nav')
        await nav.getByRole('button', { name, exact: true }).click()
      }
      const explore = async (category) => {
        await consumerNav('Jelajahi')
        await page.getByRole('tab', { name: category, exact: true }).click()
        await page.locator('#market-results').waitFor()
      }
      const profileMenu = async (name) => {
        await consumerNav('Profil')
        await page.getByRole('button', { name: new RegExp(`^${name}`) }).click()
      }
      const adminNav = async (label) => {
        if (device.isMobile)
          await page.getByRole('button', { name: /Buka menu/ }).click()
        await page
          .locator('.admin-sidebar nav')
          .getByText(label, { exact: true })
          .click()
        await page
          .locator('.page-heading h1')
          .filter({
            hasText: label === 'Ringkasan' ? /Dashboard|Ringkasan/ : label,
          })
          .waitFor()
      }
      const chooseRole = async (role) => {
        await page.getByRole('button', { name: /^Masuk sebagai/ }).waitFor()
        const label =
          role === 'consumer'
            ? 'Wisatawan'
            : role === 'admin'
              ? 'Admin Mitra'
              : 'SuperAdmin'
        await page
          .locator('.role-grid')
          .getByRole('button', { name: new RegExp(`^${label}`) })
          .click()
        await page.waitForFunction(
          (email) =>
            document.querySelector('input[type=email]')?.value === email,
          EMAIL[role]
        )
        assert(
          (await page.locator('input[type=password]').inputValue()) ===
            process.env.DEMO_LOGIN_PASSWORD,
          'Password template belum terisi'
        )
      }
      const login = async (role) => {
        await context.clearCookies()
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })
        await chooseRole(role)
        await page.getByRole('button', { name: /^Masuk sebagai/ }).click()
        await page
          .locator(role === 'consumer' ? '.consumer-main' : '.admin-main')
          .waitFor()
        if (role !== 'consumer') {
          await adminNav('Layanan & Pesanan')
          await page.locator('.ops-order').first().waitFor()
        }
      }
      const checkout = async (category, title) => {
        await explore(category)
        await page
          .locator('.travel-card')
          .filter({
            has: page.getByRole('heading', { name: title, exact: true }),
          })
          .getByRole('button', { name: /Pilih paket|^Pesan$/ })
          .click()
        await page
          .getByRole('heading', { name: 'Rencanakan perjalananmu.' })
          .waitFor()
        await page
          .getByLabel('Nama lengkap', { exact: true })
          .fill('Gilang Khaerul Afan')
        await page.getByLabel('Email', { exact: true }).fill(EMAIL.consumer)
        await page
          .getByLabel('Nomor telepon', { exact: true })
          .fill('081234567890')
      }
      async function capture(role, slug, title, description, options = {}) {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(100)
        const widths = device.isMobile ? [320, 360, 390, 430, 768] : [1440]
        for (const width of widths) {
          await page.setViewportSize({ width, height: device.viewport.height })
          const measured = await page.evaluate(
            (targetWidth) => ({
              width: innerWidth,
              actual: document.documentElement.scrollWidth,
              offenders: [...document.querySelectorAll('main *')]
                .filter((el) => {
                  const r = el.getBoundingClientRect()
                  return (
                    r.width > 0 &&
                    r.right > targetWidth + 2 &&
                    !el.closest(
                      '.overflow-x-auto, .carousel-row, .travel-tabs, .travel-filter-chips'
                    )
                  )
                })
                .slice(0, 7)
                .map((el) => ({
                  tag: el.tagName,
                  class: el.className,
                  right: Math.round(el.getBoundingClientRect().right),
                })),
            }),
            width
          )
          audit.push({
            device: device.id,
            role,
            page: slug,
            viewport: width,
            actual: measured.actual,
            passed: measured.actual <= width + 1,
            ...(measured.actual > width + 1
              ? { offenders: measured.offenders }
              : {}),
          })
        }
        await page.setViewportSize(device.viewport)
        if (options.focus)
          await page
            .locator(options.focus)
            .first()
            .evaluate((element) =>
              element.scrollIntoView({ block: 'center', behavior: 'instant' })
            )
        const folderRole = role === 'consumer' ? 'wisatawan' : role
        const relative = `${device.id}/${folderRole}/${slug}.png`
        const fullRelative = `${device.id}/${folderRole}/${slug}-penuh.png`
        const item = {
          device: device.id,
          role,
          slug,
          title,
          description,
          image: relative,
          fullImage: fullRelative,
          width: device.viewport.width,
          height: device.viewport.height,
        }
        entries.push(item)
        if (!AUDIT) {
          await page.evaluate(async () => {
            const images = [...document.images]
            images.forEach((img) => {
              img.loading = 'eager'
            })
            await Promise.race([
              Promise.all(images.map((img) => img.decode().catch(() => {}))),
              new Promise((resolve) => setTimeout(resolve, 3500)),
            ])
          })
          const raw = await page.screenshot({
            animations: 'disabled',
            fullPage: false,
          })
          fs.mkdirSync(path.dirname(path.join(OUT, relative)), {
            recursive: true,
          })
          await page.screenshot({
            path: path.join(OUT, fullRelative),
            animations: 'disabled',
            fullPage: options.modal ? false : true,
          })
          const mobile = device.isMobile
          const stageWidth = mobile ? 470 : 1496
          await framePage.setViewportSize({
            width: stageWidth,
            height: mobile ? 1160 : 1260,
          })
          await framePage.setContent(
            `<!doctype html><html lang="id"><meta charset="utf-8"><style>
            *{box-sizing:border-box}body{margin:0;background:#eef3ef;color:#173b35;font-family:Arial,sans-serif}.stage{width:${stageWidth}px;padding:${mobile ? 28 : 28}px}
            .eyebrow{font-size:11px;letter-spacing:2px;color:#648474;font-weight:700;margin:0 0 10px}h1{font-size:${mobile ? 23 : 28}px;line-height:1.35;margin:0 0 9px}.meta{font-size:12px;color:#71867b;margin:0 0 20px}
            .screen{width:${device.viewport.width}px;border:1px solid #cad9ce;overflow:hidden;border-radius:${mobile ? 24 : 12}px;box-shadow:0 12px 26px #193c3510;background:white;margin:auto}.screen img{display:block;width:100%;height:auto}
            .caption{margin:20px auto 0;width:100%;border-left:3px solid #278377;padding:0 0 0 13px;font-size:${mobile ? 13 : 14}px;line-height:1.8;color:#4e6b5c}.footer{font-size:10px;color:#829488;margin-top:15px;line-height:1.7}
            </style><div class="stage"><p class="eyebrow">SILAQ / ${escape(role === 'login' ? 'AKSES AKUN' : ROLE[role].toUpperCase())}</p><h1>${escape(title)}</h1><p class="meta">${device.label} · ${device.viewport.width} × ${device.viewport.height} · Akun Gilang Khaerul Afan</p><div class="screen"><img src="data:image/png;base64,${raw.toString('base64')}" alt="${escape(title)}"></div><p class="caption">${escape(description)}</p><p class="footer">Dokumentasi antarmuka · Mode pengujian · Versi halaman penuh tersedia pada file terpisah.</p></div></html>`,
            { waitUntil: 'load' }
          )
          await framePage
            .locator('.stage')
            .screenshot({ path: path.join(OUT, relative) })
        }
        console.log(
          `${AUDIT ? 'AUDIT' : 'CAPTURE'} ${device.id}/${role}/${slug}`
        )
      }

      if (PROBE) {
        await login('admin')
        await adminNav('Ringkasan')
        await capture('admin', '01-ringkasan', 'Ringkasan', 'Probe layout')
        await page.setViewportSize({ width: 320, height: 844 })
        await page.screenshot({
          path: path.join(__dirname, '..', '.data', 'capture-debug.png'),
          fullPage: true,
        })
        await context.close()
        await frame.close()
        continue
      }
      await page.goto(BASE, { waitUntil: 'domcontentloaded' })
      for (const [role, number] of [
        ['consumer', '01'],
        ['admin', '02'],
        ['superadmin', '03'],
      ]) {
        await chooseRole(role)
        await page
          .getByLabel('Alamat email', { exact: true })
          .fill('edited@example.test')
        await page.locator('input[type=password]').fill('Edited-password-123')
        await page
          .getByRole('button', { name: 'Gunakan template Gilang', exact: true })
          .click()
        assert.equal(
          await page.getByLabel('Alamat email', { exact: true }).inputValue(),
          EMAIL[role]
        )
        assert.equal(
          await page.locator('input[type=password]').inputValue(),
          process.env.DEMO_LOGIN_PASSWORD
        )
        await page
          .getByLabel('Alamat email', { exact: true })
          .fill('edited-again@example.test')
        await page.locator('input[type=password]').fill('Edited-password-456')
        await chooseRole(role)
        await capture(
          'login',
          `${number}-login-${role === 'consumer' ? 'wisatawan' : role}`,
          `Login ${ROLE[role]}`,
          `Email dan password akun ${ROLE[role]} milik Gilang terisi otomatis. Pengguna tetap menekan Masuk; server memeriksa kredensial dan hak akses.`
        )
      }
      await page
        .getByRole('button', { name: 'Buat akun wisatawan', exact: true })
        .click()
      assert.equal(
        await page.getByLabel('Alamat email', { exact: true }).inputValue(),
        ''
      )
      await capture(
        'login',
        '04-pendaftaran',
        'Pendaftaran wisatawan',
        'Form pembuatan akun baru dengan nama, email, dan password. Template akun demo tidak mengisi kolom registrasi.'
      )

      await login('consumer')
      await capture(
        'consumer',
        '01-beranda',
        'Beranda wisatawan',
        'Pintu masuk perjalanan: pencarian destinasi, akses paket wisata, hotel, kapal, dan kuliner, serta rekomendasi pilihan.'
      )
      for (const [category, slug, title, description] of [
        [
          'Destinasi',
          '02-jelajahi',
          'Jelajahi destinasi',
          'Pencarian destinasi dengan filter wilayah dan pengurutan harga. Pilih tempat untuk memulai pemesanan tiket.',
        ],
        [
          'Paket Wisata',
          '03-paket-wisata',
          'Paket wisata',
          'Card paket menggabungkan beberapa destinasi dalam sekali pesan. Ringkasan rute serta inspirasi hotel dan kuliner ditampilkan tanpa itinerary rinci.',
        ],
        [
          'Hotel',
          '04-hotel',
          'Pilihan hotel',
          'Katalog hotel dengan fasilitas dan harga per kamar per malam. Check-in, check-out, dan jumlah kamar dipilih pada pemesanan.',
        ],
        [
          'Tiket Kapal',
          '05-tiket-kapal',
          'Tiket kapal Lombok',
          'Pilihan rute penyeberangan sekali jalan, durasi, dan harga penumpang. Jadwal dipilih saat memesan.',
        ],
        [
          'Kuliner',
          '06-kuliner',
          'Jelajah kuliner',
          'Overview kuliner, menu khas, alamat kawasan, dan tautan peta. Tidak ada pemesanan atau pembayaran makanan.',
        ],
      ]) {
        await explore(category)
        await capture('consumer', slug, title, description)
      }
      await consumerNav('Event')
      await capture(
        'consumer',
        '07-kalender',
        'Kalender event',
        'Kalender dan daftar kegiatan pariwisata. Agenda pada modul awal ini masih merupakan data contoh.'
      )
      await consumerNav('AI Guide')
      await capture(
        'consumer',
        '08-ai-guide',
        'AI Guide',
        'Asisten perjalanan dengan rekomendasi dan pertanyaan cepat. Kolom chat disesuaikan untuk layar sentuh; jawaban masih berbasis katalog contoh.'
      )
      await profileMenu('Perjalanan Saya')
      await capture(
        'consumer',
        '09-perjalanan',
        'Perjalanan saya',
        'Pesanan server ditampilkan bersama riwayat perjalanan, voucher, dan hadiah dari modul contoh awal.'
      )
      await consumerNav('Tiket Saya')
      await page.locator('.booking-list-item').first().waitFor()
      await capture(
        'consumer',
        '10-tiket-saya',
        'Tiket dan pesanan saya',
        'Riwayat lintas layanan dengan status lunas atau menunggu pembayaran. Pesanan tersimpan pada akun di server.'
      )
      await page
        .locator('.booking-list-item')
        .filter({ hasText: 'Rimbun Lombok Utara' })
        .click()
      await page
        .getByRole('heading', { name: 'Itinerary untuk ceritamu.' })
        .waitFor()
      await capture(
        'consumer',
        '11-voucher-itinerary',
        'Voucher dan itinerary lengkap',
        'Setelah pembayaran uji berhasil, setiap voucher destinasi dan hotel memiliki QR yang bisa dipindai. Itinerary lengkap memuat hari, jam WITA, alamat, dan biaya yang termasuk.',
        { focus: '.voucher-qr' }
      )
      const downloadPromise = page.waitForEvent('download')
      await page
        .getByRole('button', { name: 'Unduh voucher & itinerary' })
        .click()
      const ticketDownload = await downloadPromise
      const examplePath = path.join(OUT, 'contoh-tiket-qr.html')
      await ticketDownload.saveAs(examplePath)
      const ticketExample = fs.readFileSync(examplePath, 'utf8')
      await consumerNav('Tiket Saya')
      await page
        .locator('.booking-list-item')
        .filter({ hasText: 'Cerita dari Selatan' })
        .click()
      await page
        .getByRole('heading', { name: 'Menunggu pembayaran', exact: true })
        .waitFor()
      await capture(
        'consumer',
        '12-menunggu-pembayaran',
        'Menunggu pembayaran',
        'Pesanan pending belum memiliki voucher aktif atau itinerary lengkap. Halaman menjelaskan batas reservasi dan menyediakan pemeriksaan status.'
      )
      await checkout('Paket Wisata', 'Rimbun Lombok Utara')
      await page.getByLabel('Peserta', { exact: true }).selectOption('2')
      await page
        .getByRole('checkbox', { name: /Tambahkan Rimbun Lodge/ })
        .check()
      await capture(
        'consumer',
        '13-pemesanan-paket',
        'Pemesanan paket wisata',
        'Pengaturan tanggal dan peserta, komponen tiket yang termasuk, tambahan hotel opsional, data pemesan, serta ringkasan harga.'
      )
      await page
        .getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
        .click()
      await page.getByRole('checkbox', { name: /Saya sudah memeriksa/ }).check()
      await capture(
        'consumer',
        '14-pembayaran',
        'Konfirmasi pembayaran',
        'Tinjau pesanan dan pilih QRIS atau Virtual Account. Screenshot memakai mode pengujian; pelunasan nyata memerlukan konfigurasi Midtrans.'
      )
      for (const [category, product, slug, title, description] of [
        [
          'Hotel',
          'Sagara Stay Kuta',
          '15-pemesanan-hotel',
          'Pemesanan hotel',
          'Form check-in dan check-out, jumlah kamar, kontak pemesan, dan total harga kamar dikalikan malam.',
        ],
        [
          'Tiket Kapal',
          'Padangbai → Bangsal',
          '16-pemesanan-kapal',
          'Pemesanan kapal',
          'Tanggal keberangkatan, jumlah penumpang, jam WITA, pelabuhan asal dan tujuan, serta ringkasan pembayaran.',
        ],
        [
          'Destinasi',
          'Gili Trawangan',
          '17-pemesanan-destinasi',
          'Pemesanan tiket destinasi',
          'Pilih tanggal, jenis tiket, dan jumlah peserta. Ketersediaan diperiksa server sebelum reservasi.',
        ],
      ]) {
        await checkout(category, product)
        await capture('consumer', slug, title, description)
      }
      await profileMenu('Kredit Karbon')
      await capture(
        'consumer',
        '18-karbon',
        'Jejak karbon',
        'Ringkasan emisi dan pilihan proyek lingkungan dari modul contoh. Tampilan kartu dan tombol disesuaikan untuk handphone.'
      )
      await profileMenu('Pengaduan Online')
      await capture(
        'consumer',
        '19-pengaduan',
        'Pengaduan wisatawan',
        'Form kategori, destinasi, detail lokasi, dan pesan, disertai daftar laporan serta tanggapan. Data laporan mengikuti modul contoh awal.'
      )
      await consumerNav('Profil')
      await capture(
        'consumer',
        '20-profil',
        'Profil Gilang',
        'Identitas akun Gilang dan pintasan transaksi, perjalanan, event, karbon, hadiah, serta pengaduan.'
      )
      await consumerNav('Home')
      await page
        .getByRole('heading', { name: 'Gili Trawangan', exact: true })
        .first()
        .click()
      await page.getByRole('dialog').waitFor()
      await capture(
        'consumer',
        '21-overview-destinasi',
        'Overview destinasi',
        'Ringkasan destinasi, saran itinerary, kuliner dan hotel di wilayah terkait, sorotan, alamat, dan tautan peta sebelum memesan.',
        { modal: true }
      )
      await page
        .getByRole('button', { name: 'Tutup overview', exact: true })
        .click()
      await explore('Paket Wisata')
      await page
        .locator('.travel-card')
        .filter({ hasText: 'Rimbun Lombok Utara' })
        .getByRole('button', { name: 'Lihat overview & itinerary' })
        .click()
      await page.getByRole('dialog').waitFor()
      await capture(
        'consumer',
        '22-overview-paket',
        'Overview paket dan saran itinerary',
        'Rute per hari, rekomendasi kuliner, dan pilihan hotel terlihat sebelum memesan. Harga hotel dan makanan terpisah; detail jam dan alamat terbuka setelah pembayaran.',
        { modal: true }
      )
      await page
        .getByRole('button', { name: 'Tutup overview', exact: true })
        .click()
      for (const [title, slug, label] of [
        ['Sagara Stay Kuta', '23-voucher-hotel', 'Voucher hotel dengan QR'],
        ['Padangbai → Bangsal', '24-voucher-kapal', 'Tiket kapal dengan QR'],
      ]) {
        await consumerNav('Tiket Saya')
        await page
          .locator('.booking-list-item')
          .filter({ hasText: title })
          .click()
        await page.locator('.voucher-qr img').first().waitFor()
        await capture(
          'consumer',
          slug,
          label,
          'Contoh hasil pembayaran uji berhasil. QR memuat kode voucher yang divalidasi admin; tanggal dan jumlah tamu/kamar tercantum pada tiket.',
          { focus: '.voucher-qr' }
        )
      }
      await page.goto('about:blank')
      await page.setContent(ticketExample)
      await capture(
        'consumer',
        '25-tiket-offline',
        'Contoh unduhan tiket QR',
        'File HTML menyertakan QR setiap voucher dan itinerary lengkap. Bisa dibuka tanpa koneksi internet atau dicetak melalui browser menjadi PDF.',
        { focus: '.ticket' }
      )

      for (const role of ['admin', 'superadmin']) {
        await login(role)
        const pages =
          role === 'admin'
            ? [
                [
                  'Ringkasan',
                  '01-ringkasan',
                  'Ringkasan operasional',
                  'Statistik kunjungan, kapasitas, dan transaksi dari dashboard contoh awal. Halaman diberi penanda data contoh.',
                ],
                [
                  'Layanan & Pesanan',
                  '02-layanan-pesanan',
                  'Layanan dan pesanan',
                  'Pesanan dari server, status pembayaran, kode voucher, dan tombol check-in. Wewenang mitra dibatasi oleh produk yang ditugaskan.',
                ],
                [
                  'Katalog layanan',
                  '03-katalog-layanan',
                  'Katalog layanan',
                  'Referensi bersama destinasi, paket, hotel, kapal, dan kuliner. Kuliner hanya informasi dan tidak menghasilkan transaksi.',
                ],
                [
                  'Validasi QR & Scanner',
                  '04-validasi-voucher',
                  'Validasi voucher',
                  'Kolom kode untuk validasi oleh petugas. Server memeriksa pelunasan, tanggal, hak akses, dan penggunaan sebelumnya.',
                ],
                [
                  'Tiket & Harga',
                  '05-tiket-harga',
                  'Tiket dan harga',
                  'Tabel jenis tiket, tarif, kuota, dan status dari modul contoh. Di handphone, tabel dapat digeser secara horizontal.',
                ],
                [
                  'Kasir POS',
                  '06-kasir-pos',
                  'Kasir POS',
                  'Contoh tata letak kasir dan ringkasan pembayaran. POS contoh tidak menerbitkan voucher server yang sah.',
                ],
                [
                  'Pengaduan',
                  '07-pengaduan',
                  'Pengaduan mitra',
                  'Daftar laporan dengan kategori, prioritas, status, dan detail penanganan dari modul pengaduan contoh.',
                ],
                [
                  'Laporan Harian',
                  '08-laporan-harian',
                  'Laporan harian',
                  'Contoh ringkasan penerimaan dan transaksi harian. Tabel tetap terbaca melalui area gulir pada handphone.',
                ],
                [
                  'Pengaturan',
                  '09-pengaturan',
                  'Pengaturan mitra',
                  'Contoh pengaturan profil dan operasional mitra dengan input dan tombol yang lebih mudah disentuh.',
                ],
              ]
            : [
                [
                  'Ringkasan',
                  '01-ringkasan',
                  'Ringkasan ekosistem',
                  'Statistik agregat destinasi, wilayah, dan transaksi dari modul contoh Superadmin.',
                ],
                [
                  'Layanan & Pesanan',
                  '02-layanan-pesanan',
                  'Seluruh layanan dan pesanan',
                  'Superadmin memantau pesanan server, status pembayaran, dan voucher lintas layanan.',
                ],
                [
                  'Katalog layanan',
                  '03-katalog-layanan',
                  'Katalog ekosistem',
                  'Referensi seluruh kategori layanan, harga dasar, jadwal kapal, kapasitas, dan alamat kuliner.',
                ],
                [
                  'AI Insight',
                  '04-ai-insight',
                  'AI Insight',
                  'Contoh analisis pariwisata dan panel percakapan. Layout chat menyesuaikan ukuran handphone.',
                ],
                [
                  'Mitra & Admin',
                  '05-mitra-admin',
                  'Mitra dan admin',
                  'Contoh daftar mitra, informasi kontak, serta status verifikasi. Tabel dapat digeser tanpa melebarkan halaman.',
                ],
                [
                  'Destinasi',
                  '06-destinasi',
                  'Direktori destinasi',
                  'Kartu destinasi dan informasi operasional dari katalog contoh, disusun satu kolom pada layar kecil.',
                ],
                [
                  'Transaksi',
                  '07-transaksi',
                  'Transaksi ekosistem',
                  'Contoh dashboard transaksi agregat. Pesanan aktual server berada pada menu Layanan & Pesanan.',
                ],
                [
                  'Laporan',
                  '08-laporan',
                  'Laporan eksekutif',
                  'Contoh pilihan template laporan dan jadwal pelaporan dengan kartu yang menyesuaikan lebar layar.',
                ],
                [
                  'Pengaturan',
                  '09-pengaturan',
                  'Pengaturan Superadmin',
                  'Contoh pengaturan profil, preferensi, dan platform. Identitas akun mengikuti Gilang Khaerul Afan.',
                ],
              ]
        for (const [label, slug, title, description] of pages) {
          if (label === 'Katalog layanan') {
            await adminNav('Layanan & Pesanan')
            await page
              .getByRole('button', { name: 'Katalog layanan', exact: true })
              .click()
          } else await adminNav(label)
          await capture(role, slug, title, description)
        }
      }
      await context.close()
      await frame.close()
    }
    const failures = audit.filter((item) => !item.passed)
    fs.writeFileSync(
      path.join(OUT, 'audit-layout.json'),
      JSON.stringify(
        { checks: audit.length, failures, errors, details: audit },
        null,
        2
      )
    )
    if (!AUDIT) writeGallery()
    console.log(
      `RESULT ${entries.length} halaman/perangkat, ${audit.length} pemeriksaan ukuran, ${failures.length} overflow, ${errors.length} error browser.`
    )
    if (failures.length) console.log(JSON.stringify(failures, null, 2))
    if (errors.length) console.log(JSON.stringify(errors, null, 2))
    assert.equal(failures.length, 0, 'Halaman masih melebar di luar viewport')
    assert.equal(errors.length, 0, 'Ada error browser')
  } finally {
    const failures = audit.filter((item) => !item.passed)
    fs.writeFileSync(
      path.join(OUT, 'audit-layout.json'),
      JSON.stringify(
        { checks: audit.length, failures, errors, details: audit },
        null,
        2
      )
    )
    await browser.close()
  }
}

function writeGallery() {
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        accountName: 'Gilang Khaerul Afan',
        mode: 'demo',
        entries,
      },
      null,
      2
    )
  )
  const readme = [
    '# Screenshot SILAQ terbaru',
    '',
    `Jumlah tampilan: ${entries.length}. Setiap tampilan tersedia sebagai PNG dengan judul/keterangan dan PNG halaman penuh.`,
    '',
    '- Handphone: viewport 390 x 844; layout juga diperiksa pada 320, 360, dan 430 px.',
    '- Desktop: viewport 1440 x 1000.',
    '- Akun: Gilang Khaerul Afan. Password pada screenshot tetap disamarkan.',
    '- Database screenshot terpisah dari database pengguna. Semua transaksi merupakan pengujian.',
    '- Modul awal yang masih berupa contoh dijelaskan pada keterangan masing-masing gambar.',
    '',
    'Buka index.html untuk galeri dan filter per perangkat/peran.',
    'Buka [contoh-tiket-qr.html](contoh-tiket-qr.html) untuk contoh unduhan tiket QR dan itinerary yang dapat dibaca offline atau dicetak menjadi PDF.',
    '',
    '| Perangkat | Peran | Halaman | Keterangan |',
    '| --- | --- | --- | --- |',
    ...entries.map(
      (item) =>
        `| ${item.device} | ${ROLE[item.role] || 'Login'} | [${item.title}](${item.image}) | ${item.description} |`
    ),
  ].join('\n')
  fs.writeFileSync(path.join(OUT, 'README.md'), readme)
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dokumentasi Screenshot SILAQ</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f3f7f3;color:#193e34;font:15px/1.7 system-ui,sans-serif}header,main{max-width:1320px;margin:auto;padding:28px}h1{font-size:clamp(26px,4vw,42px);letter-spacing:-1px;margin:0}.lead{color:#688174;max-width:800px}.filters{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}select,input{padding:12px;border:1px solid #d0ded3;border-radius:10px;background:white;color:#234b3a;font:inherit}input{flex:1;min-width:180px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:22px}.card{overflow:hidden;border:1px solid #d9e5db;border-radius:16px;background:white}.preview{display:block;height:350px;overflow:auto;background:#eaf1e9}.preview img{display:block;width:100%;height:auto}.body{padding:18px}h2{margin:4px 0;font-size:19px}small{color:#648773}p{color:#71846f;font-size:13px}a{color:#18675a}footer{padding:28px;text-align:center;color:#84947e;font-size:12px}.links{display:flex;gap:16px}article[hidden]{display:none}.count{margin:20px 0;color:#6d8271}
  </style><header><small>SILAQ / DOKUMENTASI ANTARMUKA</small><h1>Seluruh halaman, terdokumentasi.</h1><p class="lead">Tampilan wisatawan, admin mitra, dan superadmin atas nama Gilang Khaerul Afan. Setiap screenshot memiliki judul dan keterangan. Transaksi di dalam gambar merupakan pengujian.</p><p><a href="contoh-tiket-qr.html">Buka contoh unduhan tiket QR &amp; itinerary</a></p><div class="filters"><select id="device" aria-label="Filter perangkat"><option value="">Semua perangkat</option><option>handphone</option><option>desktop</option></select><select id="role" aria-label="Filter peran"><option value="">Semua peran</option><option value="login">Login</option><option value="consumer">Wisatawan</option><option value="admin">Admin Mitra</option><option value="superadmin">Superadmin</option></select><input id="search" aria-label="Cari halaman" placeholder="Cari nama halaman…"></div><div class="count" id="count"></div></header><main class="grid">${entries.map((item) => `<article class="card" data-device="${item.device}" data-role="${item.role}" data-title="${escape(item.title.toLowerCase())}"><a class="preview" href="${item.image}"><img loading="lazy" src="${item.image}" alt="${escape(item.title)}"></a><div class="body"><small>${escape(item.device)} / ${escape(ROLE[item.role] || 'Login')}</small><h2>${escape(item.title)}</h2><p>${escape(item.description)}</p><div class="links"><a href="${item.image}">PNG + keterangan</a><a href="${item.fullImage}">Halaman penuh</a></div></div></article>`).join('')}</main><footer>Ukuran handphone 390 × 844 · Desktop 1440 × 1000 · <a href="README.md">Daftar dan keterangan</a> · <a href="audit-layout.json">Hasil pemeriksaan layout</a></footer><script>const filters=['device','role','search'].map(id=>document.getElementById(id));function apply(){let total=0;document.querySelectorAll('.card').forEach(card=>{card.hidden=!!((filters[0].value&&card.dataset.device!==filters[0].value)||(filters[1].value&&card.dataset.role!==filters[1].value)||!card.dataset.title.includes(filters[2].value.toLowerCase()));if(!card.hidden)total++});document.getElementById('count').textContent=total+' screenshot ditampilkan'}filters.forEach(el=>el.addEventListener('input',apply));apply()</script></html>`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
