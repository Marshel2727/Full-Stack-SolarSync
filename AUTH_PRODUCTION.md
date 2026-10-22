# Penguatan login SolarSync

Untuk frontend Vercel dan backend VPS, ikuti [panduan deployment terpisah](DEPLOY_VPS_VERCEL.md). Callback Google tetap pada domain frontend melalui rewrite `/api/v1`; gunakan overlay `docker-compose.vps.yml`, bukan overlay fullstack.

Login pelanggan memakai Google melalui alur server OpenID Connect. Login kata sandi hanya untuk admin. Pengaktifan Google memerlukan kredensial Google Cloud milik pengelola. Pengujian otomatis memakai identitas uji; validasi login Google manusia dilakukan terpisah untuk OAuth client/domain yang digunakan. Migrasi `0003_google_identity` menambahkan kolom opsional `users.google_subject` tanpa mengubah ID akun atau kepemilikan pengajuan.

## Login pelanggan melalui Google

1. Buka [Google Cloud Console](https://console.cloud.google.com/auth/clients), pilih atau buat proyek, lalu isi branding dan audience aplikasi. Buat OAuth client dengan jenis **Web application**. Jika audience masih Testing, tambahkan alamat Google penguji sesuai konfigurasi audience.
2. Untuk lokal, daftarkan authorized redirect URI persis `http://localhost:3000/api/v1/auth/google/callback`. Gunakan `http://localhost:3000` saat membuka aplikasi. Alur ini memakai redirect server dan tidak memerlukan JavaScript OAuth di browser.
3. Isi konfigurasi berikut di `.env` **root proyek**. Jangan mengirim Client Secret ke chat, memasukkannya ke Git, atau menambahkan prefix `NEXT_PUBLIC_`.

```dotenv
GOOGLE_CLIENT_ID=CLIENT_ID_DARI_GOOGLE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET='CLIENT_SECRET_DARI_GOOGLE'
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
```

4. Dari root proyek, jalankan satu per satu:

```powershell
docker compose build solarsync-backend solarsync-frontend
docker compose run --rm --no-deps solarsync-backend python -m alembic upgrade head
docker compose up -d --no-deps --wait solarsync-backend solarsync-frontend
```

Setelah kredensial diubah, cukup jalankan perintah `up` untuk membuat ulang backend dengan environment baru; frontend mengambil status dari API saat runtime. Jangan menimpa `.env` dari file contoh bila sudah berisi password database.

Pelanggan baru otomatis mendapat role `customer` setelah Google diverifikasi. Google hanya diminta scope `openid email profile`, tanpa akses kotak masuk Gmail. Akun Gmail dan Google Workspace dengan email terverifikasi didukung. Identitas diikat ke `sub` Google yang stabil. Admin tidak pernah dibuat atau diberi akses melalui Google.

Pengguna lama memilih **Hubungkan akun lama**, membuktikan kata sandi SolarSync, lalu memilih Google dengan email sama. Bukti ini berlaku sepuluh menit dan satu kali pakai. Proses mempertahankan ID user dan data pengajuannya, serta mencabut sesi lama. Bila email sama tetapi belum ada bukti akun lama, sistem menolak penggabungan otomatis. Akun nonaktif, konflik identitas, atau perubahan password saat proses berlangsung ditolak. Pengajuan tamu tetap memerlukan verifikasi admin; login Google tidak mengambil alih pengajuan berdasarkan email.

Login memakai state terikat cookie HttpOnly, TTL sepuluh menit, konsumsi atomik Redis, nonce, dan PKCE S256. Backend memverifikasi tanda tangan, issuer, audience, expiry, nonce dan email Google melalui pustaka `google-auth`. Token akses Google dan Client Secret tidak dikirim ke frontend atau disimpan sebagai sesi. Sesi aplikasi tetap berupa token acak dengan hanya hash di database.

Untuk produksi, daftarkan callback domain HTTPS yang sebenarnya, sesuaikan `GOOGLE_REDIRECT_URI` dan `CORS_ORIGINS`, serta aktifkan `COOKIE_SECURE=true`. Origin callback harus sama dengan frontend. Cookie sementara OAuth memakai `SameSite=Lax` agar callback navigasi Google bekerja; cookie sesi utama tetap `SameSite=Strict`. Jangan log query string callback pada reverse proxy/APM karena berisi kode OAuth; access log Uvicorn aplikasi sudah menyembunyikannya. Uji satu login Google sungguhan setelah konfigurasi tersedia.

Rujukan: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect) dan [verifikasi ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Mekanisme yang diterapkan

- Password diverifikasi dengan Argon2 melalui pwdlib, termasuk peningkatan hash saat login berhasil. Akun baru via CLI memerlukan passphrase 15–1024 karakter. Password akun lama tidak otomatis diubah. Error untuk password salah, akun tidak ditemukan, dan akun nonaktif sama; error validasi tidak mengembalikan input password.
- Token sesi acak baru diterbitkan setelah transaksi login berhasil. Database hanya menyimpan hash token. Sesi sebelumnya pada browser tersebut dicabut; sesi perangkat lain tidak otomatis dicabut. Pemeriksaan ulang akun di bawah row lock mencegah login memakai state akun yang baru saja dinonaktifkan/diubah passwordnya.
- Default: sesi maksimal 8 jam, idle API 30 menit; waktu aktivitas dicatat paling sering sekali per menit. Idle diukur dari request API terautentikasi, bukan gerakan mouse. Polling dashboard yang aktif termasuk aktivitas. Batas absolut tidak diperpanjang. Pemeriksaan role/akun aktif tetap melalui MySQL, bukan Redis atau cache frontend.
- `COOKIE_SECURE=true` memakai cookie `__Host-solarsync_session`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, tanpa `Domain`. Cookie development lama tidak diterima sebagai fallback; perpindahan ke mode aman mengharuskan login kembali. Jangan kembali ke mode insecure pada domain production.
- Semua operasi tulis API tetap memerlukan `Origin` yang tepat dalam allowlist, termasuk login/logout (perlindungan CSRF). CORS bukan autentikasi. Respons autentikasi, termasuk error, memakai `Cache-Control: no-store`.
- Limiter atomik Redis bersama: default 10 percobaan per akun/15 menit, ditambah 120 percobaan global/menit sebelum query user/verifikasi hash. Email dan nomor HP milik akun sama berbagi kuota. Percobaan sukses ikut dihitung; penolakan tidak memperpanjang masa tunggu. HTTP 429 menyertakan `Retry-After`. Angka awal perlu disesuaikan dengan beban nyata, bukan dianggap hasil benchmark.
- `solarsync-auth-store` terpisah dari cache: 32 MB, `noeviction`, AOF dengan fsync setiap detik, volume tersendiri, tanpa port publik. Counter tidak dibuang ketika cache katalog penuh. Redis penuh/gagal membuat login baru mengembalikan 503 (fail closed), bukan melewati limiter. Timeout koneksi/baca masing-masing 500 ms tanpa retry otomatis. Logout dan validasi sesi yang sudah aktif tidak bergantung pada Redis.
- Frontend membuang cache/query akun lama, mengabaikan respons dari generasi sesi sebelumnya, mendukung sinkronisasi tab, menangani `Retry-After`, dan membatasi waktu tunggu request auth. Logout hanya dianggap selesai setelah server mengonfirmasi. Jika jaringan gagal, tampil peringatan dan tombol Keluar bisa dicoba lagi; jangan menganggap sesi telah dicabut. Tidak ada token/password yang disimpan di localStorage.

## 1. Konfigurasi lokal (HTTP localhost)

Tambahkan ke `.env` **root proyek** jika belum ada, tanpa menimpa password database yang sudah dipakai:

```dotenv
APP_ENVIRONMENT=development
COOKIE_SECURE=false
CORS_ORIGINS='["http://localhost:3000","http://127.0.0.1:3000"]'
SESSION_LIFETIME_SECONDS=28800
SESSION_IDLE_SECONDS=1800
LOGIN_ACCOUNT_LIMIT=10
LOGIN_ACCOUNT_WINDOW_SECONDS=900
LOGIN_GLOBAL_LIMIT=120
```

Compose otomatis memasok `AUTH_REDIS_URL=redis://solarsync-auth-store:6379/0`. Bila menjalankan backend di luar Docker, sediakan Redis **terpisah** dengan kebijakan `noeviction` dan atur `AUTH_REDIS_URL` di `backend/.env`; Compose sengaja tidak mempublikasikan port auth-store.

## 2. Syarat production

Sesudah domain dan reverse proxy HTTPS siap, ubah `.env` root (ganti domain contoh dengan domain Anda):

```dotenv
APP_ENVIRONMENT=production
COOKIE_SECURE=true
CORS_ORIGINS='["https://solar.example.com"]'
METRICS_ENABLED=false
NEXT_PUBLIC_ENABLE_ROLE_DEMO=false
```

Backend menolak konfigurasi production dengan cookie insecure, origin HTTP/wildcard/path, atau URL Redis auth yang memakai host/port sama dengan cache. Pemeriksaan URL bukan pengganti verifikasi konfigurasi Redis sesungguhnya: alias DNS dapat menunjuk server sama.

Sebelum dibuka ke publik:

1. Frontend dan `/api/v1` harus melalui **origin HTTPS yang sama**. Pertahankan proxy Next.js ke backend privat; jangan mengubah browser menjadi akses langsung ke port 8000.
2. Gunakan overlay `docker-compose.production.yml` dan panduan [DOCKER.md](DOCKER.md#produksi-dengan-https). Overlay menutup port langsung 3000/8000 dan menyediakan Nginx dengan TLS, redirect HTTPS, HSTS, serta pembatasan hostname. Isi domain, sertifikat valid, dan private key melalui `.env.production`; sertifikat publik dan DNS tetap disiapkan sesuai hosting.
3. Nginx menerapkan rate limit per-IP untuk POST login/pendaftaran/penghubungan Google, body autentikasi maksimum 16 KB, dan batas waktu proxy. Header `X-Forwarded-For` dari pemanggil ditimpa. Pengaturan mengasumsikan Nginx menjadi pintu publik langsung. Jika ada CDN/load balancer tambahan, konfigurasi proxy tepercaya dan IP asli harus disesuaikan agar limiter tidak memperlakukan seluruh pengguna sebagai satu alamat.
4. Lindungi kedua Redis dan MySQL dengan jaringan privat; gunakan ACL/TLS bila layanan tidak berada di jaringan host yang terisolasi. Jangan memakai `allkeys-lru` untuk auth-store dan jangan menghapus volume counter sebagai cara membuka blokir. AOF everysec dapat kehilangan sekitar satu detik counter pada crash mendadak; bukan pertahanan tunggal terhadap serangan.
5. Rotasi kredensial yang pernah dibagikan, pastikan `.env` tidak masuk Git, cadangkan database, dan matikan logging body/cookie/password di proxy/APM. Event kegagalan auth di aplikasi tidak memuat kredensial. Pantau kenaikan 429/503 dan `auth_request_failed`/`auth_rate_limit_unavailable`.
6. Audit versi dependency dan lakukan uji keamanan di staging. MFA admin, reset password lewat kanal terverifikasi, deteksi password bocor, serta UI pencabutan seluruh sesi **belum diimplementasikan**. Untuk akses admin berisiko tinggi, batasi akses melalui VPN/identity gateway dengan MFA sampai MFA aplikasi tersedia. Password yang diubah lewat SQL manual tidak otomatis mencabut sesi lain; prosedur reset kelak harus mencabutnya dalam transaksi yang sama.

## 3. Perintah untuk Anda jalankan

PowerShell dari root proyek. Jangan lanjut ke langkah berikut jika langkah sebelumnya gagal. Image backend memasang `google-auth[requests]`; frontend tidak memerlukan dependency tambahan. Migrasi Google tercantum pada bagian login pelanggan di atas.

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
docker compose config --quiet
docker compose build solarsync-backend solarsync-frontend
docker compose run --rm --no-deps -e APP_ENVIRONMENT=test -e COOKIE_SECURE=false solarsync-backend python -m unittest discover -s tests -v
```

Tes frontend (menggunakan dependency yang sudah diinstal):

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL\frontend'
npm.cmd run test:auth
npm.cmd run test:cache
```

Setelah tes berhasil, terapkan layanan:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
docker compose up -d solarsync-db solarsync-cache solarsync-auth-store solarsync-backend solarsync-frontend
docker compose ps
```

Pastikan `alembic upgrade head` selesai sebelum menyalakan backend versi baru. Jangan menjalankan `docker compose down -v` pada project utama karena perintah tersebut menghapus database dan counter keamanan.

## 4. Pemeriksaan staging untuk setiap deployment

- Login benar/salah, akun nonaktif, tanpa sesi, customer mengakses endpoint admin; pastikan 401/403 yang tepat tanpa respons demo.
- Inspect cookie pada HTTPS: nama `__Host-`, Secure, HttpOnly, SameSite=Strict, Path=/, tanpa Domain; periksa `Cache-Control: no-store` pada 200/401/422/429/500/503. Jangan membagikan nilai token saat mengambil screenshot.
- Login ulang harus mengganti token; token sebelumnya harus ditolak. Logout berhasil harus menghapus cookie dan token yang disalin sebelumnya harus ditolak server. Jika commit DB gagal, tidak boleh muncul penghapusan cookie/sukses palsu.
- Di akun uji, lakukan 11 percobaan dalam 15 menit, termasuk berganti antara email/HP yang terdaftar: harus 429 dan `Retry-After`. Ulangi melalui worker berbeda dan restart backend; kuota harus tetap sama. Uji expiry counter dengan waktu tunggu/TTL pendek khusus staging.
- Matikan **auth-store di staging**, pastikan login 503 dan sesi aktif/logout tetap bekerja; hidupkan kembali. Matikan **cache data**, pastikan login tetap berfungsi. Uji juga auth-store penuh. Tes unit dengan mock tidak membuktikan Redis/Lua multi-worker bekerja di deployment.
- Uji idle dengan menghentikan seluruh request terautentikasi (termasuk polling); setelah batas idle, request berikutnya harus 401. Uji batas absolut secara terpisah meskipun API terus aktif. Entri sesi lama tanpa `last_used_at` menggunakan `created_at` sebagai awal idle.
- Gunakan dua tab, akun A lalu B: cache/data A tidak boleh muncul dalam sesi B. Simulasikan respons API A lambat yang tiba setelah login B, serta 401 lama; keduanya harus diabaikan. Coba browser tanpa BroadcastChannel untuk fallback storage event.
- Putuskan jaringan saat logout: UI harus menyebut logout belum terkonfirmasi, lalu retry ketika koneksi kembali. Coba timeout saat login/pergantian akun; jangan tampilkan data akun lama dengan cookie akun baru.
- Pastikan origin asing atau Origin kosong tidak bisa POST login/logout, IP header palsu tidak melewati pembatas ingress, dan port 3000/8000/Redis tidak dapat diakses publik melewati jalur yang ditentukan.

Workflow `.github/workflows/quality.yml` menjalankan tes unit, build, dan tes browser menggunakan akun sementara. Backend juga menguji signature/issuer/audience/expiry/nonce token Google serta keterikatan browser dan replay state. Hasil pada satu lingkungan tidak menggantikan pemeriksaan HTTPS, OAuth client, DNS, dan konfigurasi hosting deployment yang berbeda. Prosedur backup dan uji pemulihan terisolasi tersedia pada [DOCKER.md](DOCKER.md).

Referensi desain: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [Redis atomic counters](https://redis.io/docs/latest/commands/incr/), [pwdlib verify_and_update](https://frankie567.github.io/pwdlib/reference/pwdlib/).
