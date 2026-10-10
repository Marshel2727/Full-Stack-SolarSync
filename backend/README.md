# SolarSync Backend — fondasi database

**Pembaruan:** API/cache dan sesi server sudah ditambahkan. Ikuti [CACHE_SETUP.md](../CACHE_SETUP.md) untuk kontrak, batasan, test dan migrasi 0002. Bagian fondasi awal di bawah dipertahankan sebagai riwayat; pernyataan belum ada API hanya berlaku sebelum pembaruan ini.

Untuk menjalankan melalui Docker tanpa instalasi Python/MySQL lokal, ikuti [panduan Docker](../DOCKER.md). Langkah di bawah adalah alternatif instalasi langsung di Windows; tidak perlu menjalankan kedua alur.

Kode ini menambahkan **33 model tabel SQLAlchemy**, migrasi awal Alembic untuk **MySQL 8.4**, konfigurasi koneksi, serta FastAPI dengan endpoint health.

**Belum termasuk endpoint bisnis CRUD/auth, worker telemetri/notifikasi, seed data, maupun integrasi frontend.** Frontend tetap memakai mock/localStorage sampai API fitur dibuat. Menjalankan server ini tidak otomatis membuat tabel atau mengubah database.

Rincian field dan aturan integrasi: [SCHEMA.md](SCHEMA.md).

## Jalankan sendiri di PowerShell

Dari folder proyek:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL\backend'
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Perintah Copy-Item hanya untuk setup pertama; jangan menimpa .env yang sudah Anda isi.
Isi DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD di .env. Tidak perlu URL-encode password. Python 3.11+ disarankan.

## Siapkan database MySQL

Masuk ke MySQL sebagai administrator menggunakan klien Anda, lalu jalankan SQL ini. Ganti password contoh sebelum dijalankan:

```sql
CREATE DATABASE IF NOT EXISTS solarsync
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'solarsync_app'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_ANDA';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES
  ON solarsync.* TO 'solarsync_app'@'localhost';
```

Jika database/user sudah ada, gunakan yang sesuai tanpa mengulang CREATE USER. Untuk MySQL remote/container, host akun harus mengikuti alamat koneksi backend, bukan otomatis localhost. Privilege DDL dibutuhkan akun migrasi; akun runtime produksi dapat dibatasi menjadi SELECT/INSERT/UPDATE/DELETE setelah migrasi.

## Periksa dan terapkan migrasi

Semua perintah berikut dijalankan dari folder backend:

```powershell
.\.venv\Scripts\python.exe -m compileall app alembic
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m alembic upgrade head --sql
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -m alembic check
```

`--sql` mencetak DDL tanpa menghubungi atau mengubah database. `upgrade head` membuat 33 tabel bisnis dan tabel alembic_version. Migrasi ditujukan untuk database kosong khusus SolarSync; bila tabel nama sama sudah ada, cocokkan skema terlebih dahulu. DDL MySQL tidak sepenuhnya transactional, jadi kegagalan di tengah migrasi dapat meninggalkan sebagian tabel; jangan memakai stamp untuk menyamarkan migrasi gagal.

## Jalankan server

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Swagger: http://127.0.0.1:8000/docs
- Proses hidup: GET /health
- Koneksi dan revisi database: GET /health/ready

Readiness mengembalikan 503 bila database belum siap atau revisi awal belum terpasang. Kredensial database tidak ditampilkan dalam respons error. CORS_ORIGINS berisi array JSON origin frontend yang Anda pakai.

## Status verifikasi

Dependency, test, migrasi, dan server **belum dijalankan oleh asisten**, sesuai permintaan agar eksekusi terminal dilakukan sendiri oleh pengguna. Test yang tersedia memeriksa kompilasi DDL MySQL dan kesesuaian struktur model/migrasi secara offline; pemeriksaan MySQL nyata tetap memerlukan perintah migrasi di atas.

## Batas migrasi

Migrasi awal menyimpan definisi DDL mandiri, bukan mengimpor model yang dapat berubah. Untuk perubahan berikutnya buat revision baru. Fungsi downgrade disediakan untuk kebutuhan migrasi, tetapi menghapus seluruh tabel/data yang dibuat revision ini; jangan digunakan untuk restart server.
