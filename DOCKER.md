# Menjalankan SolarSync dengan Docker (lokal)

**Pembaruan API/cache:** untuk versi kode terbaru, ikuti [CACHE_SETUP.md](CACHE_SETUP.md) terlebih dahulu. Ada dependency frontend baru, Redis, login server, dan migrasi 0002. Panduan lama di bawah menjelaskan fondasi awal dan tidak lagi menggambarkan status integrasi terbaru.

Prasyarat: Docker Desktop sudah berjalan dalam mode Linux containers, dengan Docker Compose v2. Tidak perlu memasang Python, Node.js, atau MySQL di Windows untuk alur ini.

Tiga service: `solarsync-db` (MySQL 8.4), `solarsync-backend` (FastAPI), dan `solarsync-frontend` (frontend yang sudah ada). Database tidak membuka port ke Windows; backend mengakses host `solarsync-db:3306`. Data tersimpan di named volume `solarsync_mysql_data` (dengan prefix proyek dari Compose).

## 1. Konfigurasi pertama — PowerShell

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Pastikan tiga variabel berikut ada. Jika `.env` sebelumnya sudah ada, tambahkan dua variabel MySQL tanpa menghapus pengaturan lain. Ganti kedua password contoh dengan password kuat yang berbeda, lalu simpan:

```dotenv
NEXT_PUBLIC_ENABLE_ROLE_DEMO=false
MYSQL_PASSWORD='GANTI_PASSWORD_APLIKASI'
MYSQL_ROOT_PASSWORD='GANTI_PASSWORD_ROOT'
```

Compose menggunakan `.env` di root proyek, bukan `backend/.env`. File rahasia tidak dimasukkan ke image backend dan diabaikan Git. Jangan membagikan output konfigurasi lengkap yang berisi password. Konfigurasi ini untuk pengembangan lokal, bukan hardening produksi.

## 2. Validasi konfigurasi dan build

Jalankan setiap langkah berurutan; berhenti jika ada error.

```powershell
docker compose config --quiet
```

```powershell
docker compose build
```

## 3. Pengujian offline dalam container

```powershell
docker compose run --rm --no-deps solarsync-backend python -m unittest discover -s tests -v
```

Lanjut setelah hasil `OK`. Test ini tidak menghubungi database.

## 4. Jalankan database dan migrasi

```powershell
docker compose up -d --wait solarsync-db
```

MySQL membuat database dan akun aplikasi saat volume pertama kali diinisialisasi; tidak perlu menjalankan CREATE USER manual. Mengubah password `.env` setelah inisialisasi tidak otomatis mengganti password akun dalam database. Jangan menghapus volume untuk mengatasi masalah kredensial.

Terapkan migrasi pada database baru khusus SolarSync:

```powershell
docker compose run --rm solarsync-backend python -m alembic upgrade head
```

Setelah berhasil:

```powershell
docker compose run --rm solarsync-backend python -m alembic current
docker compose run --rm solarsync-backend python -m alembic check
```

Migrasi membuat 33 tabel aplikasi dan tabel Alembic. Migrasi tidak dijalankan otomatis saat server mulai. Jika migrasi gagal, berhenti dan periksa error; DDL MySQL dapat meninggalkan perubahan parsial. Jangan menjalankan `stamp` untuk melewati kegagalan.

## 5. Jalankan seluruh aplikasi

```powershell
docker compose up -d --wait
docker compose ps
```

- Frontend: http://localhost:3000
- Swagger backend: http://localhost:8000/docs
- Kesiapan database: http://localhost:8000/health/ready

Backend menggunakan readiness sebagai healthcheck, sehingga belum sehat jika migrasi belum terpasang. Frontend masih menggunakan mock/localStorage; Docker tidak otomatis mengintegrasikan API bisnis yang belum dibuat.

## Log dan berhenti

```powershell
docker compose logs --tail=100 solarsync-backend solarsync-db
```

Hentikan container tanpa menghapus data:

```powershell
docker compose down
```

Jangan tambahkan `-v` karena akan menghapus volume beserta database. Volume bukan pengganti backup.

Untuk menjalankan ulang setelah setup berhasil:

```powershell
docker compose up -d --wait
```

Jika kode berubah, build ulang dengan `docker compose build`, terapkan migrasi baru bila ada, kemudian jalankan kembali. Tidak ada bind mount source code atau auto-reload pada konfigurasi ini. Port 3000/8000 harus tersedia.

## Status verifikasi

Konfigurasi disiapkan melalui edit file; build, pengujian, migrasi, dan startup Docker belum dijalankan oleh asisten sesuai permintaan pengguna.
