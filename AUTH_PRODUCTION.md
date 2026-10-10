# Penguatan login SolarSync

Perubahan ini hanya kode dan konfigurasi. Dependency, build, tes, migrasi, server, dan deployment **belum dijalankan**. Ini bukan sertifikasi bahwa keseluruhan aplikasi sudah aman untuk production. Tidak ada perubahan tabel atau migrasi baru untuk perubahan login ini; kolom `last_used_at` dan `expires_at` sudah tersedia.

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
2. Pasang TLS, redirect HTTP ke HTTPS, dan HSTS pada reverse proxy setelah HTTPS teruji. Batasi host/domain yang diterima proxy. Default Compose masih mempublikasikan port 3000: firewall/bind privat wajib mencegah jalur langsung yang melewati proxy, TLS, atau limiter ingress. Ini belum dikonfigurasi karena domain/proxy Anda belum ditentukan.
3. Terapkan rate limit **per-IP dan batas koneksi/body/request timeout di ingress** untuk login (misalnya body maksimum 16 KB). Jangan mempercayai `X-Forwarded-For` dari internet; proxy tepercaya harus menimpa/memvalidasinya. Aplikasi sengaja tidak menganggap header tersebut sebagai identitas IP. Limiter global adalah lapisan pengaman, tetapi penyerang bisa menghabiskan kuotanya dan mengganggu login pengguna lain. Atur kebijakan ingress sebelum membuka akses publik.
4. Lindungi kedua Redis dan MySQL dengan jaringan privat; gunakan ACL/TLS bila layanan tidak berada di jaringan host yang terisolasi. Jangan memakai `allkeys-lru` untuk auth-store dan jangan menghapus volume counter sebagai cara membuka blokir. AOF everysec dapat kehilangan sekitar satu detik counter pada crash mendadak; bukan pertahanan tunggal terhadap serangan.
5. Rotasi kredensial yang pernah dibagikan, pastikan `.env` tidak masuk Git, cadangkan database, dan matikan logging body/cookie/password di proxy/APM. Event kegagalan auth di aplikasi tidak memuat kredensial. Pantau kenaikan 429/503 dan `auth_request_failed`/`auth_rate_limit_unavailable`.
6. Audit versi dependency dan lakukan uji keamanan di staging. MFA admin, reset password lewat kanal terverifikasi, deteksi password bocor, serta UI pencabutan seluruh sesi **belum diimplementasikan**. Untuk akses admin berisiko tinggi, batasi akses melalui VPN/identity gateway dengan MFA sampai MFA aplikasi tersedia. Password yang diubah lewat SQL manual tidak otomatis mencabut sesi lain; prosedur reset kelak harus mencabutnya dalam transaksi yang sama.

## 3. Perintah untuk Anda jalankan

PowerShell dari root proyek. Jangan lanjut ke langkah berikut jika langkah sebelumnya gagal. Perubahan ini tidak memerlukan dependency baru, tetapi instalasi frontend lama yang belum sinkron tetap perlu diselesaikan mengikuti panduan cache.

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

Tidak perlu menjalankan migrasi tambahan untuk perubahan ini jika migrasi sebelumnya sudah terpasang. Jangan menjalankan `docker compose down -v`: perintah tersebut juga menghapus data database dan counter keamanan.

## 4. Checklist staging (belum dilakukan)

- Login benar/salah, akun nonaktif, tanpa sesi, customer mengakses endpoint admin; pastikan 401/403 yang tepat tanpa respons demo.
- Inspect cookie pada HTTPS: nama `__Host-`, Secure, HttpOnly, SameSite=Strict, Path=/, tanpa Domain; periksa `Cache-Control: no-store` pada 200/401/422/429/500/503. Jangan membagikan nilai token saat mengambil screenshot.
- Login ulang harus mengganti token; token sebelumnya harus ditolak. Logout berhasil harus menghapus cookie dan token yang disalin sebelumnya harus ditolak server. Jika commit DB gagal, tidak boleh muncul penghapusan cookie/sukses palsu.
- Di akun uji, lakukan 11 percobaan dalam 15 menit, termasuk berganti antara email/HP yang terdaftar: harus 429 dan `Retry-After`. Ulangi melalui worker berbeda dan restart backend; kuota harus tetap sama. Uji expiry counter dengan waktu tunggu/TTL pendek khusus staging.
- Matikan **auth-store di staging**, pastikan login 503 dan sesi aktif/logout tetap bekerja; hidupkan kembali. Matikan **cache data**, pastikan login tetap berfungsi. Uji juga auth-store penuh. Tes unit dengan mock tidak membuktikan Redis/Lua multi-worker bekerja di deployment.
- Uji idle dengan menghentikan seluruh request terautentikasi (termasuk polling); setelah batas idle, request berikutnya harus 401. Uji batas absolut secara terpisah meskipun API terus aktif. Entri sesi lama tanpa `last_used_at` menggunakan `created_at` sebagai awal idle.
- Gunakan dua tab, akun A lalu B: cache/data A tidak boleh muncul dalam sesi B. Simulasikan respons API A lambat yang tiba setelah login B, serta 401 lama; keduanya harus diabaikan. Coba browser tanpa BroadcastChannel untuk fallback storage event.
- Putuskan jaringan saat logout: UI harus menyebut logout belum terkonfirmasi, lalu retry ketika koneksi kembali. Coba timeout saat login/pergantian akun; jangan tampilkan data akun lama dengan cookie akun baru.
- Pastikan origin asing atau Origin kosong tidak bisa POST login/logout, IP header palsu tidak melewati pembatas ingress, dan port 3000/8000/Redis tidak dapat diakses publik melewati jalur yang ditentukan.

Tes tambahan ada di `backend/tests/test_auth.py` dan `frontend/src/lib/api.test.ts`; tes backend lainnya tetap dipertahankan. Tes ini belum dijalankan dan checklist browser/integrasi bukan klaim kelulusan.

Referensi desain: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [Redis atomic counters](https://redis.io/docs/latest/commands/incr/), [pwdlib verify_and_update](https://frankie567.github.io/pwdlib/reference/pwdlib/).
