# SILAQ

Platform pariwisata Lombok dengan portal wisatawan, admin mitra, dan superadmin. Desain biru/navy awal dipertahankan; fitur baru mengikuti tampilan tersebut.

## Fitur

- Pemesanan destinasi, paket beberapa tempat wisata, hotel, dan tiket kapal.
- Kuliner berupa overview, alamat, dan peta; tanpa pemesanan makanan.
- Overview paket memuat ringkasan rute, saran kuliner, dan pilihan hotel.
- Voucher QR per destinasi/hotel/kapal serta itinerary lengkap terbit setelah pembayaran berhasil.
- Unduhan tiket HTML berisi QR, dapat dibuka offline dan dicetak menjadi PDF.
- Harga, kuota, pembayaran, hak akses, dan check-in diverifikasi di server.
- Template login Gilang dapat diaktifkan khusus mode demo.

## Pengembangan lokal

Gunakan Node.js 24.

```powershell
npm ci
npm run dev
```

Buka `http://localhost:3000`. Tanpa `DATABASE_URL`, perintah dev menggunakan PostgreSQL lokal melalui PGlite di `.data/postgres` dan pembayaran demo. Tidak ada transaksi uang nyata dalam mode ini.

Untuk akun Gilang pada ketiga portal, jalankan `npm run setup:gilang`. Perintah menampilkan password awal hanya untuk akun yang baru dibuat; akun yang sudah ada tidak diubah. Untuk memilih password awal, isi `GILANG_INITIAL_PASSWORD` sebelum menjalankannya.

Autofill diaktifkan melalui `.env.local`. Tombol **Gunakan template Gilang** mengisi ulang email dan password untuk peran yang sedang dipilih, termasuk setelah kolom diedit:

```dotenv
PAYMENT_MODE=demo
ALLOW_DEMO_PAYMENTS=true
DEMO_LOGIN_ENABLED=true
DEMO_LOGIN_PASSWORD=ISI_PASSWORD_AKUN_DEMO_YANG_SUDAH_DIBUAT
```

Ketiga akun menggunakan email `gilang.wisatawan@silaq.local`, `gilang.admin@silaq.local`, dan `gilang.superadmin@silaq.local`. Password tidak disimpan dalam repository. Autofill tidak diberikan dalam mode sandbox atau production.

Saat membuat akun baru, `setup:gilang` memakai `GILANG_INITIAL_PASSWORD`, lalu `DEMO_LOGIN_PASSWORD` bila tersedia, agar akun sesuai dengan template. Akun yang sudah ada tetap dipertahankan.

## Vercel

Konfigurasi tersedia di `.env.example` dan `vercel.json`. Atur environment di proyek Vercel:

- `DATABASE_URL`: koneksi PostgreSQL persisten; PGlite lokal tidak digunakan pada Vercel.
- `APP_URL`: URL aplikasi yang menerima permintaan dan notifikasi pembayaran.
- `PAYMENT_MODE`: `demo`, `sandbox`, atau `production`.
- Untuk demo: `ALLOW_DEMO_PAYMENTS=true`. Jika autofill diperlukan, aktifkan dua variabel `DEMO_LOGIN_*` di atas.
- Untuk Midtrans: `MIDTRANS_SERVER_KEY` sesuai lingkungan; URL notifikasi adalah `/api/payments/midtrans` pada domain aplikasi.

Jalankan `npm run setup` dengan koneksi database target untuk menyiapkan schema dan, bila variabel `PROVISION_*` diisi, akun pengelola. Jalankan `npm run setup:gilang` dengan koneksi database target bila menggunakan akun demo di Vercel. Hapus password provisioning dari environment setelah selesai.

Katalog saat ini adalah contoh. Mode production menolak katalog contoh sampai inventori mitra diganti dan `CATALOG_APPROVED=true` dikonfigurasi.

## Validasi dan screenshot

```powershell
npm run typecheck
npm run test:server
npm run build
npm run test:browser
npm run screenshots
```

Pengujian browser dan screenshot menjalankan server produksi lokal dengan database sementara terpisah. Screenshot semua portal, galeri, keterangan, hasil audit ukuran layar, dan contoh unduhan tiket tersimpan di `screenshot/terbaru/`. Buka `screenshot/terbaru/index.html` untuk galeri. `npm run screenshots:audit` memeriksa layout tanpa membuat ulang gambar.

Database, file environment pribadi, screenshot, dan hasil pengujian tidak dimasukkan ke Git.
