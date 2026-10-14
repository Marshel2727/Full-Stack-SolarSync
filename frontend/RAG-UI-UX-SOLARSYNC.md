---
title: SolarSync UI/UX RAG Knowledge Base
document_type: rag-ui-ux-specification
product: SolarSync
design_system: SolarSync Lumina
language: id-ID
version: 1.0.0
last_updated: 2026-08-15
status: implementation-reference
scope:
  - public-web
  - authentication
  - customer-dashboard
  - admin-dashboard
  - shared-components
  - responsive-design
  - accessibility
source_documents:
  - PRD-FRONTEND-SOLARSYNC.md
  - DESIGN.md
retrieval_tags:
  - solarsync
  - ui
  - ux
  - public
  - customer
  - admin
  - solar-calculator
  - monitoring
  - responsive
  - accessibility
---

# SolarSync UI/UX RAG Knowledge Base

## RAG-00 - Tujuan dan aturan penggunaan

Dokumen ini adalah sumber pengetahuan UI/UX kanonis untuk SolarSync. Dokumen disusun agar dapat digunakan oleh AI designer, coding agent, product designer, frontend developer, dan reviewer sebagai konteks implementasi.

Setiap bagian memakai ID stabil seperti `PAGE-PUB-001` atau `COMP-FORM-001`. Saat dokumen dipecah menjadi chunk, pertahankan ID, judul, route, role, dan acceptance criteria dalam chunk yang sama.

### Urutan otoritas

Jika terdapat konflik, gunakan urutan berikut:

1. Instruksi terbaru dan eksplisit dari product owner.
2. Aturan bisnis pada `PRD-FRONTEND-SOLARSYNC.md`.
3. Spesifikasi UI/UX dalam dokumen ini.
4. Arah visual mentah pada `DESIGN.md`.
5. Asumsi developer atau AI.

### Aturan wajib untuk AI atau implementer

- Jangan menciptakan statistik, testimoni, harga, garansi, ROI, atau klaim lingkungan tanpa data yang dapat diverifikasi.
- Jangan menampilkan hasil Solar Calculator sebagai nilai pasti. Gunakan istilah "estimasi", "perkiraan", atau "mulai dari".
- Jangan menyamakan nilai energi `0` dengan data yang belum tersedia.
- Jangan menampilkan perangkat offline seolah-olah sedang menghasilkan energi nol.
- Jangan menggunakan warna sebagai satu-satunya pembeda status.
- Jangan menyimpan secret, token privat, kredensial MQTT, atau data pribadi dalam UI, log browser, maupun analytics.
- Jangan mengubah alur bisnis, role, route, atau status instalasi tanpa persetujuan product owner.
- Gunakan komponen bersama sebelum membuat pola UI baru.
- Setiap halaman berbasis API wajib memiliki loading, success, empty, error, offline, dan stale state jika relevan.
- Bahasa utama UI adalah Bahasa Indonesia yang sederhana dan tidak terlalu teknis.

### Terminologi kanonis

| Istilah | Arti dalam produk |
|---|---|
| Visitor | Pengunjung yang belum login |
| Calon customer | Pengunjung yang mengisi kalkulator atau pengajuan |
| Customer | Pengguna dengan akun dan instalasi terdaftar |
| Admin | Operator pengelola pengajuan, konten, customer, produk, dan perangkat |
| Site | Satu lokasi instalasi panel surya |
| Device | ESP32, gateway, inverter, meter, atau perangkat monitoring yang terhubung ke site |
| Telemetry | Data tegangan, arus, daya, energi, dan waktu yang dikirim perangkat |
| Stale | Data terakhir sudah melewati batas kesegaran dari backend |
| Offline | Perangkat dinyatakan tidak terhubung oleh backend |
| Produksi | Energi yang dihasilkan sistem panel surya |
| Konsumsi | Energi yang digunakan bangunan |
| Impor grid | Energi yang diambil dari jaringan listrik |
| Ekspor grid | Energi yang dikirim ke jaringan, jika sistem mendukung |
| Estimasi | Hasil indikatif, bukan desain teknis atau penawaran final |

---

# RAG-01 - Konteks produk dan pengguna

## Tujuan produk

SolarSync membantu masyarakat memahami energi surya, memperkirakan kebutuhan sistem, memilih solusi, mengajukan instalasi, dan memantau energi setelah perangkat aktif.

## Nilai utama pengalaman pengguna

1. Pengguna awam dapat memahami manfaat tanpa mengerti istilah kelistrikan.
2. Kalkulator mengubah kebutuhan listrik menjadi rekomendasi yang mudah dibaca.
3. Pengajuan instalasi dapat diselesaikan dari ponsel.
4. Customer dapat mengetahui kondisi sistem dalam beberapa detik.
5. Admin dapat memproses pekerjaan tanpa kehilangan konteks atau data.

## Persona dan kebutuhan

### ROLE-VISITOR

- Ingin memahami manfaat dan biaya awal panel surya.
- Membutuhkan bahasa sederhana, visual tepercaya, FAQ, dan kalkulator.
- Tidak diwajibkan login untuk membaca konten atau memakai kalkulator.

### ROLE-PROSPECT

- Sudah tertarik dan membutuhkan estimasi atau konsultasi.
- Membutuhkan hasil kalkulator, perbandingan paket, dan formulir yang tidak berulang.
- Harus dapat melanjutkan hasil kalkulator ke pengajuan instalasi.

### ROLE-CUSTOMER

- Memiliki instalasi dan akun monitoring.
- Membutuhkan produksi, konsumsi, penghematan, dampak karbon, status perangkat, serta progres instalasi.
- Lebih membutuhkan ringkasan yang jelas daripada data mentah yang padat.

### ROLE-ADMIN

- Memproses pengajuan, customer, produk, artikel, dan perangkat.
- Membutuhkan tabel, filter, status, audit context, konfirmasi tindakan, dan feedback operasi.
- UI admin mengutamakan efisiensi, keterbacaan, dan pencegahan kesalahan.

### ROLE-TECHNICIAN-FUTURE

- Bukan bagian wajib MVP.
- Jika ditambahkan, akses dibatasi pada survei, jadwal, site, perangkat, dan pembaruan pekerjaan yang ditugaskan.

---

# RAG-02 - Prinsip pengalaman pengguna

## UX-PRINCIPLE-001 - Ringkasan terlebih dahulu

Tampilkan status sistem dan angka terpenting sebelum grafik atau detail teknis. Dashboard customer dimulai dari kondisi sistem, produksi hari ini, konsumsi hari ini, penghematan, dan waktu data terakhir.

## UX-PRINCIPLE-002 - Bahasa sederhana

- Jelaskan `kWh` sebagai jumlah energi yang digunakan atau dihasilkan.
- Jelaskan `kWp` sebagai kapasitas maksimum sistem panel.
- Jelaskan ROI sebagai perkiraan waktu sampai biaya awal setara dengan akumulasi penghematan.
- Gunakan tooltip atau helper text, bukan paragraf panjang di dalam form.

## UX-PRINCIPLE-003 - Status selalu terlihat

Setiap operasi menjawab tiga pertanyaan:

1. Apa yang sedang terjadi?
2. Apakah operasi berhasil atau gagal?
3. Apa yang dapat dilakukan pengguna berikutnya?

## UX-PRINCIPLE-004 - Estimasi transparan

Semua hasil biaya, energi, ROI, dan emisi harus memperlihatkan asumsi, periode, satuan, dan disclaimer.

## UX-PRINCIPLE-005 - Mobile-first

Alur kalkulator, login, pengajuan, upload, monitoring, dan progres instalasi harus tetap lengkap pada layar ponsel. Fitur penting tidak boleh hanya tersedia melalui hover.

## UX-PRINCIPLE-006 - Satu aksi utama

Setiap layar memiliki satu primary action. Secondary action tidak boleh memiliki bobot visual yang sama dengan primary action kecuali merupakan pilihan setara.

## UX-PRINCIPLE-007 - Pencegahan kesalahan

- Validasi ditampilkan dekat field.
- Data form dipertahankan saat request gagal.
- Submit ganda dicegah.
- Tindakan sensitif meminta konfirmasi.
- Admin tidak boleh memilih transisi status yang tidak diizinkan backend.

---

# RAG-03 - Design system kanonis

## DESIGN-BRAND-001 - Kepribadian visual

Nama sistem desain adalah **SolarSync Lumina**. Karakternya adalah "The Expert Partner": berwibawa, mudah dipahami, modern, aman, dan tidak terasa eksperimental.

Arah visual memakai Corporate Modern dengan tonal layers dan glassmorphism terbatas. Glassmorphism hanya digunakan untuk hero accent, live status highlight, atau panel dekoratif. Konten data utama menggunakan permukaan solid agar mudah dibaca.

## DESIGN-COLOR-001 - Warna brand dan semantic

Tabel berikut menjadi mapping kanonis untuk implementasi UI baru.

| Token | Nilai | Penggunaan |
|---|---:|---|
| `brand-primary` | `#064E3B` | Tombol utama, navigasi, heading aksen |
| `brand-primary-strong` | `#003527` | Header gelap, hover tombol utama |
| `brand-primary-deep` | `#022C22` | Footer dan teks pada accent terang |
| `brand-accent` | `#FBBF24` | CTA penting, energi surya, active journey |
| `brand-accent-soft` | `#FDE68A` | Highlight lembut dan focus accent |
| `surface-page` | `#F8FAF6` | Latar halaman utama |
| `surface-card` | `#FFFFFF` | Card, form, modal, table container |
| `surface-subtle` | `#F2F4F1` | Section alternatif dan empty state |
| `surface-muted` | `#E7E9E5` | Disabled dan skeleton netral |
| `text-primary` | `#191C1B` | Teks utama |
| `text-secondary` | `#404944` | Deskripsi dan helper text |
| `text-inverse` | `#FFFFFF` | Teks di atas primary gelap |
| `border-subtle` | `#E2E8F0` | Border card dan separator |
| `border-strong` | `#BFC9C3` | Input idle dan struktur kuat |
| `state-success` | `#10B981` | Berhasil dan sistem normal |
| `state-warning` | `#D97706` | Peringatan dan data stale |
| `state-danger` | `#BA1A1A` | Error dan tindakan destruktif |
| `state-info` | `#2563EB` | Informasi dan tautan kontekstual |
| `state-offline` | `#64748B` | Perangkat offline atau belum aktif |

### Aturan warna

- Solar Gold tidak digunakan untuk teks kecil di atas latar putih tanpa pemeriksaan kontras.
- Tombol berwarna Solar Gold memakai teks `brand-primary-deep`.
- Status selalu disertai teks atau ikon.
- Merah hanya untuk error, bahaya, atau tindakan destruktif.
- Hijau status tidak menggantikan warna brand pada seluruh dashboard.

## DESIGN-CHART-001 - Warna data

| Seri | Warna | Bentuk tambahan |
|---|---:|---|
| Produksi surya | `#FBBF24` | Garis solid dan ikon matahari |
| Konsumsi | `#2563EB` | Garis solid dan ikon rumah |
| Baterai | `#10B981` | Garis/area dan ikon baterai |
| Impor grid | `#8B5CF6` | Garis putus-putus masuk |
| Ekspor grid | `#06B6D4` | Garis putus-putus keluar |
| Data estimasi | `#64748B` | Garis putus-putus dan label estimasi |
| Offline/tidak tersedia | `#94A3B8` | Tidak digambar sebagai nilai nol |

Grafik tidak boleh hanya dibedakan oleh warna. Legend, tooltip, pola garis, atau ikon harus tersedia. Gunakan kurva linear atau tension rendah agar grafik sensor tidak membuat puncak palsu.

## DESIGN-TYPE-001 - Tipografi

| Token | Font | Ukuran desktop | Ukuran mobile | Weight | Penggunaan |
|---|---|---:|---:|---:|---|
| `display` | Plus Jakarta Sans | 48px | 32px | 800 | Hero utama |
| `heading-1` | Plus Jakarta Sans | 40px | 30px | 800 | Judul halaman |
| `heading-2` | Plus Jakarta Sans | 32px | 26px | 700 | Judul section |
| `heading-3` | Plus Jakarta Sans | 24px | 22px | 700 | Judul card besar |
| `heading-4` | Plus Jakarta Sans | 20px | 18px | 700 | Subsection |
| `body-lg` | Plus Jakarta Sans | 18px | 17px | 400 | Lead paragraph |
| `body-md` | Plus Jakarta Sans | 16px | 16px | 400 | Teks utama |
| `body-sm` | Inter | 14px | 14px | 400 | Helper dan metadata |
| `label` | Inter | 14px | 14px | 600 | Form dan button |
| `label-caps` | Inter | 12px | 12px | 600 | Overline pendek |
| `numeric-lg` | Plus Jakarta Sans | 32px | 28px | 700 | Angka KPI utama |
| `numeric-md` | Plus Jakarta Sans | 20px | 20px | 600 | Angka card dan tabel |

Aturan angka:

- Gunakan `font-variant-numeric: tabular-nums` untuk rupiah, kWh, kWp, volt, ampere, dan persentase.
- Angka selalu memiliki satuan atau label yang dapat dipahami.
- Gunakan format Indonesia: `Rp12.500.000`, `1.250 kWh`, dan `12,5%`.
- Hindari kapital semua untuk kalimat panjang.

## DESIGN-SPACE-001 - Spacing dan container

- Base spacing: 4px.
- Stack kecil: 8px.
- Stack normal: 16px.
- Stack besar: 32px.
- Padding card standar: 24px desktop, 16px mobile.
- Padding card utama: 32px desktop, 20px mobile.
- Jarak section publik: 80px desktop, 56px tablet, 40px mobile.
- Lebar maksimum konten publik: 1280px.
- Margin mobile: 16px.
- Gutter desktop: 24px.
- Lebar artikel: 720-800px.
- Lebar form autentikasi: maksimum 440px.
- Lebar form kalkulator/pengajuan: maksimum 960px.

## DESIGN-BREAKPOINT-001 - Responsive breakpoint

| Nama | Rentang | Pola utama |
|---|---|---|
| Mobile | `< 640px` | Satu kolom, navigation drawer |
| Small tablet | `640-767px` | Satu atau dua kolom ringan |
| Tablet | `768-1023px` | Dua kolom, sidebar menjadi drawer |
| Desktop | `1024-1279px` | Grid 12 kolom dan sidebar tetap |
| Large desktop | `>= 1280px` | Container maksimum 1280px |

Uji juga ukuran di antara breakpoint. Jangan hanya menguji tepat pada 640, 768, 1024, dan 1280px.

## DESIGN-SHAPE-001 - Radius, border, dan elevation

- Input, button, badge: radius 8px.
- Card normal: radius 12px.
- Featured card, article card, modal: radius 16px.
- Hero visual dan container besar: radius 24px.
- Pill/chip: radius penuh.
- Border card: 1px `border-subtle`.
- Shadow card: opacity maksimal 8%, blur sekitar 24px.
- Hover card menaikkan shadow secara halus tanpa mengubah layout.
- Glass panel: white 80%, backdrop blur 12px, border putih transparan, dan fallback solid white.

## DESIGN-MOTION-001 - Motion

- Micro-interaction: 150-200ms.
- Drawer/modal: 200-300ms.
- Easing standar: ease-out saat masuk, ease-in saat keluar.
- Jangan menganimasikan angka telemetry secara berlebihan.
- Pulse hanya untuk status live penting, maksimal satu elemen dalam viewport.
- Hormati `prefers-reduced-motion`; ganti pulse dan slide dengan perubahan state instan atau fade minimal.

## DESIGN-ICON-001 - Ikon

- Gunakan satu keluarga ikon soft-linear.
- Stroke sekitar 1.5-2px dengan rounded cap.
- Ikon penting selalu memiliki label atau accessible name.
- Jangan mencampur ikon filled, outline, dan emoji dalam satu konteks.

## DESIGN-ASSET-001 - Aset visual tersedia

| Aset | Path publik | Penggunaan |
|---|---|---|
| Hero rumah surya | `/assets/images/solarsync-hero-home.webp` | Hero landing page |
| Calculator illustration | `/assets/images/solarsync-calculator-illustration.webp` | Intro kalkulator atau hasil |
| Installation team | `/assets/images/solarsync-installation-team.webp` | Proses instalasi dan trust section |
| Monitoring flow | `/assets/images/solarsync-monitoring-flow.webp` | Smart monitoring dan dashboard preview |

Gunakan WebP pada website. PNG asli hanya untuk kebutuhan edit atau ekspor ulang. Gambar hero tidak di-lazy-load jika menjadi elemen LCP; gambar lain memakai lazy loading.

---

# RAG-04 - Arsitektur informasi dan akses

## ROUTE-MATRIX-001

| ID | Route | Halaman | Role |
|---|---|---|---|
| PAGE-PUB-001 | `/` | Landing Page | Publik |
| PAGE-PUB-002 | `/calculator` | Solar Calculator | Publik |
| PAGE-PUB-003 | `/calculator/result` | Hasil Calculator | Publik |
| PAGE-PUB-004 | `/packages` | Katalog Paket | Publik |
| PAGE-PUB-005 | `/packages/:slug` | Detail Paket | Publik |
| PAGE-PUB-006 | `/knowledge` | Knowledge Center | Publik |
| PAGE-PUB-007 | `/knowledge/:slug` | Detail Artikel | Publik |
| PAGE-PUB-008 | `/faq` | FAQ | Publik |
| PAGE-PUB-009 | `/installation-request` | Pengajuan Instalasi | Publik/customer |
| PAGE-AUTH-001 | `/login` | Login | Publik |
| PAGE-AUTH-002 | `/forgot-password` | Lupa Kata Sandi | Publik |
| PAGE-AUTH-003 | `/reset-password` | Reset Kata Sandi | Publik dengan token |
| PAGE-CUS-001 | `/dashboard` | Ringkasan Customer | Customer |
| PAGE-CUS-002 | `/dashboard/energy` | Detail Energi | Customer |
| PAGE-CUS-003 | `/dashboard/impact` | Dampak dan Penghematan | Customer |
| PAGE-CUS-004 | `/dashboard/devices` | Perangkat | Customer |
| PAGE-CUS-005 | `/dashboard/installation` | Instalasi | Customer |
| PAGE-CUS-006 | `/dashboard/profile` | Profil dan Keamanan | Customer |
| PAGE-ADM-001 | `/admin` | Ringkasan Admin | Admin |
| PAGE-ADM-002 | `/admin/requests` | Daftar Pengajuan | Admin |
| PAGE-ADM-003 | `/admin/requests/:id` | Detail Pengajuan | Admin |
| PAGE-ADM-004 | `/admin/customers` | Daftar Customer | Admin |
| PAGE-ADM-005 | `/admin/customers/:id` | Detail Customer | Admin |
| PAGE-ADM-006 | `/admin/products` | Produk/Paket | Admin |
| PAGE-ADM-007 | `/admin/products/new` | Tambah Produk | Admin |
| PAGE-ADM-008 | `/admin/products/:id/edit` | Edit Produk | Admin |
| PAGE-ADM-009 | `/admin/articles` | Artikel | Admin |
| PAGE-ADM-010 | `/admin/articles/new` | Tambah Artikel | Admin |
| PAGE-ADM-011 | `/admin/articles/:id/edit` | Edit Artikel | Admin |
| PAGE-ADM-012 | `/admin/devices` | Perangkat | Admin |
| PAGE-ADM-013 | `/admin/devices/:id` | Detail Perangkat | Admin |

## ACCESS-001 - Route guard

- Route publik dapat dibuka tanpa autentikasi.
- Customer yang membuka route admin menerima halaman forbidden atau diarahkan ke dashboard customer dengan pemberitahuan singkat.
- Admin yang membuka route customer dapat diarahkan ke admin dashboard kecuali role admin juga memiliki akun customer yang valid.
- Pengguna belum login yang membuka route terproteksi diarahkan ke login dengan parameter tujuan kembali.
- Setelah login, pengguna kembali ke route valid yang sebelumnya dituju.
- Penyembunyian menu bukan pengganti otorisasi backend.

---

# RAG-05 - Global shell dan navigasi

## SHELL-PUBLIC-001

### Desktop

- Header tinggi sekitar 72-80px.
- Kiri: logo SolarSync.
- Tengah: Beranda, Kalkulator, Paket, Edukasi, FAQ.
- Kanan: Login dan CTA `Hitung Kebutuhan`.
- Header dapat menjadi sticky setelah scroll, memakai permukaan solid atau translucent dengan kontras terjaga.

### Mobile

- Logo di kiri, menu button di kanan.
- Menu menggunakan drawer atau panel layar penuh.
- CTA utama terlihat di dalam menu.
- Menu menutup setelah route dipilih.
- Fokus kembali ke menu button setelah drawer ditutup.

### Footer

- Ringkasan merek.
- Navigasi produk dan edukasi.
- Kontak bisnis yang sudah diverifikasi.
- Kebijakan privasi dan syarat layanan.
- Informasi hak cipta.
- Jangan menampilkan alamat, sertifikasi, atau partner yang belum valid.

## SHELL-CUSTOMER-001

### Desktop

- Sidebar kiri: Ringkasan, Energi, Dampak, Perangkat, Instalasi, Profil.
- Header konten: judul halaman, site selector jika diperlukan, waktu pembaruan, menu akun.
- Sidebar dapat collapse jika ruang terbatas tetapi ikon tetap memiliki tooltip.

### Mobile/tablet

- Sidebar berubah menjadi drawer.
- Header menampilkan menu, nama halaman, dan status singkat.
- Site selector menggunakan dropdown lebar penuh bila customer memiliki beberapa site.

## SHELL-ADMIN-001

### Desktop

- Sidebar permanen: Ringkasan, Pengajuan, Customer, Produk, Artikel, Perangkat.
- Header: breadcrumb, pencarian kontekstual jika ada, notifikasi operasional, menu admin.
- Konten tabel menggunakan lebar yang cukup tanpa memadatkan kolom secara berlebihan.

### Mobile/tablet

- Sidebar menjadi drawer.
- Filter kompleks dibuka melalui filter drawer.
- Tabel dapat berubah menjadi card list atau horizontal scroll terkendali.
- Primary action tetap mudah dijangkau tetapi tidak menutupi konten.

---

# RAG-06 - Komponen bersama

## COMP-BUTTON-001

Varian:

- Primary: emerald, untuk aksi utama.
- Accent: Solar Gold, untuk kalkulator atau pengajuan yang sangat penting.
- Secondary: surface putih dengan border emerald.
- Ghost: tanpa background untuk aksi ringan.
- Danger: merah untuk tindakan destruktif.
- Icon button: wajib memiliki tooltip dan accessible label.

State wajib: default, hover, pressed, focus-visible, disabled, loading. Loading mempertahankan lebar button dan mencegah submit berulang.

## COMP-FORM-001

Setiap field memiliki:

- Label terlihat.
- Penanda wajib bila relevan.
- Placeholder hanya sebagai contoh, bukan pengganti label.
- Helper text untuk satuan atau format.
- Error text spesifik.
- Focus-visible yang jelas.
- Disabled dan read-only yang berbeda.

Komponen: input, numeric input, currency input, textarea, select, searchable select, checkbox, radio, range slider, date input, password input, dan file upload.

## COMP-UPLOAD-001

- Mendukung pilih file dan drag-and-drop pada desktop.
- Menampilkan nama, ukuran, preview jika aman, progress, sukses, dan gagal.
- Menjelaskan format dan batas ukuran sebelum upload.
- File gagal dapat dicoba ulang atau dihapus.
- Validasi frontend tidak menggantikan validasi backend.

## COMP-CARD-001

Jenis card:

- Content card untuk artikel dan paket.
- Stat card untuk angka utama.
- Status card untuk perangkat atau instalasi.
- Action card untuk CTA.
- Empty-state card.

Card yang dapat diklik harus memiliki target klik yang jelas dan focus-visible. Hindari card di dalam card secara berlebihan.

## COMP-STATUS-001

Badge status memakai ikon, teks, dan warna. Status kanonis UI:

- Normal.
- Peringatan.
- Offline.
- Belum terhubung.
- Stale.
- Diproses.
- Selesai.
- Gagal.

## COMP-TABLE-001

- Header tetap terbaca dan memiliki label sorting.
- Pencarian, filter, sort, dan pagination berasal dari server untuk data besar.
- Filter aktif terlihat sebagai chip dan dapat dihapus satu per satu.
- State filter tersimpan pada query URL.
- Row action memakai menu dengan label jelas.
- Empty hasil filter berbeda dari empty karena belum ada data.
- Mobile memakai card list untuk data prioritas atau scroll horizontal dengan kolom identitas tetap terlihat.

## COMP-DIALOG-001

- Judul menjelaskan tindakan.
- Isi menjelaskan konsekuensi.
- Tombol batal menjadi pilihan aman.
- Tindakan destruktif memakai button danger.
- Fokus terkunci di modal dan kembali ke pemicu ketika ditutup.
- Menekan Escape menutup modal non-kritis.

## COMP-TOAST-001

- Toast digunakan untuk feedback singkat, bukan error yang membutuhkan perbaikan field.
- Sukses dapat hilang otomatis.
- Error penting tetap tampil lebih lama dan menyediakan aksi retry bila relevan.
- Toast diumumkan melalui live region.

## COMP-CHART-001

- Judul, periode, satuan, legend, tooltip, dan waktu pembaruan tersedia.
- Rentang waktu: hari, minggu, bulan, tahun sesuai endpoint.
- Pengguna dapat melihat ringkasan angka atau tabel alternatif.
- Grafik tidak boleh mengisi data hilang sebagai nol.
- Loading menggunakan skeleton bentuk grafik.
- Error grafik tidak merusak stat card lain.

## COMP-EMPTY-ERROR-001

Setiap empty/error state memiliki:

- Ikon atau ilustrasi ringan.
- Judul singkat.
- Penjelasan penyebab yang diketahui.
- Primary recovery action.
- Secondary help action jika diperlukan.

---

# RAG-07 - Halaman publik

## PAGE-PUB-001 - Landing Page

**Route:** `/`  
**Role:** publik  
**Tujuan:** menjelaskan nilai SolarSync dan mengarahkan pengunjung ke kalkulator atau konsultasi.

### Struktur halaman

1. Header publik.
2. Hero dua kolom.
3. Trust/value strip.
4. Masalah dan manfaat.
5. Cara kerja SolarSync.
6. Segmentasi rumah tangga dan UMKM.
7. Paket unggulan.
8. Preview Solar Calculator.
9. Preview smart monitoring.
10. Dampak lingkungan/SDG 7.
11. Testimoni terverifikasi.
12. FAQ ringkas.
13. CTA akhir.
14. Footer.

### Hero

- Eyebrow: konteks energi bersih.
- H1 maksimal dua sampai tiga baris.
- Deskripsi maksimal tiga baris desktop.
- Primary CTA: `Hitung Kebutuhan Panel`.
- Secondary CTA: `Konsultasi Instalasi` atau `Pelajari Cara Kerja`.
- Gunakan `/assets/images/solarsync-hero-home.webp`.
- Desktop menempatkan copy di kiri dan visual di kanan.
- Mobile menempatkan copy sebelum visual.

### Cara kerja

Tahap ringkas: pelajari, hitung kebutuhan, pilih solusi, ajukan survei, instalasi, monitoring. Gunakan step card atau timeline; setiap tahap memiliki satu kalimat.

### Preview monitoring

- Gunakan visual `/assets/images/solarsync-monitoring-flow.webp`.
- Tampilkan contoh data sebagai demo dan beri label `Contoh tampilan`, bukan data nyata.
- CTA: `Lihat fitur monitoring` atau diarahkan ke login bila demo detail tidak tersedia.

### State dan responsif

- Konten utama tetap tersedia walau gambar gagal.
- Testimoni section disembunyikan jika belum ada data terverifikasi.
- Paket unggulan memakai carousel hanya pada mobile; desktop menggunakan grid.
- CTA utama terlihat pada viewport awal perangkat umum.

### Acceptance criteria

- Pengunjung memahami layanan utama tanpa membuka menu lain.
- CTA kalkulator dan konsultasi dapat digunakan dengan keyboard.
- Tidak ada statistik atau testimoni fiktif.
- Hero memiliki alt text yang sesuai atau dianggap dekoratif jika informasi sudah ada di copy.
- Gambar non-hero memakai lazy loading.

## PAGE-PUB-002 - Solar Calculator

**Route:** `/calculator`  
**Role:** publik  
**Tujuan:** mengumpulkan input secukupnya untuk estimasi awal tanpa membebani pengguna.

### Layout

- Header sederhana.
- Judul, deskripsi estimasi, dan indikator progres.
- Wizard maksimal empat langkah.
- Form di kiri/utama; summary input dapat sticky di desktop.
- Mobile hanya menampilkan satu langkah dan satu primary action per layar.

### Langkah 1 - Profil kebutuhan

- Jenis pengguna: rumah tangga, UMKM, sekolah, lainnya.
- Lokasi/kota.
- Daya listrik terpasang.
- Konsumsi bulanan kWh.
- Tagihan bulanan opsional jika kWh diketahui.

### Langkah 2 - Kondisi bangunan

- Luas atap tersedia.
- Tipe atap jika dibutuhkan perhitungan.
- Arah atap jika diketahui.
- Tingkat bayangan: minim, sebagian, banyak, tidak tahu.
- Gunakan opsi `Tidak tahu`; jangan memaksa pengguna awam menebak.

### Langkah 3 - Target pengguna

- Persentase kebutuhan yang ingin ditutupi.
- Preferensi on-grid, hybrid, off-grid, atau belum tahu jika didukung backend.
- Jelaskan bahwa baterai memengaruhi biaya.

### Langkah 4 - Review

- Ringkasan seluruh input.
- Tombol edit per kelompok.
- Checkbox persetujuan bila data dikirim ke backend.
- Primary CTA: `Lihat Estimasi`.

### Validasi

- Numeric input memiliki min/max dari backend atau konfigurasi.
- Satuan selalu terlihat.
- Error tidak menghapus input.
- Tombol berikutnya fokus pada error pertama jika validasi gagal.
- Draft non-sensitif bertahan selama sesi.

### Acceptance criteria

- Pengguna dapat maju dan mundur tanpa kehilangan input.
- Progress dapat dipahami tanpa mengandalkan warna.
- Submit ganda dicegah.
- Kegagalan jaringan menyediakan retry.
- Kalkulator dapat selesai pada mobile tanpa horizontal scroll.

## PAGE-PUB-003 - Hasil Solar Calculator

**Route:** `/calculator/result`  
**Role:** publik  
**Tujuan:** menjelaskan rekomendasi awal dan mendorong konsultasi atau pengajuan.

### Hierarki hasil

1. Label `Estimasi awal`.
2. Kapasitas sistem dalam kWp.
3. Perkiraan jumlah dan daya panel.
4. Produksi bulanan dan tahunan.
5. Kisaran biaya.
6. Penghematan bulanan/tahunan.
7. Periode balik modal.
8. Estimasi pengurangan emisi.
9. Paket yang relevan jika ada.
10. Asumsi dan disclaimer.

### Interaksi

- `Ubah Data` kembali ke kalkulator dengan input tetap ada.
- `Ajukan Konsultasi` meneruskan input ke form pengajuan.
- Pengguna dapat melihat rincian asumsi melalui accordion.
- Jangan memerlukan login hanya untuk melihat hasil.

### State

- Jika result dibuka tanpa input/token valid, arahkan ke calculator dengan penjelasan.
- Jika sebagian perhitungan gagal, tampilkan hasil yang valid dan tandai bagian yang tidak tersedia.
- Jangan mengganti data tidak tersedia dengan `0`.

### Acceptance criteria

- Semua angka memiliki satuan dan periode.
- Mata uang memakai format Indonesia.
- Kata "pasti" tidak digunakan.
- CTA pengajuan tidak meminta ulang input kalkulator yang sudah tersedia.

## PAGE-PUB-004 - Katalog Paket

**Route:** `/packages`  
**Role:** publik  
**Tujuan:** membantu pengguna menemukan solusi berdasarkan segmen dan kapasitas.

### Struktur

- Header dan intro.
- Filter segmen: rumah, UMKM, sekolah/instansi.
- Filter kapasitas atau kebutuhan.
- Grid package card.
- Section bantuan memilih.
- CTA konsultasi.

### Package card

- Nama paket.
- Segmen.
- Kapasitas kWp.
- Estimasi produksi.
- Harga `mulai dari` atau `estimasi`.
- Ringkasan komponen.
- Garansi jika data resmi tersedia.
- CTA `Lihat Detail`.

### State

- Skeleton grid ketika loading.
- Empty filter menawarkan reset filter.
- Error menyediakan retry.
- Filter aktif tersimpan di URL.

## PAGE-PUB-005 - Detail Paket

**Route:** `/packages/:slug`  
**Role:** publik  
**Tujuan:** menjelaskan isi, manfaat, batasan, dan langkah selanjutnya dari paket.

### Struktur

- Breadcrumb.
- Nama, kapasitas, harga indikatif, dan CTA.
- Galeri visual yang terkontrol.
- Cocok untuk siapa.
- Daftar komponen dan spesifikasi.
- Estimasi produksi dan penghematan.
- Cakupan layanan.
- Yang tidak termasuk.
- Garansi dan catatan.
- FAQ paket.
- CTA konsultasi/pengajuan dengan package ID terisi otomatis.

### Acceptance criteria

- Harga indikatif diberi label jelas.
- Spesifikasi tidak disembunyikan hanya dalam gambar.
- Paket tidak ditemukan menampilkan 404 dengan tautan kembali ke katalog.

## PAGE-PUB-006 - Knowledge Center

**Route:** `/knowledge`  
**Role:** publik  
**Tujuan:** meningkatkan literasi dan membantu keputusan pengguna.

### Struktur

- Judul dan deskripsi.
- Featured article jika ada.
- Search input.
- Filter kategori.
- Grid/list article card.
- Pagination.

### Article card

- Thumbnail.
- Kategori.
- Judul.
- Ringkasan singkat.
- Tanggal publikasi.
- Estimasi waktu baca jika tersedia.

### State

- Search menggunakan debounce.
- Empty search menawarkan hapus filter.
- Broken image memakai fallback visual.
- Filter dan halaman tersimpan di URL.

## PAGE-PUB-007 - Detail Artikel

**Route:** `/knowledge/:slug`  
**Role:** publik  
**Tujuan:** menyampaikan edukasi dengan struktur yang mudah dibaca.

### Struktur

- Breadcrumb.
- Kategori, H1, ringkasan, tanggal, penulis terverifikasi.
- Hero image.
- Isi artikel dengan lebar baca terbatas.
- Table of contents untuk artikel panjang.
- Referensi/sumber jika artikel memakai data.
- Artikel terkait.
- CTA kalkulator atau konsultasi yang relevan.

### Aturan konten

- HTML dari CMS harus disanitasi.
- Heading tidak melompati hierarki.
- Tabel dapat digulir pada mobile.
- Video memiliki judul dan fallback link.
- Klaim energi, biaya, dan regulasi menyebut sumber serta tanggal.

## PAGE-PUB-008 - FAQ

**Route:** `/faq`  
**Role:** publik  
**Tujuan:** menjawab hambatan sebelum pengguna menghitung atau mengajukan instalasi.

### Struktur

- Search FAQ.
- Kategori: dasar panel, biaya, instalasi, garansi, monitoring, akun.
- Accordion accessible.
- CTA bantuan jika jawaban tidak ditemukan.

### Acceptance criteria

- Accordion dapat dioperasikan dengan keyboard.
- Status buka/tutup diumumkan kepada assistive technology.
- Search tanpa hasil menyediakan jalur konsultasi.

## PAGE-PUB-009 - Pengajuan Instalasi

**Route:** `/installation-request`  
**Role:** publik/customer  
**Tujuan:** mengumpulkan data yang cukup untuk verifikasi dan survei tanpa mengulang input.

### Wizard pengajuan

#### Langkah 1 - Identitas

- Nama lengkap.
- Nomor telepon.
- Email jika diperlukan.
- Preferensi cara dihubungi jika disetujui bisnis.

#### Langkah 2 - Lokasi dan bangunan

- Alamat pemasangan.
- Kota/provinsi.
- Jenis bangunan.
- Lokasi peta hanya jika tersedia dan memiliki fallback input manual.

#### Langkah 3 - Kebutuhan dan dokumen

- Hasil kalkulator jika berasal dari calculator.
- Paket yang dipilih jika berasal dari package detail.
- Foto atap/bangunan.
- Foto/dokumen tagihan.
- Catatan tambahan.

#### Langkah 4 - Review dan consent

- Ringkasan data.
- Persetujuan pengolahan data.
- Link kebijakan privasi.
- CTA `Kirim Pengajuan`.

### Success state

- Nomor tiket.
- Waktu pengajuan.
- Tahap berikutnya.
- Kanal kontak resmi.
- CTA login atau kembali ke beranda sesuai status akun.

### Acceptance criteria

- Validasi nomor telepon, email, tipe, dan ukuran file tersedia.
- Progress upload terlihat.
- Network error tidak menghapus teks yang sudah diisi.
- Submit ganda dicegah.
- Nomor tiket dapat disalin.

---

# RAG-08 - Authentication

## PAGE-AUTH-001 - Login

**Route:** `/login`  
**Tujuan:** memberikan akses customer/admin dengan aman dan jelas.

### Layout

- Desktop dapat memakai split layout dengan brand visual dan form.
- Mobile menampilkan form terlebih dahulu.
- Form maksimum 440px.
- Field identifier sesuai keputusan backend: email, telepon, atau keduanya.
- Password dengan show/hide.
- Link lupa kata sandi.
- Primary CTA `Masuk`.

### State dan keamanan UX

- Loading mencegah submit berulang.
- Error generik tidak mengungkap apakah akun terdaftar.
- Session expired menampilkan penjelasan sebelum login ulang.
- Setelah login, redirect berdasarkan role dan intended route.

## PAGE-AUTH-002 - Lupa Kata Sandi

- Input identifier.
- Penjelasan singkat proses.
- Success message bersifat generik.
- Link kembali ke login.
- Cooldown/resend state mengikuti backend.

## PAGE-AUTH-003 - Reset Kata Sandi

- Password baru dan konfirmasi.
- Checklist persyaratan password yang diperbarui secara accessible.
- Invalid/expired token memiliki jalur meminta link baru.
- Success mengarahkan ke login.

---

# RAG-09 - Customer dashboard

## PAGE-CUS-001 - Ringkasan Energi

**Route:** `/dashboard`  
**Role:** customer  
**Tujuan:** menjawab "Apakah sistem saya sehat dan apa hasilnya hari ini?"

### Hierarki atas

- Site selector jika terdapat lebih dari satu site.
- Status sistem: normal, peringatan, offline, belum terhubung.
- Waktu terakhir data diterima.
- Tombol refresh yang tidak memicu reload seluruh halaman.

### KPI utama

- Produksi hari ini.
- Konsumsi hari ini.
- Surplus/self-consumption jika tersedia.
- Penghematan estimasi.
- Pengurangan emisi.

### Konten berikutnya

- Grafik produksi vs konsumsi hari ini.
- Ringkasan performa minggu ini.
- Status perangkat ringkas.
- Progres instalasi jika belum selesai.
- Alert yang dapat ditindaklanjuti.

### State penting

- Nilai nol: tampilkan `0` jika backend benar-benar mengirim nol.
- Missing: tampilkan `--` dan penjelasan.
- Stale: tampilkan waktu terakhir dan badge peringatan.
- Offline: sembunyikan klaim produksi real-time; tampilkan data historis terakhir dengan label.
- Partial error: card yang berhasil tetap ditampilkan.

### Mobile

- Status dan last update berada paling atas.
- KPI menjadi grid dua kolom atau satu kolom pada layar sempit.
- Grafik memiliki tinggi minimum dan horizontal gesture tidak mengganggu scroll halaman.

### Acceptance criteria

- Kondisi sistem dapat dipahami tanpa membaca grafik.
- Legend tidak bergantung pada warna saja.
- Perubahan periode tidak memuat ulang halaman penuh.
- Loading skeleton, empty, partial error, full error, stale, dan offline tersedia.

## PAGE-CUS-002 - Detail Energi

**Route:** `/dashboard/energy`  
**Tujuan:** mengeksplorasi produksi dan konsumsi berdasarkan waktu.

### Struktur

- Date/range selector.
- Preset hari, minggu, bulan, tahun.
- KPI periode.
- Grafik utama produksi dan konsumsi.
- Breakdown impor/ekspor/baterai jika didukung.
- Tabel data ringkas atau tombol lihat data tabel.
- Download laporan hanya jika backend menyediakan.

### Interaksi

- Filter tersimpan pada URL.
- Tooltip menampilkan timestamp, nilai, dan satuan.
- Zoom hanya jika benar-benar diperlukan dan dapat di-reset.
- Periode tanpa data menampilkan empty state, bukan grafik datar nol.

## PAGE-CUS-003 - Dampak dan Penghematan

**Route:** `/dashboard/impact`  
**Tujuan:** menjelaskan manfaat finansial dan lingkungan secara bertanggung jawab.

### Struktur

- Penghematan periode.
- Penghematan kumulatif.
- Estimasi CO2 yang dihindari.
- Ekuivalensi lingkungan jika metodologi tersedia.
- Grafik tren.
- Accordion metodologi dan asumsi.

### Aturan

- Tampilkan periode dan rumus/sumber konversi.
- Ekuivalensi pohon tidak digunakan jika metodologi belum disetujui.
- Nilai finansial diberi label estimasi jika bukan data tagihan aktual.

## PAGE-CUS-004 - Perangkat

**Route:** `/dashboard/devices`  
**Tujuan:** menunjukkan perangkat yang terhubung dan kondisi koneksinya.

### Device card/list

- Nama perangkat.
- Jenis perangkat.
- Site.
- Status.
- Last seen.
- Versi firmware jika aman dan tersedia.
- Aksi detail atau bantuan.

### State

- Offline card menjelaskan waktu terakhir terhubung.
- Belum terhubung menyediakan instruksi aktivasi atau kontak installer.
- Jangan mengekspos credential, topic MQTT privat, atau secret.

## PAGE-CUS-005 - Instalasi

**Route:** `/dashboard/installation`  
**Tujuan:** menunjukkan informasi site dan progres instalasi.

### Struktur

- Nomor tiket.
- Alamat site.
- Paket/kapasitas.
- Progress journey.
- Timeline perubahan status.
- Jadwal survei/instalasi jika tersedia.
- Dokumen yang boleh diakses customer.
- Kontak bantuan.

### Status dasar

`Diajukan -> Diverifikasi -> Menunggu Survei -> Penawaran -> Disetujui -> Dijadwalkan -> Instalasi -> Selesai`

UI hanya menawarkan status dari backend. Jangan mengizinkan customer mengubah status operasional kecuali ada aksi bisnis yang eksplisit seperti menyetujui penawaran.

## PAGE-CUS-006 - Profil dan Keamanan

**Route:** `/dashboard/profile`  
**Tujuan:** mengelola data akun tanpa mencampurkan data instalasi.

### Section

- Informasi pribadi.
- Nomor telepon/email.
- Preferensi notifikasi jika tersedia.
- Ubah kata sandi.
- Sesi/perangkat login jika backend mendukung.
- Privasi dan bantuan.

### UX

- Perubahan tersimpan per section.
- Field sensitif membutuhkan verifikasi sesuai backend.
- Unsaved changes memiliki warning.
- Aksi logout tersedia jelas.

---

# RAG-10 - Admin dashboard

## ADMIN-GENERAL-001 - Prinsip admin

- Efisiensi dan pencegahan kesalahan lebih penting daripada dekorasi.
- Gunakan surface solid untuk tabel dan form.
- Glassmorphism hanya boleh muncul pada summary card ringan.
- Semua mutasi menunggu konfirmasi backend sebelum UI menyatakan berhasil.
- Filter, sort, search, dan pagination tersimpan di URL.
- Data sensitif hanya tampil jika role dan kebutuhan kerja mengizinkan.

## PAGE-ADM-001 - Ringkasan Admin

**Route:** `/admin`  
**Tujuan:** menunjukkan pekerjaan yang perlu ditindaklanjuti.

### KPI

- Pengajuan baru.
- Menunggu verifikasi.
- Menunggu survei.
- Instalasi berjalan.
- Customer aktif.
- Perangkat offline.

### Konten

- Daftar pengajuan terbaru.
- Perangkat yang membutuhkan perhatian.
- Ringkasan status instalasi.
- Quick action ke pengajuan atau produk.

### Aturan

- KPI dapat diklik jika menuju daftar yang sudah terfilter.
- Alert operasional ditempatkan sebelum informasi sekunder.
- Tidak perlu grafik dekoratif yang tidak membantu keputusan.

## PAGE-ADM-002 - Daftar Pengajuan

**Route:** `/admin/requests`  
**Tujuan:** mencari, menyaring, dan memproses pengajuan.

### Kolom prioritas

- Nomor tiket.
- Nama customer.
- Lokasi.
- Segmen.
- Tanggal pengajuan.
- Status.
- PIC jika tersedia.
- Aksi.

### Filter

- Search tiket/nama/telepon sesuai izin.
- Status.
- Rentang tanggal.
- Lokasi.
- Segmen.
- PIC jika ada.

### State

- Default sort terbaru.
- Empty belum ada pengajuan berbeda dari empty hasil filter.
- Bulk action tidak dibuat pada MVP kecuali ada kebutuhan bisnis eksplisit.

## PAGE-ADM-003 - Detail Pengajuan

**Route:** `/admin/requests/:id`  
**Tujuan:** melihat seluruh konteks dan memajukan proses secara aman.

### Layout desktop

- Kolom utama: identitas, lokasi, kebutuhan, hasil kalkulator, dokumen, catatan.
- Kolom samping: status, timeline, PIC, aksi berikutnya.

### Aksi

- Ubah status hanya ke transisi yang disediakan backend.
- Tambahkan catatan internal jika fitur tersedia.
- Jadwalkan survei jika backend mendukung.
- Lihat dokumen secara aman.
- Hubungi customer melalui kanal resmi.

### Pencegahan kesalahan

- Perubahan status meminta konfirmasi dan catatan bila dibutuhkan.
- Aksi tidak boleh optimistically dianggap sukses.
- Gagal update mempertahankan input dan status sebelumnya.
- Dokumen sensitif tidak memiliki URL publik permanen.

## PAGE-ADM-004 - Daftar Customer

**Route:** `/admin/customers`  
**Tujuan:** mencari customer dan melihat hubungan akun-site-device.

### Kolom

- Nama.
- Kontak tersamarkan sesuai kebutuhan.
- Jumlah site.
- Status instalasi.
- Status sistem terakhir.
- Tanggal bergabung.
- Aksi detail.

### Filter

- Search.
- Status instalasi.
- Status perangkat.
- Lokasi.

## PAGE-ADM-005 - Detail Customer

**Route:** `/admin/customers/:id`  
**Tujuan:** melihat profil, site, instalasi, dan perangkat terkait.

### Tabs

- Ringkasan.
- Site/instalasi.
- Perangkat.
- Pengajuan.
- Aktivitas/audit jika tersedia.

### Aturan privasi

- Tampilkan data minimum yang diperlukan.
- Aksi edit sensitif mengikuti permission backend.
- Jangan menampilkan password, token, atau credential perangkat.

## PAGE-ADM-006 - Daftar Produk/Paket

**Route:** `/admin/products`  
**Tujuan:** mengelola paket yang terlihat pada katalog publik.

### Kolom

- Nama.
- Segmen.
- Kapasitas.
- Harga/kisaran.
- Status draft/published.
- Terakhir diperbarui.
- Aksi.

### Aksi

- Tambah produk.
- Edit.
- Preview.
- Publish/unpublish dengan konfirmasi.
- Hapus hanya jika aturan backend mengizinkan; prefer archive.

## PAGE-ADM-007 - Tambah Produk

**Route:** `/admin/products/new`  
**Tujuan:** membuat paket dengan data lengkap dan konsisten.

### Section form

- Identitas: nama, slug, segmen, status.
- Kapasitas dan estimasi.
- Harga dan label harga.
- Komponen/spesifikasi.
- Cakupan dan pengecualian.
- Garansi.
- Media.
- SEO.

### UX

- Form dibagi per section, bukan modal kecil.
- Preview sebelum publish.
- Unsaved changes warning.
- Error ditempatkan pada section dan summary error di atas jika banyak.

## PAGE-ADM-008 - Edit Produk

**Route:** `/admin/products/:id/edit`  
**Tujuan:** memperbarui paket tanpa kehilangan data valid.

Gunakan struktur PAGE-ADM-007 dengan tambahan metadata terakhir diperbarui, preview publik, dan status publish. Jangan menimpa perubahan bila backend mendeteksi konflik versi.

## PAGE-ADM-009 - Daftar Artikel

**Route:** `/admin/articles`  
**Tujuan:** mengelola konten Knowledge Center.

### Kolom

- Judul.
- Kategori.
- Penulis.
- Status.
- Tanggal publish.
- Terakhir diperbarui.
- Aksi.

### Filter

- Search judul.
- Kategori.
- Status draft/published.
- Penulis jika ada.

## PAGE-ADM-010 - Tambah Artikel

**Route:** `/admin/articles/new`  
**Tujuan:** membuat artikel yang terstruktur, aman, dan SEO-ready.

### Section

- Judul dan slug.
- Ringkasan.
- Kategori.
- Hero image dan alt text.
- Isi artikel.
- Referensi/sumber.
- SEO title dan description.
- Status dan jadwal publish jika tersedia.

### UX editor

- Editor mendukung heading, paragraph, list, link, image, table, dan video embed yang diizinkan.
- Preview tersedia.
- Konten disanitasi backend dan frontend.
- Unsaved changes warning.

## PAGE-ADM-011 - Edit Artikel

**Route:** `/admin/articles/:id/edit`  
**Tujuan:** mengedit konten dengan struktur PAGE-ADM-010.

Tambahkan info terakhir diperbarui, preview publik, status, dan warning jika artikel sedang diedit pengguna lain apabila backend mendukung concurrency.

## PAGE-ADM-012 - Daftar Perangkat

**Route:** `/admin/devices`  
**Tujuan:** menemukan perangkat bermasalah dan hubungan perangkat dengan site.

### Kolom

- Device ID yang aman ditampilkan.
- Nama/type.
- Customer/site.
- Status.
- Last seen.
- Firmware jika tersedia.
- Health indicator.
- Aksi detail.

### Filter

- Search device/customer/site.
- Status normal/warning/offline/belum terhubung.
- Type.
- Last seen range.
- Site/lokasi.

### Aturan

- Offline tidak disamakan dengan telemetry nol.
- Credential dan secret tidak ditampilkan.
- Refresh tabel tidak menghapus filter.

## PAGE-ADM-013 - Detail Perangkat

**Route:** `/admin/devices/:id`  
**Tujuan:** mendiagnosis kondisi perangkat tanpa memberi akses berlebihan.

### Struktur

- Identitas dan relasi site.
- Status dan last seen.
- Ringkasan telemetry terakhir.
- Grafik histori terbatas.
- Firmware/config metadata yang aman.
- Event atau error log yang disanitasi.
- Aksi operasional yang diizinkan backend.

### Aksi sensitif

- Reset, reprovision, unlink, atau perubahan konfigurasi tidak ditampilkan kecuali sudah menjadi fitur backend dengan permission dan audit log.
- Semua aksi sensitif menggunakan confirmation dialog dan menjelaskan dampak.

---

# RAG-11 - State UI dan penanganan error

## STATE-INITIAL

Tampilkan struktur halaman tanpa mengasumsikan data. Jangan memperlihatkan angka palsu.

## STATE-LOADING

- Gunakan skeleton yang menyerupai layout akhir.
- Hindari spinner untuk seluruh dashboard jika partial loading memungkinkan.
- Button loading mempertahankan ukuran.

## STATE-SUCCESS

- Perbarui UI setelah backend mengonfirmasi.
- Tampilkan toast atau inline confirmation.
- Pindahkan fokus jika perubahan menghasilkan konteks baru.

## STATE-EMPTY

Bedakan:

- Belum ada data.
- Tidak ada hasil filter.
- Data belum terhubung.
- Data belum masuk pada periode yang dipilih.

## STATE-VALIDATION-ERROR

- Tampilkan dekat field.
- Gunakan teks spesifik.
- Hubungkan error dengan input secara programatis.
- Jika banyak error, tampilkan summary yang dapat mengarahkan ke field.

## STATE-UNAUTHORIZED

- Session expired: minta login ulang dan simpan intended route yang aman.
- Forbidden: jelaskan bahwa akun tidak memiliki akses dan beri jalur kembali.

## STATE-NOT-FOUND

- Gunakan 404 yang sesuai shell.
- Beri CTA kembali ke halaman induk.
- Jangan memperlihatkan detail internal ID atau stack trace.

## STATE-SERVER-ERROR

- Jelaskan layanan sedang bermasalah.
- Sediakan retry.
- Sediakan reference ID hanya jika backend memberikan ID aman.

## STATE-OFFLINE-NETWORK

- Bedakan browser offline dengan perangkat IoT offline.
- Browser offline: pertahankan konten cache yang aman dan tampilkan banner.
- Device offline: tampilkan last seen dan data historis berlabel.

## STATE-PARTIAL

Card yang berhasil tetap ditampilkan. Error chart tidak boleh menghapus status perangkat dan KPI lain.

## STATE-STALE

- Gunakan badge `Data terlambat` atau `Belum diperbarui`.
- Tampilkan timestamp absolut atau relatif yang jelas.
- Threshold stale dan offline berasal dari backend/configuration, bukan hardcode UI tanpa persetujuan.

---

# RAG-12 - Accessibility

Target minimum adalah WCAG 2.2 Level AA pada seluruh alur utama.

## A11Y-KEYBOARD-001

- Semua aksi dapat dilakukan dengan keyboard.
- Urutan fokus mengikuti urutan visual dan logis.
- Skip link tersedia pada shell utama.
- Focus-visible memiliki kontras kuat.
- Tidak ada keyboard trap selain modal yang memang mengelola fokus.

## A11Y-FORM-001

- Label terhubung ke input.
- Required, helper, dan error dapat dibaca screen reader.
- Placeholder bukan label.
- Range slider memiliki alternatif numeric input bila presisi penting.

## A11Y-COLOR-001

- Teks normal memenuhi rasio kontras AA.
- Status memakai ikon dan teks.
- Grafik memakai pola garis/ikon/label selain warna.

## A11Y-MEDIA-001

- Gambar informatif memiliki alt text.
- Gambar dekoratif memakai alt kosong.
- Video memiliki caption atau transcript jika digunakan sebagai konten utama.

## A11Y-MOTION-001

- Hormati `prefers-reduced-motion`.
- Hindari flashing.
- Auto-rotating carousel dapat dijeda dan tidak menjadi satu-satunya akses konten.

## A11Y-DATA-001

- Grafik memiliki summary atau tabel alternatif.
- Tooltip dapat diakses tanpa mouse bila grafik interaktif.
- Nilai dan satuan tidak hanya dikodekan secara visual.

---

# RAG-13 - Content design dan microcopy

## CONTENT-TONE-001

Nada SolarSync:

- Ahli tetapi tidak menggurui.
- Optimistis tetapi tidak membuat klaim berlebihan.
- Ringkas dan berorientasi tindakan.
- Menjelaskan risiko atau keterbatasan dengan jujur.

## CONTENT-LABEL-001

Gunakan kata kerja jelas:

- `Hitung Kebutuhan Panel`.
- `Lihat Estimasi`.
- `Ajukan Konsultasi`.
- `Kirim Pengajuan`.
- `Simpan Perubahan`.
- `Coba Lagi`.
- `Hapus Filter`.

Hindari label generik seperti `Klik di sini`, `Submit`, atau `OK` jika tindakan dapat disebutkan.

## CONTENT-ERROR-001

Format error:

1. Apa yang gagal.
2. Penyebab yang diketahui tanpa menyalahkan pengguna.
3. Tindakan pemulihan.

Contoh: `Pengajuan belum terkirim karena koneksi terputus. Data yang sudah diisi tetap tersimpan. Periksa koneksi lalu coba lagi.`

## CONTENT-ENERGY-001

- Selalu sertakan satuan.
- Bedakan daya `kW` dan energi `kWh`.
- Kapasitas sistem menggunakan `kWp`.
- Timestamp menggunakan zona waktu yang konsisten dan dikenali pengguna.
- Tooltip menjelaskan istilah teknis pada kemunculan pertama.

---

# RAG-14 - Performance, SEO, privacy, dan analytics

## PERF-001

- Halaman publik menargetkan Core Web Vitals kategori baik.
- Hero image dioptimalkan dan memiliki ukuran intrinsik.
- Route dashboard/admin menggunakan code splitting.
- Library chart hanya dimuat pada halaman yang membutuhkan.
- Search API memakai debounce.
- Tabel besar menggunakan server pagination.
- Request dibatalkan saat route/filter berubah jika hasil lama tidak relevan.

## SEO-001

- Setiap halaman publik memiliki title dan meta description unik.
- Artikel dan paket memakai slug mudah dibaca.
- Breadcrumb memiliki struktur semantik.
- Dashboard/admin memakai `noindex`.
- Open Graph dipakai untuk konten yang dapat dibagikan.
- Klaim finansial/lingkungan menyertakan asumsi atau sumber.

## PRIVACY-001

- Nomor telepon, alamat, tagihan, foto bangunan, token, dan telemetry detail tidak masuk analytics.
- Upload dijelaskan tujuan penggunaannya.
- Consent tidak dicentang otomatis.
- Data sensitif dimasking pada konteks yang tidak membutuhkan nilai lengkap.
- URL file privat tidak bersifat publik permanen.

## ANALYTICS-001

Event minimum:

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

Event tidak boleh mengandung input pribadi atau isi dokumen.

---

# RAG-15 - Acceptance criteria global

Sebuah halaman atau komponen UI dianggap selesai jika seluruh poin relevan berikut terpenuhi:

1. Tujuan halaman dan primary action jelas.
2. Desain mobile, tablet, dan desktop telah diperiksa.
3. Loading, success, empty, error, offline, dan stale state tersedia jika relevan.
4. Validasi dan pesan error bekerja tanpa menghapus input.
5. Keyboard navigation dan focus-visible telah diperiksa.
6. Kontras dan label memenuhi target accessibility.
7. Grafik memiliki satuan, legend, tooltip, dan alternatif nonvisual.
8. Integrasi API mengikuti kontrak dan tidak membuat data palsu.
9. Mutasi hanya dianggap berhasil setelah backend mengonfirmasi.
10. Tidak ada secret atau data pribadi pada bundle, URL, log, maupun analytics.
11. Teks, angka, mata uang, tanggal, dan satuan memakai format konsisten.
12. Empty hasil filter berbeda dari empty belum ada data.
13. Perangkat offline dan missing data tidak ditampilkan sebagai nol.
14. Unsaved changes dilindungi pada form panjang admin.
15. Browser lambat, jaringan terputus, dan data panjang telah diuji.
16. Tidak ada error console yang belum dijelaskan.
17. Product owner menerima alur berdasarkan skenario pengguna.

---

# RAG-16 - Skenario pengujian prioritas

## FLOW-E2E-001 - Visitor menjadi calon customer

1. Visitor membuka landing page.
2. Memilih `Hitung Kebutuhan Panel`.
3. Menyelesaikan empat langkah calculator.
4. Membaca hasil dan asumsi.
5. Memilih `Ajukan Konsultasi`.
6. Form pengajuan menerima data calculator.
7. Visitor upload dokumen dan memberi consent.
8. Sistem menampilkan nomor tiket.

## FLOW-E2E-002 - Customer memeriksa sistem

1. Customer login.
2. Sistem mengarahkan ke dashboard.
3. Customer melihat status, last update, produksi, dan konsumsi.
4. Customer mengubah periode grafik.
5. Customer membuka detail perangkat.
6. Jika perangkat offline, UI menampilkan last seen dan data historis berlabel.

## FLOW-E2E-003 - Admin memproses pengajuan

1. Admin login.
2. Membuka KPI pengajuan baru.
3. Daftar terbuka dengan filter status.
4. Admin membuka detail.
5. Admin memeriksa dokumen dan data calculator.
6. Admin memilih transisi status valid.
7. UI meminta konfirmasi.
8. Status berubah setelah backend berhasil.

## FLOW-E2E-004 - Admin menangani perangkat offline

1. Admin membuka KPI perangkat offline.
2. Daftar perangkat terbuka dengan filter offline.
3. Admin membuka detail perangkat.
4. UI menunjukkan last seen, site, dan histori terakhir.
5. Admin hanya melihat aksi yang diizinkan permission backend.

---

# RAG-17 - Keputusan terbuka yang tidak boleh diasumsikan

Hal berikut harus ditentukan product owner/backend sebelum implementasi final:

1. Login memakai email, nomor telepon, atau keduanya.
2. Customer membuat akun sendiri atau akun dibuat setelah instalasi.
3. Formula dan versi resmi Solar Calculator.
4. Sumber tarif, iradiasi, biaya, ROI, dan faktor emisi.
5. Interval refresh monitoring.
6. Batas waktu stale dan offline.
7. Polling, WebSocket, atau Server-Sent Events setelah MVP.
8. Dukungan satu customer untuk banyak site.
9. Daftar transisi status dan permission setiap role.
10. Harga paket pasti, mulai dari, atau estimasi.
11. Aksi customer pada tahap penawaran.
12. Format, ukuran, dan retensi file upload.
13. Ketersediaan download laporan energi.
14. Ketersediaan teknisi sebagai role MVP.

Jika informasi tersebut belum tersedia, tampilkan UI yang netral atau gunakan mock berlabel. Jangan menetapkan aturan bisnis permanen dari asumsi desain.

---

# RAG-18 - Rekomendasi konteks untuk prompt AI

Untuk menghasilkan satu halaman, berikan minimal chunk berikut kepada AI:

1. `RAG-00` aturan penggunaan.
2. `RAG-02` prinsip UX.
3. Bagian design system yang relevan dari `RAG-03`.
4. Shell yang relevan dari `RAG-05`.
5. Spesifikasi page ID yang diminta.
6. Komponen dari `RAG-06` yang digunakan halaman.
7. State dari `RAG-11`.
8. Accessibility dari `RAG-12`.
9. Acceptance criteria global dari `RAG-15`.

Contoh retrieval query:

- `SolarSync PAGE-PUB-002 calculator wizard mobile validation`.
- `SolarSync PAGE-CUS-001 dashboard stale offline telemetry`.
- `SolarSync PAGE-ADM-003 request detail status confirmation`.
- `SolarSync COMP-TABLE-001 admin filter pagination mobile`.
- `SolarSync DESIGN-CHART-001 production consumption colors`.

Dokumen ini tidak menentukan struktur database, endpoint final, maupun formula kalkulasi. Gunakan kontrak backend sebagai sumber kebenaran untuk data dan permission.
