# SILAQ

Platform pariwisata Lombok dengan portal wisatawan, admin mitra, dan superadmin. Desain biru/navy awal dipertahankan; fitur baru mengikuti tampilan tersebut.

## Fitur

- Pemesanan destinasi, paket beberapa tempat wisata, hotel, dan tiket kapal.
- Kuliner berupa overview, alamat, dan peta; tanpa pemesanan makanan.
- Overview paket memuat ringkasan rute, saran kuliner, dan pilihan hotel.
- Voucher QR per destinasi/hotel/kapal serta itinerary lengkap terbit setelah pembayaran berhasil.
- Unduhan tiket HTML berisi QR, dapat dibuka offline dan dicetak menjadi PDF.
- Harga, kuota, pembayaran, hak akses, dan check-in diverifikasi di server.
- Akun Gilang otomatis terisi setiap halaman login dibuka; pilih peran lalu tekan Masuk. Kolom tetap dapat diedit untuk akun lain.

## Pengembangan lokal

Gunakan Node.js 24.

```powershell
npm ci
npm run dev
```

Buka `http://localhost:3000`. Tanpa `DATABASE_URL`, perintah dev menggunakan PostgreSQL lokal melalui PGlite di `.data/postgres` dan pembayaran demo. Tidak ada transaksi uang nyata dalam mode ini.

Untuk akun Gilang pada ketiga portal, jalankan `npm run setup:gilang`. Perintah menampilkan password awal hanya untuk akun yang baru dibuat; akun yang sudah ada tidak diubah. Untuk memilih password awal, isi `GILANG_INITIAL_PASSWORD` sebelum menjalankannya.

Form login langsung menampilkan template publik Gilang sejak pertama muncul, tanpa menekan tombol atau mengaktifkan environment autofill. Peran awal adalah Wisatawan; memilih Admin Mitra atau SuperAdmin langsung mengganti isian sesuai peran. **Gunakan akun lain** mengosongkan kolom; akun lain juga bisa diketik langsung. Isian yang sedang diedit tidak ditimpa oleh respons konfigurasi. Membuka ulang halaman login kembali menampilkan Gilang.

Password template publik adalah `GilangDemo123!`, khusus contoh presentasi. Login tetap diverifikasi server; akun harus dibuat di database. Untuk memakai password demo berbeda yang sudah dikonfigurasi, isi `.env.local`:

```dotenv
PAYMENT_MODE=demo
ALLOW_DEMO_PAYMENTS=true
DEMO_LOGIN_ENABLED=true
DEMO_LOGIN_PASSWORD=ISI_PASSWORD_AKUN_DEMO_YANG_SUDAH_DIBUAT
```

Ketiga akun menggunakan email `gilang.wisatawan@silaq.local`, `gilang.admin@silaq.local`, dan `gilang.superadmin@silaq.local`. Password pribadi tidak disimpan dalam repository. Override password dari server hanya diberikan dalam mode demo; sandbox/production hanya menampilkan template publik.

Saat membuat akun baru, `setup:gilang` memakai `GILANG_INITIAL_PASSWORD`, lalu `DEMO_LOGIN_PASSWORD` bila tersedia. Dalam mode demo/lokal, tanpa override, akun baru memakai password template publik. Pada sandbox/production, tanpa password provisioning, script membuat password acak. Akun yang sudah ada tetap dipertahankan.

## Vercel

Konfigurasi tersedia di `.env.example` dan `vercel.json`. Atur environment di proyek Vercel:

- `DATABASE_URL`: koneksi PostgreSQL persisten; PGlite lokal tidak digunakan pada Vercel.
- `APP_URL`: URL aplikasi yang menerima permintaan dan notifikasi pembayaran.
- `PAYMENT_MODE`: `demo`, `sandbox`, atau `production`.
- Untuk demo: `ALLOW_DEMO_PAYMENTS=true`. Dua variabel `DEMO_LOGIN_*` hanya diperlukan bila memakai password template demo berbeda dari bawaan publik.
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
