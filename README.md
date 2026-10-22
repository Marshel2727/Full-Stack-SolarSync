# SolarSync

**Integrated Clean Energy Ecosystem Platform**

SolarSync adalah aplikasi web untuk membantu pengguna mempelajari energi surya, memperkirakan kebutuhan Pembangkit Listrik Tenaga Surya (PLTS), mengajukan pemasangan, dan melihat data energi dari sistem yang terhubung. Admin mengelola katalog paket, artikel, serta pengajuan melalui aplikasi yang sama.

Proyek ini mengangkat subtema **SDG 7 — Integrated Clean Energy Ecosystem**. Implementasi saat ini mencakup frontend Next.js, API FastAPI, database MySQL, serta Redis untuk cache dan pembatasan percobaan login.

> Database baru tidak berisi akun, katalog, pelanggan, atau data energi bawaan. Buat akun admin setelah migrasi, lalu isi konten melalui halaman admin. Dashboard membutuhkan relasi pelanggan, lokasi, sistem, dan data energi; menjalankan aplikasi saja tidak menghasilkan data monitoring.

## Fitur dan status implementasi

| Fitur | Implementasi saat ini |
| --- | --- |
| Katalog paket PLTS | Daftar/detail publik; admin dapat menambah, mengubah, dan mengarsipkan paket. |
| Artikel dan FAQ | Baca konten dari API; admin mengelola artikel melalui UI. Pengelolaan FAQ tersedia melalui API admin. |
| Kalkulator energi surya | Menghitung estimasi kapasitas, produksi, biaya, penghematan, dan dampak emisi di browser. |
| Pengajuan instalasi | Mengirim pengajuan ke database dengan persetujuan pengguna dan nomor tiket. Dapat digunakan oleh tamu maupun pengguna yang login. |
| Lampiran pengajuan | Maksimal satu foto atap JPG/PNG dan satu struk PLN JPG/PNG/PDF, masing-masing 5 MiB. Unduh memerlukan sesi dan izin admin/pemilik tiket. |
| Pengelolaan pengajuan | Admin melihat pengajuan, mengunduh lampiran, dan memperbarui status beserta catatan. |
| Login pelanggan/admin | Pelanggan memakai Google (perlu OAuth Client Google Cloud); admin memakai kata sandi Argon2. Sesi HttpOnly, pemeriksaan role/kepemilikan, dan limiter Redis. Akun lama dihubungkan setelah verifikasi kata sandi lama dan identitas Google. |
| Dashboard dan riwayat energi | Membaca data sistem yang diizinkan dari API. Ringkasan dashboard diperbarui dengan polling saat tab aktif. |
| Cache data | TanStack Query di frontend dan Redis di backend; hak akses tetap diperiksa sebelum data privat dikembalikan. |

Kalkulator menggunakan asumsi tetap dalam kode, bukan tarif atau harga yang diperbarui otomatis. Hasilnya merupakan estimasi awal untuk simulasi, bukan hasil survei teknis atau penawaran pemasangan.

## Teknologi

Konfigurasi login Google dan penghubungan akun lama dijelaskan di [AUTH_PRODUCTION.md](AUTH_PRODUCTION.md#login-pelanggan-melalui-google). Tanpa kredensial Google, login pelanggan dinonaktifkan dengan pesan yang jelas; login admin tetap tersedia di `/login?mode=admin`.

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, Node.js 24, TypeScript, Tailwind CSS |
| Data dan visualisasi frontend | TanStack Query 5, Chart.js, React Chart.js 2, Lucide React |
| Backend | Python 3.12 pada Docker, FastAPI, Pydantic Settings, Uvicorn |
| Database dan migrasi | MySQL 8.4, SQLAlchemy 2, PyMySQL, Alembic |
| Cache dan pembatasan login | Dua instance Redis 7.4 dengan fungsi terpisah |
| Pengujian | Python unittest, Vitest, ESLint, TypeScript, dan Playwright; workflow GitHub Actions |
| Lingkungan lokal | Docker Compose 2.24.4+ |

Versi dependency tersedia di [`frontend/package.json`](frontend/package.json), [`frontend/package-lock.json`](frontend/package-lock.json), [`backend/requirements.txt`](backend/requirements.txt), dan constraint [`backend/requirements.lock`](backend/requirements.lock).

Operasi lokal, konfigurasi HTTPS produksi, backup SQL/upload, serta pemulihan ke lingkungan terisolasi dijelaskan di [DOCKER.md](DOCKER.md). Konfigurasi produksi terpisah menjaga `.env` lokal tetap dapat digunakan.

Untuk **backend di VPS Ubuntu dan frontend di Vercel**, gunakan [panduan VPS + Vercel](DEPLOY_VPS_VERCEL.md). Susunan tersebut memakai proxy API pada domain frontend agar cookie sesi dan login Google tetap sesuai.

## Struktur proyek

```text
.
├── backend/
│   ├── app/
│   │   ├── model/             # Model SQLAlchemy dan skema validasi
│   │   ├── routes/            # Endpoint HTTP
│   │   ├── service/           # Logika aplikasi dan pemeriksaan akses
│   │   ├── utils/             # Konfigurasi, database, sesi, cache, upload
│   │   ├── create_user.py     # CLI pembuatan akun
│   │   └── main.py            # Aplikasi FastAPI
│   ├── alembic/               # Migrasi skema database
│   ├── tests/                 # Tes backend
│   └── .env.example           # Contoh konfigurasi backend tanpa Docker
├── frontend/
│   ├── public/                # Aset publik
│   ├── src/
│   │   ├── app/               # Halaman publik, dashboard, dan admin
│   │   ├── components/        # Komponen antarmuka
│   │   ├── context/           # Provider autentikasi dan state aplikasi
│   │   ├── lib/               # Klien API, query, dan kebijakan cache
│   │   ├── types/             # Tipe TypeScript
│   │   └── utils/             # Kalkulator dan formatter
│   └── next.config.mjs        # Proxy /api/v1 dan output standalone
├── .env.example              # Contoh konfigurasi Docker Compose
├── docker-compose.yml
├── AUTH_PRODUCTION.md
├── CACHE_SETUP.md
├── UPLOADS.md
└── README.md
```

Browser mengakses frontend dan `/api/v1` melalui origin yang sama. Next.js meneruskan request API ke FastAPI, lalu backend mengakses MySQL dan Redis melalui jaringan internal Docker.

| Layanan Docker | Fungsi | Akses dari komputer lokal |
| --- | --- | --- |
| `solarsync-frontend` | Aplikasi Next.js dan proxy API | `http://localhost:3000` |
| `solarsync-backend` | FastAPI | `http://localhost:8000` |
| `solarsync-db` | Database MySQL | Tidak membuka port ke host |
| `solarsync-cache` | Cache respons dengan kebijakan `allkeys-lru` | Tidak membuka port ke host |
| `solarsync-auth-store` | Counter login/upload dengan kebijakan `noeviction` | Tidak membuka port ke host |

## Menjalankan secara lokal dengan Docker

Alur ini digunakan untuk instalasi pertama dan pengujian lokal, termasuk penjurian. Tidak perlu memasang Node.js, Python, MySQL, atau Redis secara terpisah di komputer.

### 1. Prasyarat dan clone

Siapkan Git dan Docker Desktop dengan **Linux containers** serta Docker Compose v2. Pastikan Docker Desktop berjalan dan port `3000`/`8000` belum digunakan aplikasi lain. Koneksi internet diperlukan untuk mengunduh image dan dependency saat build pertama.

Perintah berikut menggunakan PowerShell. Jalankan dari folder tempat Anda ingin menyimpan proyek:

```powershell
git clone --branch fitur/backend https://github.com/Marshel2727/Full-Stack-SolarSync.git
Set-Location .\Full-Stack-SolarSync
```

Jika proyek sudah tersedia, langsung masuk ke folder proyek tersebut tanpa clone ulang.

### 2. Konfigurasi environment

Buat `.env` dari contoh hanya jika file tersebut belum ada:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Ganti `MYSQL_PASSWORD` dan `MYSQL_ROOT_PASSWORD` dengan dua password kuat yang berbeda. Pertahankan pengaturan berikut untuk HTTP lokal:

```dotenv
MYSQL_PASSWORD='GANTI_PASSWORD_APLIKASI'
MYSQL_ROOT_PASSWORD='GANTI_PASSWORD_ROOT'
APP_ENVIRONMENT=development
COOKIE_SECURE=false
CORS_ORIGINS='["http://localhost:3000","http://127.0.0.1:3000"]'
CACHE_ENABLED=true
METRICS_ENABLED=false
NEXT_PUBLIC_ENABLE_ROLE_DEMO=false
```

Docker Compose membaca `.env` di **root proyek**, bukan `backend/.env`. Host database, URL kedua Redis, dan lokasi upload container sudah diatur melalui Compose. Jangan mengunggah `.env` atau password asli ke Git.

### 3. Build dan siapkan database

Jalankan setiap perintah secara berurutan. Lanjutkan setelah perintah sebelumnya berhasil:

```powershell
docker compose config --quiet
docker compose build
docker compose up -d --wait solarsync-db solarsync-cache solarsync-auth-store
docker compose run --rm solarsync-backend python -m alembic upgrade head
docker compose run --rm solarsync-backend python -m alembic current
```

Revisi yang diharapkan adalah `0002_cache_epochs`. Migrasi dijalankan secara eksplisit; server tidak membuat tabel otomatis saat mulai. Untuk database lama, cadangkan data sebelum menerapkan migrasi.

Dockerfile frontend memakai `npm ci` dan lockfile yang disertakan. Instalasi npm terpisah di Windows tidak diperlukan untuk alur Docker ini.

### 4. Buat akun admin

```powershell
docker compose run --rm solarsync-backend python -m app.create_user
```

Isi email, nama, role `admin`, dan password sepanjang **15–1024 karakter**, lalu ulangi password. Password diketik secara tersembunyi. Pesan keberhasilan admin mengarahkan ke halaman masuk admin.

Tidak ada email/password admin bawaan. CLI menolak email yang sudah terdaftar dan tidak menimpa akun tersebut.

### 5. Jalankan aplikasi

```powershell
docker compose up -d --wait
docker compose ps
```

| Halaman/endpoint | Alamat |
| --- | --- |
| Beranda | <http://localhost:3000> |
| Login | <http://localhost:3000/login> |
| Admin | <http://localhost:3000/admin> |
| Dashboard customer | <http://localhost:3000/dashboard> |
| Dokumentasi API / Swagger | <http://localhost:8000/docs> |
| Health proses | <http://localhost:8000/health> |
| Kesiapan database dan migrasi | <http://localhost:8000/health/ready> |

`/health` hanya menunjukkan proses API berjalan. `/health/ready` memeriksa koneksi database dan revisi migrasi; respons `503` berarti database/skema belum siap. Endpoint ini tidak memeriksa seluruh layanan Redis atau alur bisnis.

### 6. Alur mencoba aplikasi

1. Login menggunakan akun admin yang dibuat melalui CLI.
2. Tambahkan paket PLTS melalui `/admin/products` dan artikel melalui `/admin/articles`. Artikel harus dipublikasikan agar muncul di halaman publik.
3. Buka katalog, artikel, dan kalkulator melalui halaman publik.
4. Kirim pengajuan melalui `/installation-request`, isi data dan persetujuan, lalu simpan nomor tiket. Lampiran bersifat opsional.
5. Buka `/admin/requests`, periksa pengajuan, unduh lampiran jika ada, dan ubah status beserta catatan.
6. Untuk mencoba customer, buat akun dengan CLI yang sama dan role `customer`. Akses sistem membutuhkan relasi `customers.user_id`, lokasi (`sites`), serta sistem (`solar_systems`) yang disiapkan melalui administrasi database. UI provisioning untuk relasi tersebut belum tersedia; rujuk [skema database](backend/SCHEMA.md).

Pengajuan tamu tidak otomatis terhubung ke akun yang dibuat kemudian walaupun emailnya sama. Monitoring hanya menampilkan data yang sudah tersedia di database; jika belum ada data, tampilan kosong merupakan kondisi yang diharapkan.

## Pengembangan frontend di Windows

Untuk mengubah frontend dengan hot reload, gunakan Node.js 24 dan layanan backend/database/Redis dari instalasi Docker di atas. Dari root proyek, hentikan frontend Docker agar port `3000` tersedia:

```powershell
docker compose stop solarsync-frontend
Set-Location .\frontend
npm.cmd ci
npm.cmd run dev
```

Buka <http://localhost:3000>. Konfigurasi Next.js lokal meneruskan `/api/v1` ke `http://127.0.0.1:8000` secara default. Gunakan origin yang tercantum dalam `CORS_ORIGINS`; request tulis, termasuk login/logout, memerlukan header `Origin` yang diizinkan.

Untuk kembali ke frontend Docker, hentikan dev server dengan `Ctrl+C`, lalu dari root proyek jalankan `docker compose up -d solarsync-frontend`. Panduan alternatif backend Python lokal tersedia di [`backend/README.md`](backend/README.md); siapkan juga kedua Redis sesuai [`AUTH_PRODUCTION.md`](AUTH_PRODUCTION.md).

## Pengujian

Tes backend dari root proyek, setelah image selesai dibangun:

```powershell
docker compose run --rm --no-deps -e APP_ENVIRONMENT=test -e COOKIE_SECURE=false solarsync-backend python -m unittest discover -s tests -v
```

Tes frontend dan pemeriksaan TypeScript dari folder `frontend`, dengan Node.js 24:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Tes backend menggunakan mock untuk sebagian kontrak auth/cache/database. Kelulusan unit test tidak menggantikan pengujian MySQL/Redis nyata, browser, upload/unduh, atau perangkat fisik. Daftar perintah ini adalah panduan menjalankan pemeriksaan, bukan klaim bahwa semuanya sudah lulus di lingkungan Anda.

## Operasional lokal dan penyimpanan data

Semua perintah Compose berikut dijalankan dari root proyek:

```powershell
# Melihat status dan log
docker compose ps
docker compose logs --tail=100 solarsync-backend solarsync-db solarsync-auth-store

# Menghentikan layanan tanpa menghapus volume
docker compose down

# Menjalankan kembali instalasi yang sudah selesai
docker compose up -d --wait
```

Setelah mengubah kode, build ulang, terapkan migrasi jika ada, dan jalankan kembali:

```powershell
docker compose build
docker compose run --rm solarsync-backend python -m alembic upgrade head
docker compose up -d --wait
```

Compose menyimpan database pada `solarsync_mysql_data`, lampiran pada `solarsync_uploads`, dan counter keamanan pada `solarsync_auth_data`; nama aktual volume menggunakan prefix proyek Compose. Cadangkan database dan lampiran bersama. **Jangan gunakan `docker compose down -v` untuk restart**, karena perintah itu menghapus volume beserta datanya.

## Pemecahan masalah

| Kondisi | Pemeriksaan |
| --- | --- |
| Compose meminta password database | Pastikan `.env` root berisi `MYSQL_PASSWORD` dan `MYSQL_ROOT_PASSWORD` yang sudah diganti. |
| MySQL menolak kredensial setelah `.env` diubah | Password pada volume yang sudah diinisialisasi tidak otomatis berubah. Cocokkan konfigurasi dengan akun database; jangan menghapus volume untuk memperbaikinya. |
| Backend tidak sehat atau readiness `503` | Periksa log MySQL/backend, jalankan migrasi, lalu cek `alembic current`. Jangan memakai `stamp` untuk melewati migrasi yang gagal. |
| Login mengembalikan `503` | Periksa backend, database, dan `solarsync-auth-store`. Login baru ditolak ketika pembatas keamanan tidak tersedia. |
| Login mengembalikan `429` | Tunggu durasi `Retry-After`; jangan menghapus data Redis sebagai cara melewati pembatas. |
| Login/request tulis ditolak karena origin | Gunakan alamat frontend yang sesuai `CORS_ORIGINS`. Untuk mencoba mutasi via klien API, kirim `Origin: http://localhost:3000`; Swagger di port `8000` bukan origin frontend. |
| Katalog/dashboard kosong | Isi katalog melalui admin; hubungkan customer ke sistem dan sediakan data energi. Tidak ada seed otomatis. |
| Upload ditolak | Periksa persetujuan, format, dan ukuran maksimal 5 MiB per file. Foto atap hanya JPG/PNG; struk PLN juga menerima PDF. |
| `npm ci` melaporkan lockfile tidak sesuai | Jika dependency memang sengaja diubah, jalankan `npm.cmd install` di `frontend`, tinjau dan commit lockfile bersama `package.json`, lalu ulangi build. |

## Batasan dan deployment

Fitur berikut belum tersedia secara lengkap: provisioning lokasi/sistem/perangkat melalui UI, penerimaan telemetri dari perangkat/worker, agregasi energi otomatis, penjadwalan teknisi, penawaran, perubahan profil, notifikasi, undangan akun, dan reset password melalui email. Endpoint admin dapat mengimpor agregat energi harian yang sudah dihitung; endpoint tersebut bukan pengolah telemetri otomatis.

Konfigurasi Compose di atas ditujukan untuk HTTP lokal. Deployment publik membutuhkan frontend dan `/api/v1` pada origin HTTPS yang sama, `APP_ENVIRONMENT=production`, `COOKIE_SECURE=true`, origin HTTPS eksplisit, reverse proxy, pembatasan akses layanan internal, serta backup. Ikuti [`AUTH_PRODUCTION.md`](AUTH_PRODUCTION.md) sebelum membuka aplikasi ke internet. Panduan lokal ini tidak membuktikan deployment publik sudah tersedia.

## Dokumentasi lanjutan

- [`backend/SCHEMA.md`](backend/SCHEMA.md): field, relasi, dan aturan skema database.
- [`AUTH_PRODUCTION.md`](AUTH_PRODUCTION.md): konfigurasi sesi, pembatasan login, dan persiapan HTTPS/produksi.
- [`UPLOADS.md`](UPLOADS.md): format lampiran, penyimpanan privat, dan pemeriksaan upload/unduh.
- [`CACHE_SETUP.md`](CACHE_SETUP.md): kontrak API, desain cache, dan invalidasi.
- [`DOCKER.md`](DOCKER.md) dan [`backend/README.md`](backend/README.md): catatan setup fondasi sebelumnya.
- [`frontend/PRD-FRONTEND-SOLARSYNC.md`](frontend/PRD-FRONTEND-SOLARSYNC.md): rancangan kebutuhan produk frontend.
- [`frontend/DESIGN.md`](frontend/DESIGN.md): panduan desain antarmuka.

Beberapa dokumen lama mencatat tahap pengembangan sebelumnya, misalnya tiga layanan Docker atau upload yang belum tersedia. Untuk instalasi awal gunakan urutan pada README ini; detail perilaku tetap mengacu pada kode saat ini. Dokumen rancangan produk menjelaskan target fitur, bukan jaminan seluruh target sudah diimplementasikan.
