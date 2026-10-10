# Lampiran pengajuan SolarSync

## Perubahan

- Form memilih file asli, dapat mengganti/menghapus pilihan, dan mengirim maksimal
  satu foto atap (JPG/PNG) serta satu struk PLN (JPG/PNG/PDF), masing-masing 5 MiB.
- Pilihan file belum berarti terunggah. File baru dikirim bersama pengajuan melalui
  `POST /api/v1/requests/with-documents` (multipart: `data`, `roof_photo`, `electricity_bill`).
- Pengajuan tanpa file tetap menggunakan endpoint JSON `/api/v1/requests`.
- Backend memeriksa ukuran, ekstensi dan signature dasar file. Ini bukan antivirus
  atau pemeriksaan struktur lengkap PDF/gambar. Tambahkan pemindaian malware dan
  pembatasan per-IP pada ingress sebelum menerima unggahan publik skala besar.
- Batas body berlaku sebelum parsing termasuk transfer chunked. Ada batas global
  20 pengajuan lampiran/menit menggunakan auth Redis; kegagalannya menolak unggahan.
- Persetujuan wajib dipilih pengguna, bukan otomatis dicentang.
- Metadata memakai tabel `files` dan `request_documents` yang sudah tersedia.
  Tidak ada migrasi tabel baru. Database tetap harus sudah berada pada revisi head.
- Dokumen hanya diunduh sebagai attachment setelah pemeriksaan sesi dan akses
  admin/pemilik tiket. Direktori upload tidak dipublikasikan sebagai static files.
- Admin mengunduh melalui halaman detail pengajuan. Pengajuan tamu tidak otomatis
  terhubung ke akun yang dibuat/login kemudian; simpan nomor tiket dan hubungi admin.

## Penyimpanan

Docker menggunakan named volume `solarsync_uploads` di `/app/private_uploads`.
Recreate container tidak menghapus file. Jangan menjalankan `docker compose down -v`
karena akan menghapus volume termasuk database dan lampiran.

Untuk Python lokal, default penyimpanan `backend/private_uploads`; dapat diubah
melalui `UPLOAD_DIR`. Direktori ini diabaikan Git dan Docker build context.
Backup database dan volume lampiran bersama. Jika proses/server berhenti mendadak
di tengah transaksi, file yatim mungkin perlu direkonsiliasi oleh operator.

## Jalankan sendiri di PowerShell

Build berikut juga memasang dependency baru `python-multipart` ke image backend:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL'
docker compose build solarsync-backend solarsync-frontend
```

Jika build berhasil, jalankan pengujian:

```powershell
docker compose run --rm --no-deps solarsync-backend python -m unittest discover -s tests -v
```

Tes frontend menggunakan dependency lokal yang sudah terpasang:

```powershell
cd 'C:\PROJECT WEB\fullstcukUNMUL\frontend'
npm.cmd run test:auth
cd 'C:\PROJECT WEB\fullstcukUNMUL'
```

Lalu recreate kedua layanan:

```powershell
docker compose up -d --no-deps --force-recreate solarsync-backend solarsync-frontend
docker compose ps
```

Database dan auth Redis harus berjalan. Jika layanan dependensi belum berjalan,
gunakan `docker compose up -d` tanpa `--no-deps`.

## Cek manual

1. Pilih JPG/PNG asli untuk atap dan PDF/JPG/PNG untuk struk. Coba ganti dan hapus.
2. File kosong, ekstensi salah, atau ukuran lebih dari 5 MiB harus ditolak.
3. Tanpa persetujuan, pengajuan tidak dapat dikirim. Tanpa lampiran, pengajuan tetap boleh.
4. Setelah sukses, admin membuka tiket dan mengunduh kedua lampiran; isi harus sama.
5. Akun lain dan browser tanpa sesi tidak boleh mengunduh melalui URL langsung.
6. Recreate backend lalu ulangi unduh: file harus tetap tersedia.
7. Jika backend gagal, form mempertahankan pilihan agar pengguna dapat memeriksa
   dan mencoba lagi. Gangguan jaringan setelah commit bisa membuat status ambigu;
   cek tiket di admin sebelum mengirim ulang (belum ada idempotency key lintas retry).

Build, test suite, Docker dan pengecekan browser belum dijalankan oleh agen.
