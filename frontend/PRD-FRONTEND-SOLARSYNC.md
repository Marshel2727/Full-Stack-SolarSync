# PRODUCT REQUIREMENTS DOCUMENT — FRONTEND

## SolarSync — Integrated Clean Energy Ecosystem Platform

| Informasi | Nilai |
|---|---|
| Versi | 1.0 |
| Tanggal | 5 Agustus 2026 |
| Status | Draft untuk validasi tim |
| Platform | Web responsif |
| Teknologi acuan | React.js, Tailwind CSS, Chart.js |
| Target rilis | MVP |

---

## 1. Ringkasan Produk

Frontend SolarSync adalah antarmuka web yang membantu pengguna memahami energi surya, memperkirakan kebutuhan sistem panel surya, mengajukan pemasangan, dan memantau produksi serta konsumsi energi setelah instalasi.

Pengalaman pengguna harus terasa sederhana bagi masyarakat umum, tetapi tetap mampu menampilkan data teknis secara jelas. Pengguna tidak diwajibkan memahami istilah kelistrikan untuk menggunakan fitur utama.

### Sasaran utama frontend

1. Menjelaskan manfaat energi surya dengan bahasa yang mudah dipahami.
2. Mengubah pengunjung menjadi calon pelanggan melalui Solar Calculator dan pengajuan instalasi.
3. Menyajikan data energi secara ringkas, responsif, dan mudah dibandingkan.
4. Memberikan pengalaman yang konsisten bagi visitor, customer, dan admin.

---

## 2. Latar Belakang Masalah

Calon pengguna panel surya sering mengalami kendala berikut:

- Tidak memahami kebutuhan kapasitas sistem.
- Sulit memperkirakan biaya, penghematan, dan waktu balik modal.
- Informasi produk dan proses instalasi tersebar di banyak tempat.
- Data monitoring energi terlihat terlalu teknis atau sulit dipahami.
- Tidak mengetahui kondisi perangkat ketika sistem bermasalah atau offline.

Frontend harus menyederhanakan informasi tersebut tanpa memberikan klaim teknis yang menyesatkan.

---

## 3. Sasaran dan Indikator Keberhasilan

### Sasaran pengguna

- Pengunjung dapat memahami layanan utama dalam waktu kurang dari 2 menit.
- Pengunjung dapat menyelesaikan Solar Calculator tanpa bantuan operator.
- Pengguna dapat mengirim pengajuan instalasi dari ponsel.
- Customer dapat mengetahui kondisi sistem dari ringkasan dashboard.
- Admin dapat memproses pengajuan dan mengelola konten dasar.

### Metrik produk

| Metrik | Definisi awal |
|---|---|
| Calculator completion rate | Persentase pengguna yang menyelesaikan kalkulator |
| Installation conversion rate | Persentase hasil kalkulator yang dilanjutkan menjadi pengajuan |
| Form completion rate | Persentase formulir pengajuan yang berhasil dikirim |
| Dashboard active users | Customer yang membuka dashboard dalam 30 hari terakhir |
| Frontend error rate | Persentase kunjungan yang mengalami error aplikasi |
| Core Web Vitals | Kelulusan metrik web utama pada mayoritas kunjungan |

Target angka final ditentukan setelah tersedia data baseline atau hasil usability testing.

---

## 4. Target Pengguna

### 4.1 Visitor

Pengunjung yang ingin mempelajari panel surya, melihat paket, membaca artikel, dan mencoba kalkulator tanpa login.

### 4.2 Calon Customer

Pengunjung yang sudah memperoleh hasil kalkulator dan ingin mengajukan konsultasi, survei, atau pemasangan.

### 4.3 Customer

Pengguna yang telah memiliki akun dan instalasi terdaftar. Customer membutuhkan ringkasan produksi, konsumsi, penghematan, dampak karbon, dan status perangkat.

### 4.4 Admin

Operator yang mengelola pengajuan instalasi, customer, produk, artikel, dan status perangkat.

### 4.5 Teknisi — fase lanjutan

Petugas yang menerima jadwal survei atau instalasi dan memperbarui progres pekerjaan. Role ini tidak termasuk MVP kecuali proses operasional tim membutuhkannya sejak awal.

---

## 5. Prinsip Pengalaman Pengguna

1. **Bahasa sederhana:** istilah seperti kWp, kWh, inverter, dan ROI harus memiliki bantuan singkat.
2. **Ringkasan terlebih dahulu:** tampilkan kondisi dan angka terpenting sebelum grafik atau detail teknis.
3. **Mobile-first:** kalkulator, formulir, dan dashboard harus dapat digunakan dengan nyaman melalui ponsel.
4. **Status selalu jelas:** setiap proses harus memiliki state loading, berhasil, kosong, gagal, dan offline.
5. **Estimasi yang transparan:** hasil kalkulator harus menampilkan asumsi serta peringatan bahwa hasil bukan desain instalasi final.
6. **Aksi utama konsisten:** setiap halaman publik mengarahkan pengguna ke kalkulator atau konsultasi.

---

## 6. Ruang Lingkup MVP

### Termasuk MVP

- Landing page.
- Knowledge Center dasar: daftar artikel, detail artikel, dan FAQ.
- Solar Calculator.
- Katalog dan detail paket.
- Formulir pengajuan instalasi.
- Login dan lupa kata sandi.
- Customer dashboard.
- Riwayat dan detail data energi.
- Status perangkat.
- Carbon Impact Tracker dasar.
- Admin dashboard dasar.
- Pengelolaan pengajuan, produk, artikel, customer, dan perangkat.

### Tidak termasuk MVP

- Pembayaran online.
- Marketplace multi-vendor.
- Forum komunitas.
- AI Energy Assistant.
- Otomasi smart home.
- Prediksi AI.
- Aplikasi mobile native.
- Portal teknisi lengkap.
- Perbandingan penawaran beberapa installer.

---

## 7. Arsitektur Informasi dan Rute

### Halaman publik

| Rute | Halaman | Akses |
|---|---|---|
| `/` | Landing Page | Publik |
| `/calculator` | Solar Calculator | Publik |
| `/calculator/result` | Hasil Kalkulator | Publik |
| `/packages` | Katalog Paket | Publik |
| `/packages/:slug` | Detail Paket | Publik |
| `/knowledge` | Knowledge Center | Publik |
| `/knowledge/:slug` | Detail Artikel | Publik |
| `/faq` | FAQ | Publik |
| `/installation-request` | Pengajuan Instalasi | Publik/customer |
| `/login` | Login | Publik |
| `/forgot-password` | Lupa Kata Sandi | Publik |

### Halaman customer

| Rute | Halaman |
|---|---|
| `/dashboard` | Ringkasan energi |
| `/dashboard/energy` | Detail produksi dan konsumsi |
| `/dashboard/impact` | Dampak karbon dan penghematan |
| `/dashboard/devices` | Perangkat dan status koneksi |
| `/dashboard/installation` | Data dan progres instalasi |
| `/dashboard/profile` | Profil dan keamanan akun |

### Halaman admin

| Rute | Halaman |
|---|---|
| `/admin` | Ringkasan operasional |
| `/admin/requests` | Daftar pengajuan instalasi |
| `/admin/requests/:id` | Detail dan perubahan status pengajuan |
| `/admin/customers` | Manajemen customer |
| `/admin/products` | Manajemen paket/produk |
| `/admin/articles` | Manajemen artikel |
| `/admin/devices` | Manajemen dan status perangkat |

---

## 8. Kebutuhan Fungsional

## FR-01 — Global Navigation

### Kebutuhan

- Header publik menampilkan logo, navigasi utama, tombol login, dan CTA "Hitung Kebutuhan".
- Navigasi mobile menggunakan menu yang dapat dibuka dan ditutup.
- Header customer dan admin menampilkan konteks role yang jelas.
- Halaman aktif ditandai secara visual.
- Pengguna dapat logout dari menu akun.

### Acceptance criteria

- Seluruh item navigasi dapat digunakan dengan keyboard.
- Menu mobile menutup setelah pengguna memilih halaman.
- Pengguna tanpa role yang sesuai tidak dapat membuka halaman terproteksi.

## FR-02 — Landing Page

### Bagian halaman

1. Hero dengan value proposition dan CTA.
2. Masalah yang diselesaikan SolarSync.
3. Cara kerja dari kalkulasi sampai monitoring.
4. Manfaat untuk rumah tangga dan UMKM.
5. Paket unggulan.
6. Contoh dashboard monitoring.
7. Dampak terhadap SDG 7.
8. Testimoni yang sudah diverifikasi.
9. FAQ ringkas.
10. CTA akhir dan footer.

### Acceptance criteria

- CTA utama terlihat tanpa scroll pada layar desktop dan mobile umum.
- Tidak ada angka statistik atau testimoni tanpa sumber/data yang dapat diverifikasi.
- Gambar menggunakan lazy loading selain gambar hero yang kritis.

## FR-03 — Knowledge Center

### Kebutuhan

- Daftar artikel dengan gambar, judul, ringkasan, kategori, dan tanggal.
- Filter kategori dan pencarian artikel.
- Detail artikel mendukung heading, gambar, video embed, dan tautan terkait.
- FAQ menggunakan komponen accordion yang dapat diakses dengan keyboard.
- Empty state ditampilkan saat pencarian tidak menemukan hasil.

## FR-04 — Solar Calculator

### Input minimum

- Lokasi atau kota.
- Jenis pengguna: rumah tangga, UMKM, sekolah, atau lainnya.
- Pemakaian listrik bulanan dalam kWh.
- Tagihan listrik bulanan, jika diketahui.
- Daya listrik terpasang.
- Luas atap tersedia.
- Arah atap dan kondisi bayangan, jika diketahui.
- Persentase kebutuhan listrik yang ingin ditutupi.

### Perilaku antarmuka

- Form dibagi menjadi langkah pendek, maksimal 3–4 kelompok.
- Progress indicator menunjukkan posisi pengguna.
- Setiap input memiliki satuan, contoh, batas nilai, dan pesan validasi.
- Pengguna dapat kembali ke langkah sebelumnya tanpa kehilangan data.
- Data sementara disimpan selama sesi agar tidak hilang karena refresh yang tidak disengaja.

### Output

- Rekomendasi kapasitas sistem dalam kWp.
- Perkiraan jumlah panel dan daya per panel.
- Perkiraan produksi energi bulanan dan tahunan.
- Kisaran biaya instalasi.
- Perkiraan penghematan.
- Estimasi periode balik modal.
- Estimasi pengurangan emisi.
- Asumsi perhitungan dan disclaimer.
- CTA konsultasi atau pengajuan instalasi.

### Acceptance criteria

- Input tidak valid tidak dapat dikirim.
- Perhitungan ditampilkan kembali dengan format satuan dan mata uang yang konsisten.
- Hasil tidak menggunakan kata "pasti" dan dinyatakan sebagai estimasi awal.
- Pengguna dapat mengubah input dan menghitung ulang.
- Hasil kalkulator dapat diteruskan ke formulir pengajuan tanpa mengisi ulang data yang sama.

## FR-05 — Katalog Paket

### Kebutuhan

- Daftar paket dapat difilter berdasarkan segmen dan kisaran kapasitas.
- Kartu paket menampilkan nama, kapasitas, estimasi produksi, kisaran harga, dan garansi.
- Detail paket menampilkan komponen, spesifikasi, cakupan layanan, garansi, serta pengecualian.
- Harga yang belum final harus menggunakan label "mulai dari" atau "estimasi".
- CTA mengarahkan pengguna ke konsultasi/pengajuan dengan paket terpilih.

## FR-06 — Pengajuan Instalasi

### Data minimum

- Nama lengkap.
- Nomor telepon aktif.
- Email, jika diperlukan untuk akun.
- Alamat dan lokasi pemasangan.
- Jenis bangunan.
- Data konsumsi atau hasil kalkulator.
- Foto bangunan/atap.
- Foto atau dokumen tagihan listrik.
- Persetujuan pemrosesan data.

### Status proses

`Diajukan → Diverifikasi → Menunggu Survei → Penawaran → Disetujui → Dijadwalkan → Instalasi → Selesai`

### Acceptance criteria

- Nomor telepon, email, ukuran file, dan format file divalidasi.
- Pengguna melihat progress upload.
- Tombol submit dinonaktifkan ketika proses masih berjalan untuk mencegah duplikasi.
- Setelah berhasil, pengguna menerima nomor tiket dan ringkasan pengajuan.
- Kegagalan jaringan tidak menghapus data teks yang sudah diisi.

## FR-07 — Authentication

### Kebutuhan

- Login menggunakan email/nomor telepon sesuai keputusan backend.
- Tersedia tampil/sembunyikan kata sandi.
- Tersedia alur lupa dan reset kata sandi.
- Pengguna diarahkan ke dashboard sesuai role.
- Sesi kedaluwarsa memberikan pesan yang jelas dan mengarahkan ke login.

### Acceptance criteria

- Pesan login gagal tidak mengungkap apakah suatu akun terdaftar.
- Route customer dan admin terlindungi.
- Tombol login menampilkan loading dan mencegah pengiriman berulang.

## FR-08 — Customer Dashboard

### Ringkasan utama

- Status sistem: normal, peringatan, offline, atau belum terhubung.
- Produksi hari ini.
- Konsumsi hari ini.
- Energi bersih atau surplus jika datanya tersedia.
- Penghematan estimasi.
- Pengurangan emisi.
- Waktu terakhir data diterima.

### Grafik

- Grafik produksi dan konsumsi.
- Rentang waktu: hari, minggu, bulan, dan tahun.
- Tooltip berisi waktu, nilai, dan satuan.
- Legend dapat membedakan seri tanpa hanya mengandalkan warna.
- Pengguna dapat melihat ringkasan angka jika grafik gagal dimuat.

### Acceptance criteria

- Dashboard membedakan nilai `0` dengan data yang belum tersedia.
- Data lama diberi label stale berdasarkan batas waktu dari backend.
- Perangkat offline tidak ditampilkan seolah-olah menghasilkan energi nol.
- Perubahan rentang waktu tidak memuat ulang seluruh halaman.
- Loading skeleton, empty state, partial error, dan full error tersedia.

## FR-09 — Carbon Impact Tracker

### Kebutuhan

- Menampilkan estimasi pengurangan CO₂.
- Menampilkan ekuivalensi yang mudah dipahami jika metodologinya tersedia.
- Menjelaskan periode data dan dasar konversi.
- Tidak menggunakan klaim lingkungan tanpa rumus atau sumber yang ditetapkan tim produk.

## FR-10 — Admin Dashboard

### Kebutuhan

- Ringkasan jumlah pengajuan baru, pengajuan berdasarkan status, customer, dan perangkat offline.
- Tabel mendukung pencarian, filter, pagination, dan empty state.
- Admin dapat melihat detail pengajuan serta mengubah status sesuai transisi yang diizinkan.
- Form produk dan artikel memiliki validasi serta konfirmasi sebelum keluar ketika ada perubahan belum disimpan.
- Perubahan penting menampilkan feedback sukses/gagal.
- Tindakan sensitif meminta konfirmasi.

### Acceptance criteria

- Admin tidak dapat memilih transisi status yang tidak valid.
- Filter tabel tersimpan di URL agar halaman dapat dibagikan atau di-refresh.
- Aksi gagal tidak menghilangkan data form.
- UI tidak menganggap operasi berhasil sebelum backend mengonfirmasi.

---

## 9. Komponen Bersama

Komponen berikut harus digunakan ulang untuk menjaga konsistensi:

- Button dan IconButton.
- Input, Textarea, Select, Checkbox, Radio, dan File Upload.
- FormField dengan label, bantuan, validasi, dan status wajib.
- Card.
- Badge status.
- Modal atau Dialog.
- Toast/notification.
- Tabs.
- Accordion.
- Breadcrumb.
- Data table.
- Pagination.
- Date/range selector.
- Empty state.
- Error state.
- Skeleton loader.
- Stat card.
- Chart wrapper.
- Confirmation dialog.

Setiap komponen interaktif minimal memiliki state default, hover, focus, active, disabled, loading, dan error jika relevan.

---

## 10. Sistem Desain

### Arah visual

- Bersih, modern, dan terpercaya.
- Warna utama dapat menggunakan hijau/biru energi dengan kontras yang memadai.
- Warna status tidak boleh menjadi satu-satunya cara menyampaikan informasi.
- Angka energi menggunakan tipografi yang mudah dipindai.
- Ikon mendampingi label, bukan menggantikan teks penting.

### Token minimum

- Warna brand, surface, text, border, success, warning, danger, dan information.
- Skala spacing.
- Ukuran dan weight tipografi.
- Radius.
- Shadow.
- Breakpoint.
- Durasi dan easing animasi.

Nilai token final ditetapkan pada tahap desain UI agar tidak tersebar sebagai hardcode di banyak komponen.

---

## 11. Responsive Design

### Mobile

- Prioritas pada satu kolom.
- Navigasi menggunakan menu mobile.
- Tabel admin dapat menggunakan card list atau horizontal scroll yang terkendali.
- Grafik memiliki tinggi minimum dan label yang tetap terbaca.
- CTA penting dapat menggunakan posisi sticky jika tidak menutupi konten.

### Tablet

- Ringkasan dashboard dapat menggunakan dua kolom.
- Filter kompleks dapat ditempatkan dalam drawer.

### Desktop

- Dashboard menggunakan grid beberapa kolom.
- Admin dapat menggunakan sidebar permanen.
- Lebar konten dibatasi agar teks tidak terlalu panjang.

Breakpoint final mengikuti sistem desain/Tailwind dan harus diuji pada beberapa ukuran nyata, bukan hanya tepat di breakpoint.

---

## 12. Aksesibilitas

Target minimum adalah WCAG 2.2 Level AA untuk alur utama.

- Semua fitur dapat dioperasikan dengan keyboard.
- Fokus keyboard terlihat jelas.
- Form memiliki label yang terhubung secara programatis.
- Error dijelaskan dengan teks dan diumumkan kepada assistive technology.
- Kontras teks dan kontrol memenuhi batas aksesibilitas.
- Modal mengelola fokus dengan benar.
- Grafik memiliki ringkasan atau alternatif data berbentuk teks/tabel.
- Animasi menghormati preferensi `prefers-reduced-motion`.
- Heading mengikuti hierarki yang benar.
- Gambar informatif memiliki alt text; gambar dekoratif tidak dibacakan.

---

## 13. State dan Penanganan Error

Setiap integrasi API harus memiliki definisi UI untuk:

- Initial state.
- Loading.
- Success.
- Empty data.
- Validation error.
- Unauthorized/forbidden.
- Not found.
- Server error.
- Network timeout/offline.
- Partial data.
- Stale monitoring data.

Pesan error harus menjelaskan apa yang terjadi dan tindakan yang dapat dilakukan pengguna, misalnya mencoba kembali atau menghubungi dukungan.

---

## 14. Kebutuhan Integrasi API

Frontend mengharapkan backend menyediakan:

- Kontrak API terdokumentasi dan memiliki versi.
- Format response dan error yang konsisten.
- Pagination, filter, search, dan sorting pada endpoint daftar.
- Timestamp berzona waktu atau UTC yang konsisten.
- Satuan telemetry yang eksplisit.
- Status perangkat beserta `last_seen_at`.
- Agregasi telemetry berdasarkan rentang waktu.
- Mekanisme autentikasi dan refresh sesi yang disepakati.
- Batas serta format upload file.
- Idempotency atau perlindungan duplikasi untuk pengajuan.

Polling dapat digunakan pada MVP. WebSocket atau Server-Sent Events digunakan hanya jika kebutuhan real-time telah didefinisikan dan backend mendukungnya.

---

## 15. Pengelolaan State Frontend

- Server state dipisahkan dari local UI state.
- Cache, refetch, retry, dan invalidation dikelola secara konsisten.
- Filter halaman disimpan pada URL jika perlu dibagikan atau dipertahankan saat refresh.
- Data autentikasi sensitif tidak disimpan sembarangan di browser.
- Draft formulir non-sensitif boleh disimpan sementara untuk mencegah kehilangan input.
- Data kalkulator memiliki satu sumber kebenaran selama alur multi-step.

Pemilihan library state management dilakukan setelah kebutuhan final diketahui; jangan menambahkan global state untuk state lokal sederhana.

---

## 16. Performance

### Target awal

- Halaman publik utama ditargetkan memenuhi Core Web Vitals kategori baik pada perangkat dan jaringan target.
- Route admin dan dashboard menggunakan code splitting.
- Bundle chart tidak dimuat pada halaman yang tidak memerlukannya.
- Gambar menggunakan format dan ukuran yang sesuai.
- Pencarian menggunakan debounce jika memanggil API.
- Tabel besar menggunakan pagination dari server.
- Request yang tidak diperlukan dibatalkan saat pengguna berpindah halaman.

Target angka final harus diukur menggunakan perangkat serta koneksi yang mewakili pengguna Indonesia, bukan hanya laptop developer.

---

## 17. Keamanan dan Privasi Frontend

- Tidak menyimpan secret, kredensial MQTT, atau API key privat di bundle frontend.
- Melakukan validasi client-side untuk pengalaman pengguna, tetapi tetap bergantung pada validasi backend untuk keamanan.
- Menghindari render HTML mentah dari artikel tanpa sanitasi.
- Menyembunyikan route bukan pengganti otorisasi backend.
- Upload file dibatasi berdasarkan tipe dan ukuran.
- Data pribadi tidak dicetak ke console atau analytics.
- Informasi sensitif disamarkan jika ditampilkan pada halaman bersama.
- Tersedia pemberitahuan privasi dan persetujuan pengolahan data.

---

## 18. Analytics dan Observability

Event minimum yang dapat dicatat tanpa menyimpan data sensitif:

- `calculator_started`
- `calculator_step_completed`
- `calculator_completed`
- `calculator_result_cta_clicked`
- `installation_form_started`
- `installation_form_submitted`
- `installation_form_failed`
- `login_succeeded`
- `login_failed`
- `dashboard_range_changed`
- `dashboard_data_failed`

Frontend juga membutuhkan error tracking untuk menangkap crash, route, versi aplikasi, dan konteks teknis yang aman. Nomor telepon, alamat, tagihan, token, dan telemetry detail tidak boleh dikirim sebagai metadata analytics tanpa kebijakan yang jelas.

---

## 19. SEO dan Konten Publik

- Setiap halaman publik memiliki title dan meta description unik.
- Artikel memiliki URL yang mudah dibaca.
- Sitemap dan robots configuration tersedia saat deployment.
- Open Graph metadata tersedia untuk halaman yang dibagikan.
- Heading dan internal link memiliki struktur yang benar.
- Konten utama dapat diindeks; dashboard dan admin tidak boleh diindeks.
- Klaim biaya, ROI, energi, dan lingkungan harus menyertakan konteks/asumsi.

---

## 20. Pengujian dan Quality Assurance

### Unit test

- Fungsi format energi, mata uang, tanggal, dan persentase.
- Validasi form.
- Transformasi data grafik.
- Perhitungan frontend hanya jika formula memang ditempatkan di frontend.

### Component/integration test

- Multi-step calculator.
- Login dan proteksi route.
- Form pengajuan beserta upload.
- Filter dan pagination admin.
- State dashboard: loading, empty, error, offline, dan stale.

### End-to-end test prioritas

1. Visitor menyelesaikan kalkulator lalu mengirim pengajuan.
2. Customer login lalu melihat data energi.
3. Admin login lalu memproses status pengajuan.
4. Customer melihat perangkat offline dan waktu data terakhir.

### Pengujian manual

- Browser modern utama.
- Mobile, tablet, dan desktop.
- Keyboard-only.
- Jaringan lambat dan offline.
- Data kosong, data sangat panjang, dan nilai ekstrem.

---

## 21. Tahapan Pengembangan Frontend

### Fase 0 — Foundation

- Struktur aplikasi.
- Routing.
- Design tokens.
- Komponen dasar.
- API client.
- Error handling.
- Authentication foundation.

### Fase 1 — Public Experience

- Landing page.
- Knowledge Center.
- Katalog paket.
- Solar Calculator.
- Pengajuan instalasi.

### Fase 2 — Customer Experience

- Login dan pemulihan akun.
- Dashboard ringkasan.
- Grafik energi.
- Perangkat.
- Instalasi dan profil.

### Fase 3 — Admin Experience

- Ringkasan admin.
- Pengajuan instalasi.
- Customer.
- Produk.
- Artikel.
- Perangkat.

### Fase 4 — Stabilization

- Accessibility audit.
- Performance audit.
- Security review.
- Cross-browser testing.
- Perbaikan hasil usability testing.

---

## 22. Definition of Done

Sebuah fitur frontend dianggap selesai jika:

- Acceptance criteria terpenuhi.
- Desain mobile, tablet, dan desktop telah diperiksa.
- Loading, empty, error, dan success state tersedia.
- Validasi form dan pesan error bekerja.
- Keyboard navigation dan focus state telah diperiksa.
- Integrasi API menggunakan kontrak yang disepakati.
- Test penting lulus.
- Tidak ada error console yang belum dijelaskan.
- Tidak membocorkan secret atau data pribadi.
- Copy dan satuan telah ditinjau.
- Product owner menerima hasil berdasarkan skenario pengguna.

---

## 23. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Fitur terlalu banyak untuk MVP | Jadwal mundur | Kunci ruang lingkup MVP dan prioritaskan alur utama |
| Formula kalkulator belum tervalidasi | Rekomendasi menyesatkan | Formula ditetapkan bersama pihak teknis dan tampilkan asumsi |
| Data IoT terlambat atau hilang | Dashboard membingungkan | Tampilkan last update, offline, stale, dan partial state |
| Kontrak API sering berubah | Rework frontend | Gunakan dokumentasi API, mock, dan versioning |
| Grafik sulit dipahami | Pengguna salah membaca data | Ringkasan angka, tooltip, unit, dan alternatif tabel |
| Upload gagal pada koneksi lambat | Pengajuan tidak selesai | Progress, retry, validasi awal, dan pertahankan draft teks |
| Admin memiliki akses berlebihan | Risiko privasi | Role-based UI dan otorisasi wajib pada backend |

---

## 24. Pertanyaan Terbuka

Keputusan berikut harus diselesaikan sebelum implementasi fitur terkait:

1. Apakah frontend menggunakan JavaScript atau TypeScript?
2. Apakah website publik membutuhkan server-side rendering untuk SEO?
3. Apakah pendaftaran customer dilakukan sendiri atau dibuat admin setelah instalasi?
4. Apakah login menggunakan email, nomor telepon, atau keduanya?
5. Siapa yang memvalidasi formula dan asumsi Solar Calculator?
6. Berapa interval pembaruan data monitoring?
7. Apakah MVP menggunakan polling, WebSocket, atau Server-Sent Events?
8. Berapa batas data dianggap stale dan perangkat dianggap offline?
9. Apakah satu customer dapat memiliki beberapa lokasi dan perangkat?
10. Siapa yang dapat mengubah status pengajuan?
11. Apakah harga paket bersifat pasti atau estimasi?
12. Apakah admin dan customer berada dalam aplikasi frontend yang sama?

---

## 25. Rekomendasi Keputusan Awal

Untuk menjaga MVP tetap sederhana:

- Gunakan React dengan TypeScript.
- Gunakan satu aplikasi frontend dengan area publik, customer, dan admin yang dipisahkan melalui layout serta role.
- Gunakan Tailwind CSS dan komponen reusable internal.
- Gunakan Chart.js sesuai PRD utama.
- Gunakan REST API dan polling untuk dashboard MVP, kemudian evaluasi kebutuhan real-time sebenarnya.
- Jalankan formula kalkulator pada backend agar asumsi dan versi formula dapat dikendalikan secara terpusat.
- Jadikan hasil kalkulator sebagai estimasi yang dapat diteruskan langsung ke pengajuan instalasi.

Dokumen ini menjadi acuan kebutuhan produk frontend. Detail visual, kontrak API, formula perhitungan, dan breakdown task engineering dibuat sebagai dokumen turunan setelah pertanyaan terbuka disepakati.
