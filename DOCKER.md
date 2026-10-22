# Menjalankan dan memelihara SolarSync

Untuk frontend Vercel dan backend VPS, ikuti [DEPLOY_VPS_VERCEL.md](DEPLOY_VPS_VERCEL.md). Bagian produksi HTTPS di bawah menggunakan alternatif frontend dan backend bersama pada VPS.

## Lokal

Gunakan Docker Desktop dengan Linux containers dan Docker Compose 2.24.4 atau lebih baru. Jalankan perintah dari root proyek. Pada instalasi pertama, salin `.env.example` ke `.env`, lalu ganti kedua password database. Jangan menimpa `.env` yang sudah dipakai.

```powershell
docker compose config --quiet
docker compose build solarsync-backend solarsync-frontend
docker compose up -d --wait solarsync-db solarsync-cache solarsync-auth-store
docker compose run --rm --no-deps solarsync-backend python -m alembic upgrade head
docker compose up -d --wait solarsync-backend solarsync-frontend
```

Frontend tersedia di `http://localhost:3000`. Backend lokal hanya dibind ke `127.0.0.1:8000`; database dan Redis tidak dipublikasikan. Frontend memakai Node.js 24, Next.js 16, dan React 19. Backend memakai Python 3.12 serta dependency terkunci.

Buat akun admin secara interaktif:

```powershell
docker compose exec solarsync-backend python -m app.create_user
```

Isi role `admin` dan password 15–1024 karakter. Password tidak tampil saat diketik. Admin masuk melalui `/login?mode=admin`; pelanggan memakai Google yang dikonfigurasi sesuai [AUTH_PRODUCTION.md](AUTH_PRODUCTION.md).

## Memeriksa layanan

```powershell
docker compose ps
docker compose logs --tail=100 solarsync-backend solarsync-frontend
docker compose run --rm --no-deps solarsync-backend python -m unittest discover -s tests -v
```

Semua container mempunyai healthcheck dan log berotasi maksimal tiga berkas berukuran 10 MB per container. Backend baru siap setelah skema database dan Redis autentikasi siap. Frontend menunggu backend sehat saat startup.

Saat kode berubah, build ulang image terkait dan jalankan `up -d --wait`; lakukan `alembic upgrade head` jika ada migrasi baru. Perubahan `.env` diterapkan dengan `up`, bukan hanya `restart`.

## Backup yang konsisten

Skrip PowerShell berikut menyimpan SQL database, seluruh upload, dan manifest checksum SHA-256 dalam folder baru yang diabaikan Git. Backend dihentikan sebentar agar SQL dan file berasal dari keadaan yang konsisten, lalu otomatis dinyalakan kembali. Lakukan saat trafik rendah. Jangan menjalankan migrasi atau proses tulis lain selama backup.

```powershell
./ops/backup.ps1
```

Tujuan khusus dapat diberikan dengan `-Destination ./backups/nama-baru`. Untuk konfigurasi produksi, gunakan `-EnvFile .env.production -Production`. Backup berisi data privat dan sesi yang telah di-hash; simpan pada media privat, terenkripsi, dan terpisah dari server. `.env` serta Client Secret Google tidak disertakan. Volume Docker sendiri bukan backup.

## Uji pemulihan tanpa menimpa data utama

Ganti path berikut dengan folder backup yang dihasilkan:

```powershell
./ops/restore.ps1 -BackupPath ./backups/nama-backup
```

Skrip memverifikasi checksum, membuat project Docker baru berawalan `solarsync-restore-`, mengimpor SQL, memulihkan upload ke volume kosong, menjalankan migrasi, lalu memeriksa kesiapan layanan dan jumlah data. Target yang sudah memiliki container/volume ditolak. Path keluar direktori dan symlink dalam arsip ditolak. Project utama tidak disentuh.

Container/volume pemulihan dipertahankan untuk pemeriksaan. Skrip mencetak perintah penghapusan yang hanya menunjuk project uji tersebut. Jangan menghapus volume project utama. Untuk pemulihan bencana, periksa hasil project pemulihan sebelum mengarahkan aplikasi ke data yang telah dipulihkan.

## Produksi dengan HTTPS

Salin `.env.production.example` menjadi `.env.production` dan isi `PUBLIC_DOMAIN`, password database, OAuth client produksi, serta path sertifikat TLS dan private key yang valid. `PUBLIC_DOMAIN` hanya hostname, tanpa `https://`, port atau path. Sertifikat diterbitkan dan diperpanjang oleh pengelola/layanan hosting; repo tidak mengurus penerbitan sertifikat otomatis. Daftarkan callback `https://DOMAIN/api/v1/auth/google/callback` di Google Cloud.

```powershell
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml build
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml up -d --wait solarsync-db solarsync-cache solarsync-auth-store
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml run --rm --no-deps solarsync-backend python -m alembic upgrade head
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml up -d --wait
```

Overlay produksi menutup port langsung frontend/backend. Nginx menjadi satu-satunya pintu publik pada 80/443, mengalihkan HTTP ke HTTPS, membatasi ukuran request, dan menerapkan limiter login per alamat IP. Header alamat IP dari pemanggil ditimpa. Pengaturan ini mengasumsikan Nginx menerima trafik publik langsung; bila ada CDN/load balancer, atur daftar proxy tepercaya dan penanganan IP aslinya sebelum mengaktifkan trafik.

Sesi memakai cookie Secure/HttpOnly, origin HTTPS eksplisit, dan Google Client Secret hanya pada backend. Log Nginx menghilangkan query string agar kode OAuth tidak tercatat. Perubahan file sertifikat memerlukan reload Nginx. Domain/DNS, firewall server, sertifikat publik, dan kredensial server harus disiapkan sesuai hosting; konfigurasi lokal yang berhasil belum membuktikan deployment publik.

## Tes otomatis

Workflow `.github/workflows/quality.yml` memeriksa lint, tipe TypeScript, tes unit, build Docker, migrasi, alur browser, serta backup/pemulihan terisolasi. Workflow menggunakan kredensial dan akun uji sementara, tanpa Google Client Secret asli.

Untuk menjalankan tes frontend sendiri, gunakan Node.js 24 dari folder `frontend`:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

Tes browser membutuhkan stack Docker lokal yang sudah berjalan dan image backend terkini. Akun dan pengajuan uji dibuat serta dibersihkan berdasarkan ID/email khusus tes; kode fixture menolak environment produksi. Selesaikan tes sebelum backup agar snapshot tidak menyertakan akun uji. Jika proses tes terputus, jalankan `npm run test:e2e:cleanup` sebelum mengulang. Login Google eksternal tidak diotomatisasi; pengujian token Google ada pada tes backend, dan satu login manusia tetap diperlukan saat menyiapkan OAuth client/domain baru.
