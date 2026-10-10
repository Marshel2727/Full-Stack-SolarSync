# Cache + API SolarSync: pemasangan dan verifikasi

## Apa yang berubah

Frontend membaca paket, FAQ, artikel dan pengajuan melalui API, bukan localStorage. Login sekarang memerlukan akun MySQL dengan password Argon2 dan sesi HttpOnly; memilih role demo tidak lagi memberikan akses. Kalkulator tetap perhitungan lokal, bukan respons API yang di-cache. Data simulasi tidak otomatis disalin ke database.

Katalog memakai TanStack Query (5 menit) + Redis (600 detik), dashboard 15 detik dengan polling saat tab aktif, riwayat energi 60 detik. Query yang tidak memiliki observer dibersihkan setelah 10 menit. Pengajuan staleTime 0, refetch saat navigasi/fokus/mutasi. Query cache tidak dipersistenkan. Logout/pergantian akun dan pemberitahuan antartab membatalkan query sebelum menghapus cache.

Sesi dan otorisasi dibaca langsung dari MySQL setiap permintaan privat, termasuk sebelum cache hit. Respons HTTP memakai no-store. Redis internal, maxmemory 128 MB, allkeys-lru, tanpa AOF/snapshot; kegagalan Redis tidak menggagalkan baca MySQL. Connect timeout dan socket timeout masing-masing 500 ms, tanpa retry otomatis (bukan jaminan total latensi end-to-end 500 ms).

Migrasi 0002 menambahkan satu tabel pendukung cache_epochs; 33 tabel fitur tetap ada. Epoch diubah dalam transaksi yang sama dengan perubahan katalog/agregat. Key lama tidak dipakai setelah commit, termasuk bila Redis mati saat penulisan atau pembaca lama selesai belakangan. Key lama habis melalui TTL; tidak ada FLUSHALL. Tetap ada satu query epoch pada cache hit, ditambah query otorisasi untuk data privat.

Dashboard mengambil waktu sampel dari device_telemetry, bukan waktu pembacaan cache. Lebih dari 3 interval sampel dianggap lama. Data hilang tetap null/keadaan kosong. Halaman monitoring dan profil lama yang berisi angka demo diganti tampilan API sederhana, bukan menampilkan angka simulasi sebagai data live.

## Jalankan sendiri: urut dari root proyek

Tidak ada instalasi, build, test, migrasi atau startup yang dijalankan oleh asisten. Pembaruan lockfile npm belum bisa dibentuk karena akses TLS registry dari lingkungan asisten gagal. Karena itu LANGKAH PERTAMA WAJIB menyinkronkan dependency/lockfile sebelum Dockerfile menjalankan npm ci.

PowerShell dengan Node.js/npm lokal:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL\frontend'
npm.cmd install
npm.cmd run test:cache
npx.cmd tsc --noEmit
cd ..
```

Jika tidak punya Node.js lokal, alternatif instalasi dan test melalui container (mount hanya folder frontend):

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
docker run --rm --mount "type=bind,source=C:\PROJECT WEB\fullstcukUNMUL\frontend,target=/app" -w /app node:20-alpine npm install
docker run --rm --mount "type=bind,source=C:\PROJECT WEB\fullstcukUNMUL\frontend,target=/app" -w /app node:20-alpine npm run test:cache
docker run --rm --mount "type=bind,source=C:\PROJECT WEB\fullstcukUNMUL\frontend,target=/app" -w /app node:20-alpine npx tsc --noEmit
```

Pilih salah satu alur dependency di atas, bukan keduanya. npm install akan memperbarui package-lock.json; simpan lockfile tersebut bersama kode. Berhenti jika test/typecheck error.

Build dan pengujian backend:

```powershell
docker compose build
docker compose run --rm --no-deps solarsync-backend python -m unittest discover -s tests -v
```

Setelah sukses, terapkan migrasi tambahan. Tidak menghapus database lama:

```powershell
docker compose up -d --wait solarsync-db solarsync-cache
docker compose run --rm solarsync-backend python -m alembic upgrade head
docker compose run --rm solarsync-backend python -m alembic current
docker compose run --rm solarsync-backend python -m alembic check
```

Head yang diharapkan adalah 0002_cache_epochs. Itu hasil keluaran, bukan perintah PowerShell.

Buat akun admin pertama secara interaktif (tidak mencetak password, tidak menimpa akun yang sudah ada):

```powershell
docker compose run --rm solarsync-backend python -m app.create_user
```

Isi email, nama, role admin dan passphrase minimal 15 karakter (maksimal 1024). Tidak ada akun/password bawaan. Akun customer dapat dibuat dengan perintah sama, tetapi hubungan customers.user_id dan site/system perlu disiapkan lewat proses administrasi; script tidak mengklaim kepemilikan berdasarkan email. Untuk konfigurasi login yang diperkuat dan syarat deployment production, baca [AUTH_PRODUCTION.md](AUTH_PRODUCTION.md).

Jalankan server:

```powershell
docker compose up -d --wait
docker compose ps
```

Buka http://localhost:3000/login. Login admin, lalu isi paket/artikel melalui halaman admin. Database kosong berarti katalog kosong. Jangan mengimpor mock pelanggan sebagai data sungguhan.

Akses frontend memakai localhost:3000 atau 127.0.0.1:3000 sesuai CORS. Permintaan tulis API memerlukan header Origin yang diizinkan. Swagger di port 8000 dapat membaca dokumentasi; untuk mencoba mutasi gunakan frontend atau klien yang mengirim Origin: http://localhost:3000. Proxy /api/v1 mengarah ke backend internal Docker; development Next.js di luar Docker memakai 127.0.0.1:8000.

## API yang tersedia

- POST /api/v1/auth/login, GET /auth/me, POST /auth/logout.
- GET /packages, /articles, /faqs; POST/PUT/DELETE /admin/packages, /admin/articles, /admin/faqs (PUT/DELETE menyertakan id).
- GET /admin/articles mencakup draft dan tidak memakai cache publik.
- GET /systems hanya sistem yang diizinkan; GET /systems/{id}/dashboard.
- GET /systems/{id}/energy?start=YYYY-MM-DD&end=YYYY-MM-DD (maksimum rentang 366 hari).
- PUT /admin/systems/{id}/energy/{local_date}: impor hasil agregasi harian yang telah dihitung, bukan algoritma pengolahan telemetri. Mutasi ini mengganti epoch dashboard/riwayat sistem sesudah commit.
- GET /requests terikat akun (admin melihat semua), POST /requests dengan consent=true menerima pengajuan; tamu menerima nomor tiket, bukan akses baca data pribadi.
- PATCH /admin/requests/{ticket}/status menerima status, note, version; versi lama menghasilkan 409.
- GET /admin/customers hanya data pelanggan nyata, bukan nomor customer buatan dari daftar pengajuan.

Semua path di atas berada di bawah /api/v1.

## Batasan yang disengaja

Implementasi ini jalur cache + integrasi API awal, bukan seluruh backend bisnis. Upload/unduh dokumen, pembaruan profil/notifikasi, jadwal teknisi/penawaran, provisioning site/device, worker telemetri, penghitungan agregat otomatis, undangan akun, dan reset password belum diimplementasikan. Form upload menolak pengiriman berkas daripada mengaku menyimpannya. Gambar cover artikel sementara kosong; jangan kirim URL upload palsu. Estimasi kalkulator lokal tidak dipersistenkan oleh endpoint pengajuan.

Pengajuan tamu tidak otomatis masuk akun yang kebetulan memakai email sama. Pemeriksaan kepemilikan harus melalui administrasi terverifikasi. Tidak ada migrasi data browser lama. Login gagal atau server tidak tersedia tidak pernah beralih ke akun demo.

Konfigurasi default untuk lokal. Login sekarang memakai limiter terdistribusi di `solarsync-auth-store` (Redis terpisah dengan `noeviction`), bukan Redis cache respons. Ketika auth-store gagal, login baru ditolak sementara; kegagalan Redis cache data tetap fallback ke MySQL. Redis bukan sumber sesi/hak akses. Sebelum produksi, ikuti [AUTH_PRODUCTION.md](AUTH_PRODUCTION.md): HTTPS, cookie aman, origin eksplisit, pembatas per-IP pada ingress tepercaya, pengelolaan rahasia/backup, serta audit workflow bisnis.

## Verifikasi manual browser

1. Isi paket/artikel sebagai admin. Refresh halaman dan pastikan data tetap ada dari database. Edit lalu pastikan daftar/detail dalam aplikasi yang sama diperbarui tanpa menunggu TTL.
2. Akun customer A/B harus memiliki relasi customer/site/system terpisah. Login A, buka sistemnya; akses URL sistem B harus 404. Ulangi setelah endpoint B pernah masuk cache.
3. Logout atau berganti akun, termasuk dari tab lain: data akun lama tidak boleh tetap terlihat. API privat tanpa sesi harus 401.
4. Buka monitoring, pilih sistem: Network menampilkan polling 15 detik saat aktif. Pindah tab selama 30 detik; tidak boleh ada polling dashboard baru. Kembali ke tab mengambil ulang sesuai staleTime.
5. Putuskan backend setelah data tampil: tampil indikator pembaruan gagal/data lama, bukan angka baru.
6. Hentikan Redis saja dengan docker compose stop solarsync-cache. Baca katalog/dashboard harus tetap berhasil. Ubah paket melalui admin saat Redis mati; hidupkan kembali Redis dan pastikan API mengembalikan versi baru.
7. Impor agregat harian melalui API admin, kemudian refresh dashboard/riwayat; data berubah. Agregat kosong tidak ditampilkan sebagai nol.
8. Dokumen privat tidak memiliki endpoint cache/download pada tahap ini.

## Pengukuran sebelum/sesudah (belum dijalankan)

Tambahkan METRICS_ENABLED=true dan CACHE_ENABLED=false ke .env root, simpan, lalu:

```powershell
docker compose up -d --force-recreate solarsync-backend
1..10 | ForEach-Object {
    $result = Invoke-WebRequest http://localhost:8000/api/v1/packages
    [pscustomobject]@{Run=$_; Milliseconds=$result.Headers['X-Response-Time-Ms']; SqlQueries=$result.Headers['X-DB-Queries']}
}
```

Kemudian ubah CACHE_ENABLED=true, recreate backend dengan perintah yang sama, dan ulangi 10 permintaan. Redis tetap berjalan. Bandingkan permintaan pertama (cold) dengan berikutnya (warm), serta baseline tanpa cache. Uji dengan katalog terisi dan beban identik; data kosong bukan benchmark representatif. SQL hit tidak harus nol karena epoch/otorisasi tetap dibaca. Setelah selesai, kembalikan METRICS_ENABLED=false dan recreate backend.

Test otomatis mencakup hit/expiry, namespace pengguna, generasi sesudah perubahan, kegagalan Redis, ownership-before-cache, sesi/role/no-store/Origin, serta kebijakan TanStack, invalidasi, pembatalan dan GC. Test dengan mock bukan bukti performa atau integrasi MySQL/Redis; checklist di atas tetap perlu dijalankan. Tidak ada klaim peningkatan latensi sebelum diukur.

Referensi: [TanStack Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [Redis-py production usage](https://redis.io/docs/latest/develop/clients/redis-py/produsage/).
