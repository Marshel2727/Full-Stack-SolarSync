# SolarSync Backend

FastAPI menyediakan katalog paket, artikel/FAQ, pengajuan beserta lampiran, administrasi, dan data monitoring yang dibatasi kepemilikan. Pelanggan masuk melalui Google; admin memakai kata sandi Argon2 dan sesi HttpOnly. Pembuatan akun CLI tidak menghubungkan pengajuan tamu secara otomatis.

Gunakan [panduan Docker](../DOCKER.md) untuk menjalankan seluruh layanan. Konfigurasi autentikasi dan batasan produksi tersedia di [AUTH_PRODUCTION.md](../AUTH_PRODUCTION.md). Struktur tabel dijelaskan di [SCHEMA.md](SCHEMA.md).

## Instalasi tanpa Docker

Gunakan Python 3.12, MySQL 8.4, Redis cache, dan Redis autentikasi terpisah dengan kebijakan `noeviction`. Jalankan dari folder backend:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -c requirements.lock
```

Salin `.env.example` menjadi `.env` hanya pada instalasi pertama, kemudian isi koneksi layanan dan kredensial Google. Docker membaca `.env` root; instalasi Python langsung membaca `backend/.env`.

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Migrasi dilakukan secara eksplisit. Database baru tidak otomatis berisi akun atau data demo. `python -m app.create_user` membuat akun operator dengan password 15–1024 karakter; gunakan role `admin` untuk pengelola.

## Pemeriksaan

```powershell
python -m unittest discover -s tests -v
python -m pip check
```

`/health` memeriksa proses API. `/health/ready` memeriksa koneksi MySQL, versi migrasi, serta Redis autentikasi dan kebijakan `noeviction`. Gangguan cache data biasa tidak mematikan kesiapan login.

`requirements.txt` mengunci dependency langsung dan `requirements.lock` mengunci dependency turunannya berdasarkan lingkungan Docker Python 3.12 Linux. Saat memperbarui dependency, regenerasi keduanya pada lingkungan bersih dan jalankan tes sebelum mengganti image. File constraint memakai penanda platform untuk `uvloop`, yang tidak tersedia pada Windows.

Provisioning perangkat, worker telemetri, penjadwalan teknisi, perubahan profil, dan pengiriman email belum tersedia lengkap. Daftar batasan terkini ada di README root; utilitas backup merupakan pemeliharaan infrastruktur, bukan fitur pelanggan.
