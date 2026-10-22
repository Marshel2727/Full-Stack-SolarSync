# Deploy SolarSync: VPS Ubuntu + Vercel

Panduan ini memakai Docker Compose dan **Nginx di host VPS** yang sudah Anda siapkan. Jalankan sendiri langkah berikut. Subdomain dipakai agar website pada domain utama `marshelportfolio.me` tetap berjalan.

Konfigurasi Compose/Nginx, build frontend, serta backup dan impor data sudah diuji secara lokal. DNS, sertifikat publik, dan login Google pada domain produksi perlu diperiksa saat Anda menjalankan deployment; belum ada deployment ke VPS atau Vercel yang dilakukan dari sesi ini.

| Bagian | Alamat |
| --- | --- |
| Frontend Vercel | `https://solarsync.marshelportfolio.me` |
| API melalui Nginx VPS | `https://api-solarsync.marshelportfolio.me` |
| FastAPI pada VPS | `127.0.0.1:18000`, hanya loopback |
| MySQL dan kedua Redis | Jaringan internal Docker, tanpa port publik |

Browser tetap mengirim API ke `/api/v1` pada domain **frontend**. Vercel meneruskannya ke VPS melalui external rewrite. Cookie sesi dan callback Google tetap memakai domain frontend. Jangan mengganti klien browser menjadi fetch langsung ke subdomain API. [Dokumentasi Vercel](https://vercel.com/docs/rewrites).

Gunakan `docker-compose.vps.yml` untuk susunan ini. `docker-compose.production.yml` adalah alternatif frontend dan backend bersama di VPS; **jangan gabungkan kedua overlay tersebut**.

## 1. Source dan DNS

Pastikan perubahan terbaru, termasuk file deployment baru, sudah Anda commit dan push ke repository yang akan dihubungkan ke Vercel. Jangan memasukkan `.env`, `.env.vps`, Client Secret, backup, atau upload privat ke Git. Commit lama akan menghasilkan aplikasi lama.

Tambahkan DNS berikut tanpa mengubah record domain utama atau website lain:

| Record | Jenis | Tujuan |
| --- | --- | --- |
| `api-solarsync` | A | IP publik VPS |
| `solarsync` | Sesuai Vercel | Nilai DNS yang diberikan saat menambahkan domain di Vercel |

Jika memakai Cloudflare, gunakan **DNS only** untuk API saat setup awal. Perbaiki/hapus record AAAA API jika VPS tidak melayani IPv6. Buka port 80 dan 443 pada firewall VPS/provider. Jangan membuka 18000, 3306, atau 6379.

Di Vercel, buat project dari repository yang sama, pilih **Root Directory `frontend`**, lalu tambahkan `solarsync.marshelportfolio.me` pada Settings → Domains. Ikuti nilai DNS yang ditampilkan. Deployment awal dapat menunggu sampai API siap.

## 2. Siapkan backend di VPS

Perintah pada bagian ini dijalankan di terminal **SSH VPS**. Ganti `URL_REPOSITORY_ANDA`. Untuk repo privat, gunakan akses Git yang sudah disiapkan.

```bash
sudo mkdir -p /opt/solarsync
sudo chown "$USER":"$(id -gn)" /opt/solarsync
git clone URL_REPOSITORY_ANDA /opt/solarsync
cd /opt/solarsync
docker compose version
```

Jika sudah ada clone proyek, cukup masuk ke foldernya dan ambil commit terbaru. Jangan clone di atas folder yang berisi data. Gunakan Compose **2.24.4+**. Jika user SSH belum boleh menjalankan Docker, gunakan `sudo docker` pada perintah Docker. Upgrade bila perlu mengikuti [panduan resmi Ubuntu](https://docs.docker.com/engine/install/ubuntu/).

Periksa apakah port 18000 kosong:

```bash
sudo ss -ltnp '( sport = :18000 )'
```

Jika sudah dipakai, pilih port lain, ubah `VPS_API_PORT` dalam `.env.vps` dan semua tujuan `proxy_pass` pada salinan site Nginx. Jangan menghentikan aplikasi lain untuk mengambil portnya.

```bash
cp .env.vps.example .env.vps
chmod 600 .env.vps
nano .env.vps
```

Isi dua password MySQL yang acak, berbeda, dan panjang. Template sudah menetapkan `FRONTEND_ORIGIN=https://solarsync.marshelportfolio.me`. Isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` dari Google Cloud **hanya pada VPS**. Jika keduanya kosong, login pelanggan belum aktif, sementara login admin tetap tersedia.

Password MySQL digunakan saat volume pertama kali dibuat. Mengedit nilainya setelah database berjalan tidak otomatis mengganti password pada volume lama. Jangan menimpa `.env` Windows dengan konfigurasi produksi ini.

Buat fungsi singkat berikut dalam sesi SSH. Saat membuka sesi baru, masuk ke `/opt/solarsync` dan definisikan kembali fungsi tersebut.

```bash
dc() { docker compose -p solarsync-vps --env-file .env.vps -f docker-compose.yml -f docker-compose.vps.yml "$@"; }
dc config --quiet
dc build solarsync-backend
dc up -d --wait solarsync-db solarsync-cache solarsync-auth-store
```

Nama project `solarsync-vps` memisahkan volume/container dari project lain. Frontend Docker berada dalam profile yang tidak aktif dan tidak ikut dinyalakan.

## 3. Pilih data awal

**Pilih satu jalur sebelum menjalankan migrasi.** Data Docker Windows tidak otomatis berpindah ke VPS. Jalur A membawa akun, artikel, katalog, data lain, dan lampiran yang sekarang ada. Jalur B membuat database kosong.

### A. Memindahkan data lokal

Pada **PowerShell Windows**:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
./ops/backup.ps1
```

Catat folder backup yang dicetak. Backend lokal berhenti sebentar lalu otomatis menyala kembali. Ganti `FOLDER_BACKUP`, `USER_VPS`, dan `IP_VPS` untuk mengirim backup:

```powershell
scp -r '.\backups\FOLDER_BACKUP' USER_VPS@IP_VPS:~/solarsync-migration
```

Gunakan tujuan `~/solarsync-migration` yang **belum ada** agar SCP membuatnya dengan tiga berkas backup langsung di dalamnya. Jika sudah ada, pilih nama baru dan sesuaikan perintah berikut. Jangan taruh backup di folder website publik.

Kembali ke **SSH VPS**, dengan database baru yang masih kosong:

```bash
cd /opt/solarsync
chmod -R go-rwx "$HOME/solarsync-migration"
bash ops/restore-vps.sh "$HOME/solarsync-migration"
```

Skrip memeriksa checksum/arsip, menolak database atau folder upload yang sudah berisi data, mengimpor SQL/upload, dan menjalankan migrasi. Backend harus belum berjalan. Jika gagal, skrip berhenti tanpa menghapus data; baca error sebelum mencoba ulang. Jika tabel sudah terlanjur dibuat, siapkan target kosong tersendiri. Jangan menghapus volume yang sedang dipakai.

Akun admin dan password dari lokal ikut terbawa, sehingga admin dengan email yang sama tidak perlu dibuat ulang. Data contoh juga ikut jika ada dalam backup; tinjau kelayakan kontennya sebelum dibagikan publik.

### B. Mulai dari database kosong

Jalankan ini hanya jika **tidak mengimpor backup**:

```bash
dc run --rm --no-deps solarsync-backend python -m alembic upgrade head
```

### Jalankan API

Setelah salah satu jalur selesai:

```bash
dc up -d --wait solarsync-backend
dc ps
curl --fail http://127.0.0.1:18000/health/ready
```

Keempat layanan VPS harus sehat. Pada jalur B, buat admin:

```bash
dc exec solarsync-backend python -m app.create_user
```

Pilih role `admin` dan passphrase 15–1024 karakter. Database kosong tidak mempunyai konten/seed otomatis; isi melalui admin.

## 4. Nginx dan HTTPS API

Pastikan DNS API sudah menunjuk ke VPS. Tambahkan sebagai **site baru**, tanpa mengganti `nginx.conf`, default site, atau site portfolio. Periksa nama file belum dipakai:

```bash
sudo test ! -e /etc/nginx/sites-available/solarsync-api
sudo test ! -e /etc/nginx/sites-enabled/solarsync-api
```

Lanjutkan jika keduanya berhasil. Jika sudah ada, periksa isinya dahulu.

```bash
sudo cp ops/nginx/vps-api.conf /etc/nginx/sites-available/solarsync-api
sudo ln -s /etc/nginx/sites-available/solarsync-api /etc/nginx/sites-enabled/solarsync-api
sudo nginx -t
sudo systemctl reload nginx
```

Template awal memakai HTTP agar Certbot dapat memasang HTTPS. Jika port backend diubah, sesuaikan semua `proxy_pass` sebelum reload. Jangan mencoba login publik sebelum HTTPS aktif.

Dengan Certbot dan plugin Nginx yang terpasang:

```bash
sudo certbot --nginx -d api-solarsync.marshelportfolio.me --redirect
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
curl --fail https://api-solarsync.marshelportfolio.me/health/ready
```

Jika belum terpasang, ikuti [instruksi Certbot untuk Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap). Pastikan timer perpanjangan aktif. Setelah Certbot mengedit site, jangan menyalin ulang template HTTP ke atasnya. Jika Nginx berjalan dalam container, path dan upstream berbeda; panduan host ini perlu disesuaikan.

## 5. Frontend di Vercel

| Pengaturan | Nilai |
| --- | --- |
| Framework | Next.js |
| Root Directory | `frontend` |
| Node.js | `24.x` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Default Next.js, jangan isi `out` |
| Domain utama aplikasi | `solarsync.marshelportfolio.me` |

Tambahkan Environment Variables pada environment **Production**:

```dotenv
BACKEND_INTERNAL_URL=https://api-solarsync.marshelportfolio.me
NEXT_PUBLIC_ENABLE_ROLE_DEMO=false
```

Target API tanpa `/api/v1`. Jangan memasukkan password database, Redis, atau Google Client Secret ke Vercel. Jangan membuat Function/Route Handler tambahan untuk proxy: external rewrite yang ada meneruskan API dan upload. Batas aplikasi tetap 5 MiB per file, maksimal dua file. Uji upload mendekati batas setelah deploy. Vercel juga memiliki [batas request yang diproxy](https://vercel.com/docs/limits); batas Function berlaku jika proxy kelak diubah menjadi Function.

Deploy/redeploy setelah menyimpan env, karena rewrite ditentukan saat build. Build Vercel menolak target API kosong atau bukan HTTPS. Jangan pakai localhost atau hostname Docker. [Perubahan env hanya berlaku pada deployment baru](https://vercel.com/docs/environment-variables).

Gunakan domain frontend utama untuk login. URL preview acak `*.vercel.app` tidak masuk allowlist CORS/OAuth. Jangan menghubungkan environment Preview ke data produksi; gunakan backend staging jika membutuhkan preview dengan API.

Build Preview tanpa `BACKEND_INTERNAL_URL` HTTPS juga akan ditolak. Nonaktifkan deployment Preview yang tidak dipakai atau isi dengan backend staging beserta konfigurasi origin/OAuth staging tersendiri.

## 6. Google login produksi

Di Google Cloud → Google Auth Platform → Clients → OAuth Client aplikasi web, tambahkan origin berikut jika kolom JavaScript origins digunakan:

```text
https://solarsync.marshelportfolio.me
```

Authorized redirect URI harus persis:

```text
https://solarsync.marshelportfolio.me/api/v1/auth/google/callback
```

Callback memakai domain **frontend**, bukan API, dan harus sama dengan `FRONTEND_ORIGIN` pada VPS. Callback localhost boleh tetap terdaftar untuk pengembangan. Untuk akun di luar organisasi, gunakan Audience External; selesaikan branding/audience/publication yang diminta Google sebelum peluncuran publik. Scope aplikasi hanya `openid email profile`, tanpa akses kotak surat Gmail. Uji dengan akun lain sesuai konfigurasi audience. [Ketentuan redirect URI Google](https://developers.google.com/identity/protocols/oauth2/web-server).

Setelah mengisi/mengubah kredensial Google dalam `.env.vps`:

```bash
dc up -d --wait solarsync-backend
```

## 7. Periksa sebelum dibagikan

Pada VPS:

```bash
dc ps
curl --fail https://api-solarsync.marshelportfolio.me/health/ready
curl --fail https://solarsync.marshelportfolio.me/api/v1/auth/google/config
```

Endpoint Google harus menghasilkan `{"enabled":true}` setelah dikonfigurasi. Pada browser, periksa:

1. Katalog dan artikel menampilkan konten dari database VPS.
2. Login Google dari domain utama frontend, muat ulang dashboard, lalu logout. Uji juga akun Google lain yang diizinkan.
3. Login admin di `https://solarsync.marshelportfolio.me/login?mode=admin`; pelanggan tetap ditolak pada halaman/API admin.
4. Pengajuan, upload, dan unduh lampiran sebagai admin/pemilik berjalan, termasuk file mendekati 5 MiB. Gunakan berkas uji tanpa data pribadi.
5. API privat menolak sesi kosong dan port `:18000` tidak bisa diakses dari luar VPS.

Access log API hanya mencatat path tanpa query OAuth. Limiter akun/global tetap memakai Redis. Karena VPS menerima koneksi proxy Vercel bersama, jangan memasang limit IP pengunjung berdasarkan IP koneksi Nginx atau mempercayai `X-Forwarded-For` sembarang. Jika perlu, pasang pembatasan per IP pada ingress Vercel sesuai fasilitas paket Anda.

## 8. Backup dan update

Pada folder proyek VPS:

```bash
bash ops/backup-vps.sh
git pull --ff-only
dc build solarsync-backend
dc stop solarsync-backend
dc run --rm --no-deps solarsync-backend python -m alembic upgrade head
dc up -d --wait solarsync-backend
```

Update memiliki jeda layanan singkat. Frontend deploy mengikuti push branch Production Vercel. Jika migrasi gagal, jangan memulai backend baru sebelum penyebabnya diselesaikan. Kembali ke versi aplikasi yang sesuai skema atau pulihkan backup ke target baru setelah diverifikasi. Jangan menjalankan `down -v` pada project produksi karena menghapus volume database/upload.

Backup Linux menghasilkan SQL, arsip upload, dan checksum yang kompatibel dengan backup Windows. Backend berhenti sebentar lalu otomatis menyala kembali. Simpan salinan terenkripsi di luar VPS dan simpan `.env.vps` terpisah secara privat karena tidak disertakan backup. Uji pemulihan pada target lain yang kosong; `restore-vps.sh` sengaja menolak tujuan berisi data.

## Jika terjadi masalah

| Gejala | Periksa |
| --- | --- |
| Build Vercel menolak API URL | Isi env Production dengan origin HTTPS API, lalu redeploy. |
| API 502 | Kesehatan backend, upstream `127.0.0.1:18000`, DNS, dan sertifikat. |
| `Origin not allowed` | Pakai domain utama frontend; `FRONTEND_ORIGIN` persis sama tanpa slash akhir. |
| `redirect_uri_mismatch` | Callback Google harus domain frontend dengan path lengkap. |
| Google berhasil tetapi sesi hilang | Callback melalui frontend, HTTPS aktif, cookie tidak diubah domain/path oleh proxy, API tidak dicache. |
| Upload 413 | Tidak ada Function proxy tambahan, Nginx body limit 12m, file memenuhi batas aplikasi. |
| Konten kosong | Data lokal belum diimpor; jangan menggantinya dengan seed jika yang diinginkan adalah pemindahan data. |

Untuk memeriksa error tanpa mencetak seluruh env yang berisi rahasia:

```bash
dc logs --tail=100 solarsync-backend
sudo tail -n 50 /var/log/nginx/solarsync-api-error.log
```
