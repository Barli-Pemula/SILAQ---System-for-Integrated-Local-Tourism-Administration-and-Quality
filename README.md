# SILAQ

Platform pariwisata Lombok dengan portal wisatawan, admin mitra, dan superadmin. Desain biru/navy awal dipertahankan; fitur baru mengikuti tampilan tersebut.

## Fitur

- Pemesanan destinasi, paket beberapa tempat wisata, hotel, dan tiket kapal.
- Kuliner berupa overview, alamat, dan peta; tanpa pemesanan makanan.
- Overview paket memuat ringkasan rute, saran kuliner, dan pilihan hotel.
- Voucher QR per destinasi/hotel/kapal serta itinerary lengkap terbit setelah pembayaran berhasil.
- Unduhan tiket HTML berisi QR, dapat dibuka offline dan dicetak menjadi PDF.
- Mode database memverifikasi harga, kuota, pembayaran, hak akses, dan check-in di server. Mode presentasi mensimulasikan alur yang sama di browser.
- Akun Gilang otomatis terisi setiap halaman login dibuka; pilih peran lalu tekan Masuk. Kolom tetap dapat diedit untuk akun lain.

## Demo presentasi tanpa database

Pada Vercel tanpa `DATABASE_URL`, gateway pembayaran, atau inventori produksi, mode presentasi aktif otomatis. Bisa juga diaktifkan dengan `PRESENTATION_MODE=true`. Tidak perlu setup akun atau database: pilih peran Gilang, lalu klik Masuk.

Pemesanan, pembayaran berhasil/gagal, itinerary, QR unik, unduhan tiket, serta validasi admin berjalan menggunakan penyimpanan browser. Wisatawan, admin, dan superadmin pada browser yang sama dapat melihat pesanan demo yang sama sesuai peran. Reload mempertahankan data; browser/perangkat lain memiliki data demo terpisah. Menghapus penyimpanan situs menghapus data demo.

Tidak ada pembayaran atau reservasi mitra nyata. Mode ini tidak aktif ketika `PAYMENT_MODE=production` atau `CATALOG_APPROVED=true`. Gunakan `PRESENTATION_MODE=false` untuk mewajibkan backend database.

## Pengembangan lokal

### Estimasi jejak karbon

Checkout menyediakan titik keberangkatan opsional, moda darat, peserta per kendaraan, dan opsi kembali ke titik awal. Tombol lokasi meminta izin sekali, memilih titik kawasan terdekat dalam 35 km, dan tidak menyimpan atau mengirim koordinat presisi. Jika izin ditolak, tidak akurat, atau di luar kawasan, pilihan manual tetap tersedia.

Overview bundling menampilkan estimasi jarak antar destinasi. Checkout memperbarui estimasi langsung dan menyediakan tautan Carbon Footprint; kembali dari laporan mempertahankan isian. Laporan memisahkan pratinjau belum dibayar dari total pesanan lunas. Data pesanan dan snapshot perhitungan bertahan setelah reload, baik pada mode server maupun mode presentasi. Pemesanan server menghitung ulang hasil dari input yang divalidasi; angka emisi atau koordinat tambahan dari klien tidak diterima sebagai hasil perhitungan.

Metode `silaq-distance-v1` menggunakan titik kawasan perkiraan, Haversine × 1,35 untuk darat, dan garis lurus untuk laut. Ini estimasi awal, bukan rute jalan terverifikasi atau bukti perjalanan aktual. Perjalanan kapal dihitung sekali jalan; akses pulau pada tiket destinasi diperkirakan pulang-pergi ke dermaga. Tidak ada layanan peta pihak ketiga atau API key tambahan. Ganti pendekatan jarak ini dengan rute/operator yang tervalidasi sebelum menjadikannya dasar pelaporan resmi.

Faktor bersumber dari [DESNZ 2026, flat file revisi Juli](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026): mobil bensin 0,16152 kg CO₂e/kendaraan-km, motor kecil 0,08319, coach 0,03948 kg CO₂e/penumpang-km, feri pejalan kaki 0,01871, dan hotel Indonesia 62,7 kg CO₂e/kamar/malam. Faktor transportasi Inggris adalah pendekatan, bukan pengukuran operator Lombok. Jumlah mobil/motor dibulatkan ke atas; akses hotel memakai asumsi 2 tamu/kamar. Produksi bahan bakar, penerbangan, makanan, dan aktivitas di lokasi belum termasuk. Emisi fast boat/kapal lokal belum dihitung tanpa data operator; jaraknya tetap ditampilkan dan keterbatasannya dijelaskan. Kontribusi konservasi tidak mengurangi total emisi.

Gunakan Node.js 24.

```powershell
npm ci
npm run dev
```

Buka `http://localhost:3000`. Tanpa `DATABASE_URL`, perintah dev menggunakan PostgreSQL lokal melalui PGlite di `.data/postgres` dan pembayaran demo. Tidak ada transaksi uang nyata dalam mode ini.

Untuk akun Gilang pada ketiga portal, jalankan `npm run setup:gilang`. Perintah menampilkan password awal hanya untuk akun yang baru dibuat; akun yang sudah ada tidak diubah. Untuk memilih password awal, isi `GILANG_INITIAL_PASSWORD` sebelum menjalankannya.

Form login langsung menampilkan template publik Gilang sejak pertama muncul, tanpa menekan tombol atau mengaktifkan environment autofill. Peran awal adalah Wisatawan; memilih Admin Mitra atau SuperAdmin langsung mengganti isian sesuai peran. Untuk akun lain, edit email dan password langsung di kolomnya. Isian yang sedang diedit tidak ditimpa oleh respons konfigurasi. Membuka ulang halaman login kembali menampilkan Gilang.

Password template publik adalah `GilangDemo123!`, khusus contoh presentasi. Mode tanpa database langsung menyediakan ketiga akun tersebut. Untuk mode database, akun perlu dibuat di database. Untuk memakai password demo server berbeda yang sudah dikonfigurasi, isi `.env.local`:

```dotenv
PAYMENT_MODE=demo
ALLOW_DEMO_PAYMENTS=true
DEMO_LOGIN_ENABLED=true
DEMO_LOGIN_PASSWORD=ISI_PASSWORD_AKUN_DEMO_YANG_SUDAH_DIBUAT
```

Ketiga akun menggunakan email `gilang.wisatawan@silaq.local`, `gilang.admin@silaq.local`, dan `gilang.superadmin@silaq.local`. Password pribadi tidak disimpan dalam repository. Override password dari server hanya diberikan dalam mode demo; sandbox/production hanya menampilkan template publik.

Saat membuat akun baru, `setup:gilang` memakai `GILANG_INITIAL_PASSWORD`, lalu `DEMO_LOGIN_PASSWORD` bila tersedia. Dalam mode demo/lokal, tanpa override, akun baru memakai password template publik. Pada sandbox/production, tanpa password provisioning, script membuat password acak. Akun yang sudah ada tetap dipertahankan.

## Vercel

Untuk presentasi tanpa database, deploy langsung; konfigurasi backend berikut hanya diperlukan jika menggunakan data server. Konfigurasi tersedia di `.env.example` dan `vercel.json`:

- `DATABASE_URL`: koneksi PostgreSQL persisten; PGlite lokal tidak digunakan pada Vercel.
- `APP_URL`: URL aplikasi yang menerima permintaan dan notifikasi pembayaran.
- `PAYMENT_MODE`: `demo`, `sandbox`, atau `production`.
- Untuk demo: `ALLOW_DEMO_PAYMENTS=true`. Dua variabel `DEMO_LOGIN_*` hanya diperlukan bila memakai password template demo berbeda dari bawaan publik.
- Untuk Midtrans: `MIDTRANS_SERVER_KEY` sesuai lingkungan; URL notifikasi adalah `/api/payments/midtrans` pada domain aplikasi.

Login dan aksi browser memvalidasi asal terhadap domain yang sedang diakses, sehingga URL preview Vercel atau domain alias tetap dapat dipakai meskipun berbeda dari `APP_URL`. `APP_URL` tetap diperlukan sebagai alamat kanonis untuk callback pembayaran. Permintaan dari domain lain, origin kosong, serta header forward yang dipalsukan tetap ditolak.

Jalankan `npm run setup` dengan koneksi database target untuk menyiapkan schema dan, bila variabel `PROVISION_*` diisi, akun pengelola. Jalankan `npm run setup:gilang` dengan koneksi database target bila menggunakan akun demo di Vercel. Hapus password provisioning dari environment setelah selesai.

Katalog saat ini adalah contoh. Mode production menolak katalog contoh sampai inventori mitra diganti dan `CATALOG_APPROVED=true` dikonfigurasi.

## Validasi dan screenshot

```powershell
npm run typecheck
npm run test:server
npm run build
npm run test:browser
npm run test:presentation
npm run screenshots
```

Untuk mengambil semua screenshot menggunakan mode tanpa database, jalankan `npm run screenshots -- --presentation`. Hasilnya juga mencakup contoh tiket QR dan itinerary pada browser.

Pengujian browser dan screenshot menjalankan server produksi lokal dengan database sementara terpisah. Screenshot semua portal, galeri, keterangan, hasil audit ukuran layar, dan contoh unduhan tiket tersimpan di `screenshot/terbaru/`. Buka `screenshot/terbaru/index.html` untuk galeri. `npm run screenshots:audit` memeriksa layout tanpa membuat ulang gambar.

Database, file environment pribadi, screenshot, dan hasil pengujian tidak dimasukkan ke Git.
