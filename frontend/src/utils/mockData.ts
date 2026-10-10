import { SolarPackage, Article, FAQItem, InstallationRequest, DeviceStatus, EnergyTelemetryPoint } from '../types';

export const initialPackages: SolarPackage[] = [
  {
    id: 'pkg-1',
    slug: 'solarsync-home-compact-2kwp',
    name: 'Home Compact 2.2 kWp',
    segment: 'household',
    capacityKwp: 2.2,
    tagline: 'Solusi hemat ideal untuk rumah dengan daya PLN 1.300 - 2.200 VA',
    description: 'Paket sistem PLTS On-Grid terintegrasi yang dirancang khusus untuk menurunkan tagihan listrik rumah tangga hingga 65% tanpa baterai mahal.',
    priceFromIdr: 29500000,
    estimatedMonthlyProductionKwh: 264,
    estimatedMonthlySavingsIdr: 381000,
    warrantyPanelsYears: 25,
    warrantyInverterYears: 10,
    warrantyWorkmanshipYears: 3,
    recommendedRoofAreaSqM: 10,
    idealFor: 'Rumah tangga dengan tagihan listrik Rp 600.000 - Rp 1.200.000 / bulan',
    isPopular: false,
    features: [
      '4x Panel Surya Tier-1 Monocrystalline 550 Wp',
      '1x Smart String Inverter 2 kW with Wi-Fi Logger',
      'Struktur Aluminium Anti-Karat & Proteksi Petir Terpadu',
      'Aplikasi Monitoring Real-Time 24/7 SolarSync',
      'Gratis Pengurusan Izin Paralel & Penggantian Meteran Net Metering PLN'
    ],
    components: [
      { name: 'Solar Panel Monocrystalline PERC', specs: 'Tier-1 550 Wp Bifacial Half-Cell', qty: 4 },
      { name: 'Grid-Tied String Inverter', specs: 'Single Phase 2.0 kW (Efisiensi 98.2%)', qty: 1 },
      { name: 'Mounting Racking System', specs: 'Anodized Aluminum Alloy 6005-T5', qty: 1 },
      { name: 'Electrical Balance of System', specs: 'DC/AC Breaker, Surge Protection Device Type II', qty: 1 },
      { name: 'Smart IoT Dongle', specs: 'Wi-Fi / LAN Telemetry Gateway', qty: 1 }
    ],
    includedServices: [
      'Survei teknis & kelayakan atap onsite',
      'Desain engineering & analisis bayangan 3D',
      'Instalasi oleh teknisi bersertifikasi EBT',
      'Pengujian & Commissioning (Uji Laik Operasi)',
      'Asistensi administrasi SLO & Net Metering PLN',
      'Garansi performa output daya panel 25 tahun (min. 84.8%)'
    ],
    exclusions: [
      'Perbaikan atau perkuatan struktur atap yang rapuh',
      'Penambahan kapasitas daya sambungan PLN jika diperlukan',
      'Biaya meteran ekspor-impor PLN (jika ada retribusi lokal non-standar)'
    ]
  },
  {
    id: 'pkg-2',
    slug: 'solarsync-home-plus-5kwp',
    name: 'Home Plus 5.5 kWp',
    segment: 'household',
    capacityKwp: 5.5,
    tagline: 'Pilihan terpopuler untuk kenyamanan rumah modern daya 3.500 - 5.500 VA',
    description: 'Sistem tenaga surya berkinerja tinggi yang mampu menekan tagihan listrik bulanan rumah secara signifikan, menggerakkan AC dan peralatan listrik siang hari secara optimal.',
    priceFromIdr: 68000000,
    estimatedMonthlyProductionKwh: 660,
    estimatedMonthlySavingsIdr: 953000,
    warrantyPanelsYears: 25,
    warrantyInverterYears: 10,
    warrantyWorkmanshipYears: 5,
    recommendedRoofAreaSqM: 25,
    idealFor: 'Rumah modern dengan 3-5 unit AC dan tagihan Rp 1.500.000 - Rp 3.000.000 / bulan',
    isPopular: true,
    features: [
      '10x Panel Surya Tier-1 Monocrystalline 550 Wp High Efficiency',
      '1x Inverter Cerdas On-Grid 5 kW Dual MPPT',
      'Dual MPPT Tracker untuk optimasi atap multi-arah',
      'Integrasi penuh SolarSync Dashboard & Mobile Alert',
      'Full Layanan Turnkey: Survei, Perizinan PLN, Instalasi & Uji Laik Operasi'
    ],
    components: [
      { name: 'Solar Panel Monocrystalline PERC', specs: 'Tier-1 550 Wp N-Type TOPCon (Efisiensi 22.3%)', qty: 10 },
      { name: 'Dual MPPT Smart Inverter', specs: 'Single Phase 5.0 kW with Built-in DC Switch', qty: 1 },
      { name: 'Smart Power Sensor / Meter', specs: 'Zero-Export & Bi-directional Monitoring', qty: 1 },
      { name: 'Mounting Structure Kit', specs: 'Heavy-duty Aluminum & Stainless Steel Fasteners', qty: 1 },
      { name: 'AC/DC Distribution Box', specs: 'IP65 Enclosure with SPD & MCB Schneider/ABB', qty: 1 }
    ],
    includedServices: [
      'Site survey drone 3D thermal mapping',
      'Simulasi produksi energi bulanan berbasis satelit NASA/Solargis',
      'Pemasangan rapi sesuai standar keselamatan PUIL 2020',
      'Uji coba beban & kalibrasi meter energi',
      'Pendampingan sertifikasi Laik Operasi (SLO)',
      'Free preventive maintenance tahun pertama'
    ],
    exclusions: [
      'Baterai backup penyimpanan (opsional add-on Hybrid)',
      'Upgrade instalasi perkabelan internal rumah yang usang'
    ]
  },
  {
    id: 'pkg-3',
    slug: 'solarsync-business-pro-10kwp',
    name: 'Business Pro 11.0 kWp',
    segment: 'business',
    capacityKwp: 11.0,
    tagline: 'Tekan beban operasional ruko, kantor, klinik, atau cafe siang hari',
    description: 'Solusi PLTS 3-Phase komersial yang langsung memangkas biaya listrik di jam operasional bisnis, meningkatkan reputasi hijau (ESG) perusahaan Anda.',
    priceFromIdr: 138000000,
    estimatedMonthlyProductionKwh: 1320,
    estimatedMonthlySavingsIdr: 2046000,
    warrantyPanelsYears: 25,
    warrantyInverterYears: 10,
    warrantyWorkmanshipYears: 5,
    recommendedRoofAreaSqM: 50,
    idealFor: 'Ruko, kantor cabang, cafe, klinik dengan daya 10.500 - 16.500 VA (3 Phase)',
    isPopular: false,
    features: [
      '20x Panel Surya Monocrystalline 550 Wp',
      '1x Inverter 3-Phase 10 kW Komersial dengan Efisiensi 98.6%',
      'Sistem Monitoring Telemetri Multi-Parameter & Export Data CSV/Excel',
      'Dukungan Teknis Prioritas B2B & Layanan Pemeliharaan Berkala',
      'Bantuan Lengkap Administrasi ESDM & PLN'
    ],
    components: [
      { name: 'Solar Panel N-Type Bifacial', specs: 'Tier-1 550 Wp Glass-Glass Architecture', qty: 20 },
      { name: 'Commercial Inverter 3-Phase', specs: '10 kW Triple MPPT, AFCI Fire Protection', qty: 1 },
      { name: 'Commercial Smart Meter 3-Phase', specs: 'Class 0.5S Precision Bi-directional Meter', qty: 1 },
      { name: 'Industrial Racking System', specs: 'Aluminium Alloy dengan Clamp Anti-Slip', qty: 1 },
      { name: 'Industrial Panel Box & SPD', specs: 'Type 1+2 Lightning Surge Arrester', qty: 1 }
    ],
    includedServices: [
      'Audit energi awal & estimasi profil beban 24 jam',
      'Detailed Engineering Design (DED) lengkap',
      'Instalasi standar industri K3',
      'Proses perizinan IUPTLS & Net Metering PLN B2B',
      'Laporan ESG & kalkulasi penurunan jejak karbon tahunan',
      'Garansi pemeliharaan & inspeksi rutin 2x per tahun selama 2 tahun'
    ],
    exclusions: [
      'Pekerjaan sipil khusus jika memerlukan kanopi struktural baru'
    ]
  },
  {
    id: 'pkg-4',
    slug: 'solarsync-enterprise-25kwp',
    name: 'Enterprise & School 27.5 kWp',
    segment: 'industry',
    capacityKwp: 27.5,
    tagline: 'Efisiensi energi skala institusi, sekolah, perguruan tinggi, dan pabrik',
    description: 'Sistem PLTS skala besar yang dirancang untuk kebutuhan beban kontinu, memberikan pengembalian modal (ROI) sangat cepat antara 4 hingga 5 tahun.',
    priceFromIdr: 330000000,
    estimatedMonthlyProductionKwh: 3300,
    estimatedMonthlySavingsIdr: 4554000,
    warrantyPanelsYears: 25,
    warrantyInverterYears: 10,
    warrantyWorkmanshipYears: 5,
    recommendedRoofAreaSqM: 125,
    idealFor: 'Gedung kampus, sekolah terpadu, gudang logistik, dan industri menengah',
    isPopular: false,
    features: [
      '50x Panel Surya Industri 550 Wp',
      '1x Commercial Smart Inverter 25 kW dengan Quad MPPT',
      'SolarSync Fleet Management Dashboard untuk tim teknis internal',
      'Fitur Dynamic Power Limiter & Zero-Export Control fleksibel',
      'Perjanjian SLA Layanan Perbaikan Cepat < 24 Jam'
    ],
    components: [
      { name: 'Solar Panels Tier-1 TOPCon', specs: '550 Wp Bifacial Anti-PID / Anti-LID', qty: 50 },
      { name: 'Inverter 3-Phase 25 kW', specs: 'Quad MPPT, Smart IV Curve Diagnosis', qty: 1 },
      { name: 'Weather Station & Solar Sensor', specs: 'Irradiance & Ambient Temperature Sensor', qty: 1 },
      { name: 'Industrial Heavy Duty Rail', specs: 'High-strength structural aluminium', qty: 1 },
      { name: 'Protection & Telemetry Cabinet', specs: 'Rittal Cabinet with Smart Controller', qty: 1 }
    ],
    includedServices: [
      'Feasibility Study & Analisis Finansial ROI Mendalam',
      'Simulasi PVSyst berlisensi resmi',
      'Manajemen K3 Proyek & Asuransi Konstruksi (CAR)',
      'Pengurusan Izin Operasi Pembangkit & SLO PLN',
      'Pelatihan operasional untuk tim fasilitas / teknisi gedung',
      'SLA Dukungan Onsite 24/7'
    ],
    exclusions: [
      'Biaya trafo step-up tambahan (jika penyambungan pada tegangan menengah)'
    ]
  }
];

export const initialArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'panduan-lengkap-plts-atap-rumah-pemula',
    title: 'Panduan Lengkap Memasang Panel Surya Atap untuk Pemula (2026)',
    summary: 'Semua yang perlu Anda ketahui sebelum memasang PLTS Atap: cara kerja sistem on-grid, estimasi biaya, pemilihan kapasitas, hingga cara mengurus perizinan PLN.',
    content: `
### Mengenal Sistem PLTS Atap On-Grid

Pembangkit Listrik Tenaga Surya (PLTS) Atap tipe On-Grid adalah solusi paling populer dan efisien untuk rumah tangga saat ini. Sistem ini bekerja secara paralel dengan jaringan listrik PLN tanpa memerlukan baterai penyimpan daya yang mahal.

#### Bagaimana Cara Kerjanya di Siang Hari?
1. **Fotovoltaik Menangkap Cahaya:** Panel surya yang terpasang di atap rumah menangkap radiasi sinar matahari dan mengubahnya menjadi listrik arus searah (DC).
2. **Inverter Mengubah Listrik:** Smart Inverter mengubah arus DC menjadi arus bolak-balik (AC) bertegangan 220V yang selaras dengan listrik rumah Anda.
3. **Prioritas Konsumsi Sendiri:** Listrik tenaga surya otomatis langsung digunakan oleh peralatan rumah yang menyala (seperti kulkas, AC, pompa air, komputer).
4. **Kekurangan Dipasok PLN:** Jika konsumsi listrik melebihi produksi surya (misal saat mendung atau malam hari), PLN otomatis menyuplai kekurangannya secara seamless tanpa kedipan.

#### Komponen Utama yang Wajib Berkualitas
- **Panel Surya (PV Module):** Pilih panel Tier-1 dengan garansi performa 25 tahun.
- **Smart Inverter:** Otak dari sistem dengan efisiensi di atas 97% dan fitur konektivitas Wi-Fi untuk monitoring.
- **Racking & Mounting:** Rangka aluminium anti-karat tahan terpaan angin hingga 120 km/jam.
- **Proteksi AC/DC (Surge Protection Device):** Melindungi sistem kelistrikan rumah dari sambaran petir dan lonjakan arus.

#### Berapa Luas Atap yang Dibutuhkan?
Untuk kapasitas 1 kWp (kilowatt-peak), Anda membutuhkan luas atap sekitar 4,5 hingga 5 meter persegi. Contoh: untuk paket 2.2 kWp, luas atap bersih yang bebas bayangan adalah sekitar 10 m².
    `,
    category: 'Panduan Pemula',
    author: 'Tim Engineering SolarSync',
    publishedAt: '2026-08-01T08:00:00Z',
    readTimeMinutes: 5,
    coverImage: '/assets/images/solarsync-hero-home.webp',
    tags: ['Pemula', 'PLTS Atap', 'Hemat Listrik', 'On-Grid'],
    isPublished: true,
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'art-2',
    slug: 'analisis-roi-balik-modal-panel-surya-indonesia',
    title: 'Berapa Lama Balik Modal Panel Surya di Indonesia? Simulasi Finansial Nyata',
    summary: 'Hitung-hitungan transparan Return on Investment (ROI), payback period 4-6 tahun, kenaikan nilai properti, dan keuntungan finansial jangka panjang hingga 25 tahun.',
    content: `
### Menghitung Keekonomian Investasi Energi Surya

Banyak pemilik rumah mengira memasang panel surya adalah biaya pengeluaran konsumtif. Faktanya, PLTS Atap adalah **investasi infrastruktur produktif** yang menghasilkan imbal hasil (yield) tahunan 15% - 22%, jauh di atas bunga deposito perbankan.

#### Contoh Studi Kasus Riil: Rumah Tangga Daya 3.500 VA
- **Tagihan Listrik Awal:** Rata-rata Rp 2.200.000 / bulan (konsumsi ~1.300 kWh).
- **Sistem Terpasang:** SolarSync Home Plus 5.5 kWp.
- **Investasi Awal:** Rp 68.000.000 (All-in termasuk instalasi & perizinan).
- **Produksi Surya Rata-Rata:** 660 kWh / bulan.
- **Penghematan Bulanan:** Rp 953.000 / bulan (Rp 11.436.000 / tahun).
- **Periode Balik Modal (Simple Payback):** Rp 68.000.000 / Rp 11.436.000 = **5,9 Tahun**.

#### Apa yang Terjadi Setelah Tahun ke-6?
Karena panel surya bergaransi performa 25 tahun, maka dari **tahun ke-7 hingga tahun ke-25 (selama 19 tahun)**, seluruh energi yang dihasilkan adalah **100% listrik gratis murni**.
Total akumulasi penghematan bersih selama 25 tahun dapat melampaui **Rp 280.000.000**.
    `,
    category: 'Finansial & ROI',
    author: 'Reza Pratama, CFA (Energy Economist)',
    publishedAt: '2026-08-04T10:30:00Z',
    readTimeMinutes: 7,
    coverImage: '/assets/images/solarsync-calculator-illustration.webp',
    tags: ['ROI', 'Finansial', 'Investasi', 'Hemat Biaya'],
    isPublished: true
  },
  {
    id: 'art-3',
    slug: 'regulasi-plts-atap-pln-permen-esdm-terbaru',
    title: 'Aturan & Regulasi Resmi Pemasangan PLTS Atap PLN (Permen ESDM Terkini)',
    summary: 'Pelajari mekanisme kuota PLTS, proses perizinan paralel PLN, sertifikasi laik operasi (SLO), dan hak konsumen dalam bertransisi ke energi bersih.',
    content: `
### Memahami Kebijakan & Perizinan PLTS Atap

Pemerintah Indonesia melalui Kementerian ESDM dan PT PLN (Persero) telah menetapkan regulasi yang jelas untuk instalasi sistem pembangkit listrik tenaga surya atap bagi pelanggan tersambung jaringan.

#### 4 Langkah Utama Perizinan Resmi:
1. **Pengecekan Kuota Sistem:** Pengajuan permohonan ke PLN unit pelayanan setempat berdasarkan kuota pengembangan PLTS Atap tahunan.
2. **Persetujuan Rancang Bangun (Engineering Verification):** PLN memverifikasi dokumen teknis inverter (memiliki sertifikat anti-islanding) dan diagram satu garis (single-line diagram).
3. **Instalasi & Uji Laik Operasi (SLO):** Sistem dipasang sesuai standar PUIL 2020 dan diuji oleh Lembaga Inspeksi Teknis terakreditasi.
4. **Pemasangan Meter Ekspor-Impor / Advance Meter:** Penggantian kWh meter resmi PLN untuk pencatatan telemetri energi dua arah.

SolarSync mengurus seluruh proses perizinan ini secara end-to-end tanpa biaya tambahan tersembunyi.
    `,
    category: 'Regulasi & Kebijakan',
    author: 'Dian Kusuma, S.T. (Regulatory Specialist)',
    publishedAt: '2026-08-06T14:15:00Z',
    readTimeMinutes: 6,
    coverImage: '/assets/images/solarsync-installation-team.webp',
    tags: ['Regulasi', 'PLN', 'ESDM', 'SLO', 'Legalitas'],
    isPublished: true
  },
  {
    id: 'art-4',
    slug: 'tips-perawatan-dan-monitoring-panel-surya-efisien',
    title: 'Cara Merawat Panel Surya Agar Efisiensi Tetap 100% Selama Puluhan Tahun',
    summary: 'Tips praktis membersihkan debu panel, membaca grafik monitoring inverter, dan mengenali gejala penurunan daya secara dini.',
    content: `
### Perawatan Minimal untuk Daya Tahan Maksimal

Panel surya tidak memiliki komponen mekanis yang bergerak, sehingga tingkat kerusakannya sangat rendah. Namun, sedikit perawatan rutin akan menjaga produksi energi tetap berada pada titik optimum.

#### Langkah Pembersihan yang Benar:
- **Waktu Terbaik:** Bersihkan di pagi hari sebelum jam 08:00 atau sore hari setelah jam 17:00 saat permukaan kaca panel tidak dalam kondisi panas terik.
- **Gunakan Air Bersih & Spons Lembut:** Hindari penggunaan sikat kawat atau deterjen abrasif yang dapat menggores lapisan anti-reflektif kaca.
- **Manfaatkan Air Hujan:** Sudut kemiringan atap standar 10° - 15° di Indonesia secara alami membantu air hujan membersihkan kotoran debu ringan.
- **Pantau dari Dashboard SolarSync:** Jika grafik produksi menunjukkan penurunan anomali dibandingkan hari cerah sebelumnya, segera jadwalkan inspeksi visual.
    `,
    category: 'Teknis & Instalasi',
    author: 'Agus Wijaya (Chief Field Engineer)',
    publishedAt: '2026-08-08T09:00:00Z',
    readTimeMinutes: 4,
    coverImage: '/assets/images/solarsync-monitoring-flow.webp',
    tags: ['Maintenance', 'Monitoring', 'Tips Teknis', 'Inverter'],
    isPublished: true
  }
];

export const initialFaqs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Umum',
    question: 'Apakah listrik tenaga surya tetap menyala saat cuaca mendung atau hujan?',
    answer: 'Ya, panel surya tetap menghasilkan listrik meskipun cuaca mendung karena panel bekerja menangkap radiasi sinar matahari (irradiance), bukan hanya panas matahari. Produksi saat mendung berkisar antara 25% hingga 50% dari kapasitas puncak. Kekurangan daya akan dipasok otomatis oleh jaringan PLN tanpa interupsi.'
  },
  {
    id: 'faq-2',
    category: 'Umum',
    question: 'Apakah sistem PLTS On-Grid memerlukan baterai?',
    answer: 'Tidak. Sistem On-Grid tersambung langsung ke jaringan PLN, di mana PLN berfungsi sebagai penyeimbang energi. Hal ini membuat investasi sistem on-grid jauh lebih hemat dan terjangkau dibandingkan sistem baterai (Off-Grid/Hybrid).'
  },
  {
    id: 'faq-3',
    category: 'Kalkulator & Biaya',
    question: 'Seberapa akurat hasil dari Solar Calculator SolarSync?',
    answer: 'Solar Calculator kami menggunakan algoritma berbasis rata-rata radiasi matahari wilayah Indonesia (Solargis/NASA 4.0 Peak Sun Hours), tarif resmi PLN, dan efisiensi standar sistem 80%. Hasilnya adalah estimasi awal dengan akurasi ~90%. Angka final akan disempurnakan setelah tim teknisi kami melakukan survei visual atap secara langsung.'
  },
  {
    id: 'faq-4',
    category: 'Kalkulator & Biaya',
    question: 'Apakah ada opsi cicilan atau pembiayaan hijau (Green Financing)?',
    answer: 'Ya! SolarSync bermitra dengan berbagai institusi perbankan dan pembiayaan terkemuka untuk menyediakan program cicilan hijau dengan bunga kompetitif dan tenor hingga 5 tahun, sehingga cicilan bulanan dapat tertutup dari penghematan tagihan listrik Anda.'
  },
  {
    id: 'faq-5',
    category: 'Teknis & Atap',
    question: 'Apakah atap rumah saya kuat menahan beban panel surya?',
    answer: 'Beban panel surya modern sangat ringan, hanya sekitar 12 - 15 kg per meter persegi (setara dengan berat orang berjalan perlahan di atap). Struktur atap genteng, dak beton, maupun spandek metal umumnya sangat aman. Tim engineer kami akan melakukan pengecekan struktural sebelum instalasi dimulai.'
  },
  {
    id: 'faq-6',
    category: 'Proses Instalasi',
    question: 'Berapa lama proses pemasangan dari pengajuan sampai sistem menyala?',
    answer: 'Proses survei hingga persetujuan desain memakan waktu 2-4 hari kerja. Pemasangan fisik di atap untuk rumah tinggal biasanya selesai dalam 1-2 hari. Proses perizinan dan penggantian meteran PLN rata-rata membutuhkan waktu 7-14 hari kerja.'
  },
  {
    id: 'faq-7',
    category: 'Garansi & Pemeliharaan',
    question: 'Berapa lama masa garansi yang diberikan SolarSync?',
    answer: 'Kami memberikan Garansi Performa Panel Surya selama 25 tahun (menjamin output daya minimal 84.8%), Garansi Inverter 5-10 tahun, Garansi Rangka Mounting 10 tahun, dan Garansi Pekerjaan Instalasi (Workmanship) hingga 5 tahun.'
  }
];

export const initialRequests: InstallationRequest[] = [
  {
    id: 'REQ-2026-0801-01',
    fullName: 'Budi Santoso',
    phoneNumber: '081234567890',
    email: 'budi.santoso@gmail.com',
    address: 'Jl. Surya Kencana No. 42, RT 03 / RW 05, Menteng',
    city: 'Jakarta Pusat',
    postalCode: '10310',
    propertyType: 'household',
    plnPowerVa: 5500,
    monthlyBillIdr: 2400000,
    roofAreaSqM: 40,
    selectedPackageSlug: 'solarsync-home-plus-5kwp',
    status: 'Instalasi',
    createdAt: '2026-08-01T09:30:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
    surveyDate: '2026-08-05',
    installationDate: '2026-08-15',
    assignedTechnician: 'Agus Wijaya & Tim Alpha',
    finalQuotationIdr: 68000000,
    calculatorResult: {
      recommendedCapacityKwp: 5.5,
      panelCount: 10,
      estimatedMonthlySavingsIdr: 953000,
      paybackPeriodYears: 5.9
    },
    timelineLogs: [
      { status: 'Diajukan', timestamp: '2026-08-01T09:30:00Z', note: 'Formulir pengajuan online diterima dari website.', updatedBy: 'Sistem' },
      { status: 'Diverifikasi', timestamp: '2026-08-02T10:15:00Z', note: 'Data rekening listrik dan KTP telah diverifikasi lengkap.', updatedBy: 'Admin Putri' },
      { status: 'Menunggu Survei', timestamp: '2026-08-03T14:00:00Z', note: 'Jadwal survei fisik atap ditetapkan untuk tanggal 5 Agustus 2026.', updatedBy: 'Admin Putri' },
      { status: 'Penawaran', timestamp: '2026-08-07T11:20:00Z', note: 'DED 3D and Quotation final Rp 68.000.000 telah dikirimkan ke pelanggan.', updatedBy: 'Sales Eng Hendra' },
      { status: 'Disetujui', timestamp: '2026-08-09T16:45:00Z', note: 'Pelanggan menyetujui penawaran & menandatangani SPK.', updatedBy: 'Sales Eng Hendra' },
      { status: 'Dijadwalkan', timestamp: '2026-08-11T09:00:00Z', note: 'Material komplit, jadwal instalasi disepakati 15 Agustus 2026.', updatedBy: 'Ops Manager Dani' },
      { status: 'Instalasi', timestamp: '2026-08-14T08:00:00Z', note: 'Tim teknisi mulai pemasangan mounting rel dan inverter di lokasi.', updatedBy: 'Agus Wijaya (Lead Tech)' }
    ]
  },
  {
    id: 'REQ-2026-0810-02',
    fullName: 'Siti Rahmawati',
    phoneNumber: '081987654321',
    email: 'siti.rahma@kopi-nusantara.id',
    address: 'Jl. Riau No. 88, Kafe Kopi Nusantara',
    city: 'Bandung',
    postalCode: '40115',
    propertyType: 'business',
    plnPowerVa: 11000,
    monthlyBillIdr: 4800000,
    roofAreaSqM: 70,
    selectedPackageSlug: 'solarsync-business-pro-10kwp',
    status: 'Penawaran',
    createdAt: '2026-08-10T14:20:00Z',
    updatedAt: '2026-08-13T16:00:00Z',
    surveyDate: '2026-08-12',
    assignedTechnician: 'Dedi Kurniawan',
    finalQuotationIdr: 138000000,
    timelineLogs: [
      { status: 'Diajukan', timestamp: '2026-08-10T14:20:00Z', note: 'Pengajuan paket Business Pro diterima.', updatedBy: 'Sistem' },
      { status: 'Diverifikasi', timestamp: '2026-08-11T09:00:00Z', note: 'Verifikasi dokumen bisnis dan legalitas lokasi selesai.', updatedBy: 'Admin Putri' },
      { status: 'Menunggu Survei', timestamp: '2026-08-11T13:00:00Z', note: 'Survei atap dak kafe dijadwalkan.', updatedBy: 'Admin Putri' },
      { status: 'Penawaran', timestamp: '2026-08-13T16:00:00Z', note: 'Proposal penawaran sistem 11 kWp 3-Phase dikirim via email.', updatedBy: 'Sales Eng Hendra' }
    ]
  },
  {
    id: 'REQ-2026-0814-03',
    fullName: 'Dr. Irwan Santika',
    phoneNumber: '085712348899',
    email: 'irwan.santika@medika.org',
    address: 'Komp. Graha Candi Blok D-12',
    city: 'Semarang',
    postalCode: '50257',
    propertyType: 'household',
    plnPowerVa: 2200,
    monthlyBillIdr: 1100000,
    roofAreaSqM: 20,
    selectedPackageSlug: 'solarsync-home-compact-2kwp',
    status: 'Diajukan',
    createdAt: '2026-08-14T20:15:00Z',
    updatedAt: '2026-08-14T20:15:00Z',
    timelineLogs: [
      { status: 'Diajukan', timestamp: '2026-08-14T20:15:00Z', note: 'Permohonan baru masuk dari Solar Calculator.', updatedBy: 'Sistem' }
    ]
  }
];

export const initialDevices: DeviceStatus[] = [
  {
    id: 'DEV-INV-001',
    customerId: 'cust-budi',
    customerName: 'Budi Santoso',
    deviceType: 'Inverter',
    serialNumber: 'SUN2000-5KTL-M1-2026998',
    model: 'Huawei SUN2000 Smart Inverter 5 kW',
    status: 'normal',
    lastSeenAt: '2026-08-15T01:30:00Z',
    firmwareVersion: 'V200R001C00SPC128',
    telemetry: {
      currentPowerKw: 4.35,
      voltageV: 228.4,
      currentA: 19.05,
      gridFrequencyHz: 50.02,
      temperatureC: 41.5,
      dailyYieldKwh: 24.8,
      totalYieldMwh: 1.84,
      efficiencyPercent: 98.4
    },
    alerts: []
  },
  {
    id: 'DEV-MTR-001',
    customerId: 'cust-budi',
    customerName: 'Budi Santoso',
    deviceType: 'Smart Meter',
    serialNumber: 'DTSU666-H-2026110',
    model: 'Chint DTSU666-H Smart Power Sensor',
    status: 'normal',
    lastSeenAt: '2026-08-15T01:30:00Z',
    firmwareVersion: 'v1.4.2',
    telemetry: {
      currentPowerKw: 1.25,
      voltageV: 228.1,
      currentA: 5.48,
      gridFrequencyHz: 50.01,
      temperatureC: 32.0,
      dailyYieldKwh: 0,
      totalYieldMwh: 0,
      efficiencyPercent: 99.8
    }
  },
  {
    id: 'DEV-INV-002',
    customerId: 'cust-siti',
    customerName: 'Siti Rahmawati (Kafe Kopi)',
    deviceType: 'Inverter',
    serialNumber: 'GW10K-ET-2026541',
    model: 'GoodWe 10kW 3-Phase Commercial',
    status: 'warning',
    lastSeenAt: '2026-08-15T01:15:00Z',
    firmwareVersion: 'v3.2.0',
    telemetry: {
      currentPowerKw: 8.10,
      voltageV: 389.2,
      currentA: 20.8,
      gridFrequencyHz: 49.95,
      temperatureC: 58.2, // agak hangat
      dailyYieldKwh: 46.2,
      totalYieldMwh: 4.12,
      efficiencyPercent: 97.6
    },
    alerts: [
      { code: 'W-TEMP-04', level: 'warning', message: 'Suhu pendingin inverter terdeteksi di atas rata-rata normal (58°C)', time: '2026-08-15T01:10:00Z' }
    ]
  },
  {
    id: 'DEV-INV-003',
    customerId: 'cust-demo-offline',
    customerName: 'CV Makmur Sejahtera',
    deviceType: 'Inverter',
    serialNumber: 'GROWATT-MIN-6000',
    model: 'Growatt MIN 6000TL-X',
    status: 'offline',
    lastSeenAt: '2026-08-14T18:20:00Z', // 7 jam lalu
    firmwareVersion: 'v2.1.1',
    telemetry: {
      currentPowerKw: 0,
      voltageV: 0,
      currentA: 0,
      gridFrequencyHz: 0,
      temperatureC: 28.0,
      dailyYieldKwh: 12.4,
      totalYieldMwh: 2.30,
      efficiencyPercent: 0
    },
    alerts: [
      { code: 'E-COMM-01', level: 'error', message: 'Koneksi telemetri Wi-Fi terputus sejak 7 jam lalu', time: '2026-08-14T18:20:00Z' }
    ]
  }
];

export const hourlyTelemetryData: EnergyTelemetryPoint[] = [
  { timestamp: '06:00', solarProductionKw: 0.1, homeConsumptionKw: 0.8, gridExportKw: 0.0, gridImportKw: 0.7 },
  { timestamp: '07:00', solarProductionKw: 0.6, homeConsumptionKw: 1.2, gridExportKw: 0.0, gridImportKw: 0.6 },
  { timestamp: '08:00', solarProductionKw: 1.8, homeConsumptionKw: 1.4, gridExportKw: 0.4, gridImportKw: 0.0 },
  { timestamp: '09:00', solarProductionKw: 3.2, homeConsumptionKw: 1.6, gridExportKw: 1.6, gridImportKw: 0.0 },
  { timestamp: '10:00', solarProductionKw: 4.5, homeConsumptionKw: 1.9, gridExportKw: 2.6, gridImportKw: 0.0 },
  { timestamp: '11:00', solarProductionKw: 5.1, homeConsumptionKw: 2.2, gridExportKw: 2.9, gridImportKw: 0.0 },
  { timestamp: '12:00', solarProductionKw: 5.3, homeConsumptionKw: 2.4, gridExportKw: 2.9, gridImportKw: 0.0 },
  { timestamp: '13:00', solarProductionKw: 4.9, homeConsumptionKw: 2.5, gridExportKw: 2.4, gridImportKw: 0.0 },
  { timestamp: '14:00', solarProductionKw: 4.1, homeConsumptionKw: 2.3, gridExportKw: 1.8, gridImportKw: 0.0 },
  { timestamp: '15:00', solarProductionKw: 2.8, homeConsumptionKw: 2.0, gridExportKw: 0.8, gridImportKw: 0.0 },
  { timestamp: '16:00', solarProductionKw: 1.4, homeConsumptionKw: 1.8, gridExportKw: 0.0, gridImportKw: 0.4 },
  { timestamp: '17:00', solarProductionKw: 0.4, homeConsumptionKw: 2.1, gridExportKw: 0.0, gridImportKw: 1.7 },
  { timestamp: '18:00', solarProductionKw: 0.0, homeConsumptionKw: 2.8, gridExportKw: 0.0, gridImportKw: 2.8 },
  { timestamp: '19:00', solarProductionKw: 0.0, homeConsumptionKw: 2.6, gridExportKw: 0.0, gridImportKw: 2.6 },
  { timestamp: '20:00', solarProductionKw: 0.0, homeConsumptionKw: 2.2, gridExportKw: 0.0, gridImportKw: 2.2 },
  { timestamp: '21:00', solarProductionKw: 0.0, homeConsumptionKw: 1.8, gridExportKw: 0.0, gridImportKw: 1.8 }
];

export const weeklyTelemetryData = [
  { day: 'Sen', productionKwh: 24.5, consumptionKwh: 28.2, savingsIdr: 35400 },
  { day: 'Sel', productionKwh: 26.8, consumptionKwh: 27.5, savingsIdr: 38700 },
  { day: 'Rab', productionKwh: 22.1, consumptionKwh: 29.0, savingsIdr: 31900 },
  { day: 'Kam', productionKwh: 28.4, consumptionKwh: 26.8, savingsIdr: 41000 },
  { day: 'Jum', productionKwh: 25.9, consumptionKwh: 27.2, savingsIdr: 37400 },
  { day: 'Sab', productionKwh: 29.2, consumptionKwh: 34.5, savingsIdr: 42200 },
  { day: 'Min', productionKwh: 27.8, consumptionKwh: 35.1, savingsIdr: 40100 },
];

export const monthlyTelemetryData = [
  { month: 'Jan', productionKwh: 640, consumptionKwh: 820, savingsIdr: 924000 },
  { month: 'Feb', productionKwh: 590, consumptionKwh: 780, savingsIdr: 852000 },
  { month: 'Mar', productionKwh: 670, consumptionKwh: 830, savingsIdr: 968000 },
  { month: 'Apr', productionKwh: 690, consumptionKwh: 810, savingsIdr: 996000 },
  { month: 'Mei', productionKwh: 710, consumptionKwh: 840, savingsIdr: 1025000 },
  { month: 'Jun', productionKwh: 730, consumptionKwh: 850, savingsIdr: 1054000 },
  { month: 'Jul', productionKwh: 740, consumptionKwh: 860, savingsIdr: 1069000 },
  { month: 'Agu', productionKwh: 720, consumptionKwh: 830, savingsIdr: 1040000 },
  { month: 'Sep', productionKwh: 700, consumptionKwh: 820, savingsIdr: 1011000 },
  { month: 'Okt', productionKwh: 680, consumptionKwh: 840, savingsIdr: 982000 },
  { month: 'Nov', productionKwh: 620, consumptionKwh: 810, savingsIdr: 895000 },
  { month: 'Des', productionKwh: 610, consumptionKwh: 850, savingsIdr: 881000 }
];
