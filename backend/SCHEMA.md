# Skema SolarSync

Skema data fitur untuk FastAPI + MySQL 8.4. Engine InnoDB, utf8mb4.
Model: `app/db/models.py`. Migrasi awal berdiri sendiri: `alembic/versions/0001_initial_schema.py`.

## Relasi utama

- User 0..1 Customer; Customer 1..N Site; Site 1..N SolarSystem; SolarSystem 1..N Device.
- Pengajuan menyimpan snapshot kontak/alamat; akun pemohon, pelanggan, dan lokasi boleh belum ditautkan.
- Pengajuan memiliki riwayat status, dokumen, janji survei/pemasangan, teknisi, dan revisi penawaran.
- Kalkulasi menyimpan input, versi profil, hasil JSON lengkap, dan asumsi yang dipakai.
- Perangkat menyimpan sampel mentah; interval sistem menyimpan neraca energi; ringkasan harian adalah agregat yang dapat dihitung ulang.
- Katalog paket, komponen, fitur/layanan/pengecualian, artikel, tag, FAQ disimpan relasional.
- Hero, CTA, footer, testimoni, dan konten marketing tetap di frontend.

## Kolom lengkap

Kolom opsional ditandai `?`. Semua ID BIGINT dikirim sebagai string oleh API nantinya. Semua waktu kejadian DATETIME(6) adalah UTC; local_date mengikuti timezone lokasi.

### files

- `id`: `BIGINT(unsigned=True)` — primary key
- `uploaded_by_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `storage_key`: `String(512)`
- `original_name`: `String(255)`
- `mime_type`: `String(127)`
- `size_bytes`: `BIGINT(unsigned=True)`
- `visibility`: `Enum("public", "private")`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### users

- `id`: `BIGINT(unsigned=True)` — primary key
- `name`: `String(255)`
- `email?`: `String(254)`
- `phone?`: `String(32)`
- `password_hash`: `String(255)`
- `role`: `Enum("customer", "admin")`
- `is_active`: `Boolean`
- `avatar_file_id?`: `BIGINT(unsigned=True)` → `files.id` (RESTRICT)
- `email_verified_at?`: `DATETIME(fsp=6)`
- `phone_verified_at?`: `DATETIME(fsp=6)`
- `last_login_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### customers

- `id`: `BIGINT(unsigned=True)` — primary key
- `customer_code`: `String(40)`
- `user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `name`: `String(255)`
- `email?`: `String(254)`
- `phone`: `String(32)`
- `notes?`: `Text`
- `is_active`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### auth_sessions

- `id`: `BIGINT(unsigned=True)` — primary key
- `user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `refresh_token_hash`: `String(64)`
- `expires_at`: `DATETIME(fsp=6)`
- `revoked_at?`: `DATETIME(fsp=6)`
- `last_used_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### account_tokens

- `id`: `BIGINT(unsigned=True)` — primary key
- `user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `purpose`: `Enum("password_reset", "account_invitation")`
- `token_hash`: `String(64)`
- `expires_at`: `DATETIME(fsp=6)`
- `used_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`

### notification_preferences

- `user_id`: `BIGINT(unsigned=True)` → `users.id` (CASCADE) — primary key
- `notify_power_drop`: `Boolean`
- `notify_daily_report`: `Boolean`
- `notify_maintenance`: `Boolean`
- `power_drop_threshold_percent`: `Numeric(5, 2)`
- `daily_report_time`: `Time`
- `timezone`: `String(64)`
- `whatsapp_enabled`: `Boolean`
- `updated_at`: `DATETIME(fsp=6)`

### sites

- `id`: `BIGINT(unsigned=True)` — primary key
- `customer_id`: `BIGINT(unsigned=True)` → `customers.id` (RESTRICT)
- `name`: `String(255)`
- `address`: `Text`
- `city`: `String(100)`
- `postal_code?`: `String(12)`
- `property_type`: `Enum("household", "business", "industry", "school", "other")`
- `pln_power_va`: `Integer`
- `roof_area_sqm`: `Numeric(18, 6)`
- `roof_type?`: `Enum("genteng", "dak_beton", "spandek_metal", "asbes", "other")`
- `roof_orientation?`: `Enum("utara", "selatan", "timur", "barat", "optimal")`
- `shading_condition?`: `Enum("none", "partial", "heavy")`
- `timezone`: `String(64)`
- `is_active`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### solar_packages

- `id`: `BIGINT(unsigned=True)` — primary key
- `slug`: `String(191)`
- `name`: `String(255)`
- `segment`: `Enum("household", "business", "industry", "school", "other")`
- `capacity_kwp`: `Numeric(18, 6)`
- `tagline`: `String(255)`
- `description`: `Text`
- `price_from_idr`: `Numeric(18, 2)`
- `estimated_monthly_production_kwh`: `Numeric(18, 6)`
- `estimated_monthly_savings_idr`: `Numeric(18, 2)`
- `warranty_panels_years`: `Integer`
- `warranty_inverter_years`: `Integer`
- `warranty_workmanship_years`: `Integer`
- `recommended_roof_area_sqm`: `Numeric(18, 6)`
- `ideal_for`: `Text`
- `is_popular`: `Boolean`
- `is_active`: `Boolean`
- `sort_order`: `Integer`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### package_components

- `id`: `BIGINT(unsigned=True)` — primary key
- `package_id`: `BIGINT(unsigned=True)` → `solar_packages.id` (CASCADE)
- `name`: `String(255)`
- `specs`: `Text`
- `quantity`: `Integer`
- `sort_order`: `Integer`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### package_items

- `id`: `BIGINT(unsigned=True)` — primary key
- `package_id`: `BIGINT(unsigned=True)` → `solar_packages.id` (CASCADE)
- `item_type`: `Enum("feature", "included_service", "exclusion")`
- `content`: `Text`
- `sort_order`: `Integer`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### calculation_profiles

- `id`: `BIGINT(unsigned=True)` — primary key
- `version`: `String(50)`
- `sun_hours_per_day`: `Numeric(18, 6)`
- `system_efficiency`: `Numeric(18, 6)`
- `panel_watt_peak`: `Integer`
- `area_per_panel_sqm`: `Numeric(18, 6)`
- `cost_per_kwp_min_idr`: `Numeric(18, 2)`
- `cost_per_kwp_max_idr`: `Numeric(18, 2)`
- `emission_factor`: `Numeric(18, 6)`
- `tree_absorption_kg_per_year`: `Numeric(18, 6)`
- `tariff_rules_json`: `JSON`
- `effective_from`: `DATETIME(fsp=6)`
- `is_active`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### solar_calculations

- `id`: `BIGINT(unsigned=True)` — primary key
- `user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `profile_id`: `BIGINT(unsigned=True)` → `calculation_profiles.id` (RESTRICT)
- `access_token_hash?`: `String(64)`
- `expires_at?`: `DATETIME(fsp=6)`
- `city`: `String(100)`
- `property_type`: `Enum("household", "business", "industry", "school", "other")`
- `monthly_kwh`: `Numeric(18, 6)`
- `monthly_bill_idr`: `Numeric(18, 2)`
- `pln_power_va`: `Integer`
- `roof_area_sqm`: `Numeric(18, 6)`
- `roof_orientation?`: `Enum("utara", "selatan", "timur", "barat", "optimal")`
- `shading_condition?`: `Enum("none", "partial", "heavy")`
- `target_coverage_percent`: `Numeric(5, 2)`
- `result_json`: `JSON`
- `assumptions_json`: `JSON`
- `created_at`: `DATETIME(fsp=6)`

### installation_requests

- `id`: `BIGINT(unsigned=True)` — primary key
- `ticket_number`: `String(50)`
- `customer_id?`: `BIGINT(unsigned=True)` → `customers.id` (RESTRICT)
- `site_id?`: `BIGINT(unsigned=True)` → `sites.id` (RESTRICT)
- `submitted_by_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `calculation_id?`: `BIGINT(unsigned=True)` → `solar_calculations.id` (RESTRICT)
- `package_id?`: `BIGINT(unsigned=True)` → `solar_packages.id` (RESTRICT)
- `full_name`: `String(255)`
- `phone_number`: `String(32)`
- `email?`: `String(254)`
- `address`: `Text`
- `city`: `String(100)`
- `postal_code?`: `String(12)`
- `property_type`: `Enum("household", "business", "industry", "school", "other")`
- `pln_power_va`: `Integer`
- `monthly_bill_idr`: `Numeric(18, 2)`
- `roof_area_sqm`: `Numeric(18, 6)`
- `package_snapshot_json?`: `JSON`
- `notes?`: `Text`
- `status`: `Enum("Diajukan", "Diverifikasi", "Menunggu Survei", "Penawaran", "Disetujui", "Dijadwalkan", "Instalasi", "Selesai", "Dibatalkan")`
- `consent_version`: `String(50)`
- `consented_at`: `DATETIME(fsp=6)`
- `version`: `Integer`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### request_status_logs

- `id`: `BIGINT(unsigned=True)` — primary key
- `request_id`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `from_status?`: `Enum("Diajukan", "Diverifikasi", "Menunggu Survei", "Penawaran", "Disetujui", "Dijadwalkan", "Instalasi", "Selesai", "Dibatalkan")`
- `to_status`: `Enum("Diajukan", "Diverifikasi", "Menunggu Survei", "Penawaran", "Disetujui", "Dijadwalkan", "Instalasi", "Selesai", "Dibatalkan")`
- `note`: `Text`
- `actor_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `actor_name_snapshot`: `String(255)`
- `created_at`: `DATETIME(fsp=6)`

### technicians

- `id`: `BIGINT(unsigned=True)` — primary key
- `name`: `String(255)`
- `phone?`: `String(32)`
- `qualification?`: `String(255)`
- `is_active`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### request_assignments

- `id`: `BIGINT(unsigned=True)` — primary key
- `request_id`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `technician_id`: `BIGINT(unsigned=True)` → `technicians.id` (RESTRICT)
- `assignment_role`: `Enum("lead", "member")`
- `field_status`: `Enum("assigned", "on_site", "completed")`
- `assigned_by_user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `assigned_at`: `DATETIME(fsp=6)`
- `ended_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### request_appointments

- `id`: `BIGINT(unsigned=True)` — primary key
- `request_id`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `appointment_type`: `Enum("survey", "installation")`
- `scheduled_start_at`: `DATETIME(fsp=6)`
- `scheduled_end_at?`: `DATETIME(fsp=6)`
- `status`: `Enum("scheduled", "completed", "cancelled")`
- `notes?`: `Text`
- `created_by_user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### quotations

- `id`: `BIGINT(unsigned=True)` — primary key
- `request_id`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `revision_number`: `Integer`
- `amount_idr`: `Numeric(18, 2)`
- `status`: `Enum("draft", "sent", "accepted", "rejected", "superseded")`
- `notes?`: `Text`
- `issued_at?`: `DATETIME(fsp=6)`
- `accepted_at?`: `DATETIME(fsp=6)`
- `file_id?`: `BIGINT(unsigned=True)` → `files.id` (RESTRICT)
- `created_by_user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `accepted_request_id?`: `BIGINT(unsigned=True)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### request_documents

- `id`: `BIGINT(unsigned=True)` — primary key
- `request_id`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `document_type`: `Enum("roof_photo", "electricity_bill", "slo", "pln_permit", "spk", "design", "other")`
- `file_id?`: `BIGINT(unsigned=True)` → `files.id` (RESTRICT)
- `document_number?`: `100`
- `status`: `Enum("pending", "in_progress", "approved", "rejected")`
- `notes?`: `Text`
- `issued_at?`: `DATETIME(fsp=6)`
- `reviewed_by_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### solar_systems

- `id`: `BIGINT(unsigned=True)` — primary key
- `site_id`: `BIGINT(unsigned=True)` → `sites.id` (RESTRICT)
- `installation_request_id?`: `BIGINT(unsigned=True)` → `installation_requests.id` (RESTRICT)
- `name`: `String(255)`
- `capacity_kwp`: `Numeric(18, 6)`
- `panel_count`: `Integer`
- `panel_watt_peak`: `Integer`
- `system_type`: `Enum("on_grid", "hybrid", "off_grid")`
- `status`: `Enum("planned", "installing", "active", "inactive")`
- `grid_connection_status`: `Enum("unconnected", "connected", "disconnected")`
- `installed_at?`: `DATETIME(fsp=6)`
- `commissioned_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### system_financial_profiles

- `id`: `BIGINT(unsigned=True)` — primary key
- `system_id`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `effective_from`: `DATETIME(fsp=6)`
- `effective_to?`: `DATETIME(fsp=6)`
- `import_tariff_idr_per_kwh`: `Numeric(18, 6)`
- `export_credit_idr_per_kwh`: `Numeric(18, 6)`
- `emission_factor_kg_per_kwh`: `Numeric(18, 6)`
- `tree_absorption_kg_per_year`: `Numeric(18, 6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### devices

- `id`: `BIGINT(unsigned=True)` — primary key
- `device_code`: `String(50)`
- `system_id`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `device_type`: `Enum("inverter", "smart_meter", "solar_array", "battery")`
- `serial_number`: `String(191)`
- `model`: `String(255)`
- `firmware_version?`: `100`
- `status`: `Enum("normal", "warning", "offline", "unconnected")`
- `last_seen_at?`: `DATETIME(fsp=6)`
- `expected_interval_seconds`: `Integer`
- `is_active`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### device_telemetry

- `id`: `BIGINT(unsigned=True)` — primary key
- `device_id`: `BIGINT(unsigned=True)` → `devices.id` (RESTRICT)
- `recorded_at`: `DATETIME(fsp=6)`
- `received_at`: `DATETIME(fsp=6)`
- `current_power_kw?`: `Numeric(18, 6)`
- `voltage_v?`: `Numeric(18, 6)`
- `current_a?`: `Numeric(18, 6)`
- `grid_frequency_hz?`: `Numeric(18, 6)`
- `temperature_c?`: `Numeric(18, 6)`
- `daily_yield_kwh?`: `Numeric(18, 6)`
- `total_yield_kwh?`: `Numeric(18, 6)`
- `efficiency_percent?`: `Numeric(18, 6)`
- `quality_status`: `Enum("valid", "estimated", "invalid")`

### system_energy_intervals

- `id`: `BIGINT(unsigned=True)` — primary key
- `system_id`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `interval_start_at`: `DATETIME(fsp=6)`
- `interval_end_at`: `DATETIME(fsp=6)`
- `solar_production_kw?`: `Numeric(18, 6)`
- `home_consumption_kw?`: `Numeric(18, 6)`
- `grid_export_kw?`: `Numeric(18, 6)`
- `grid_import_kw?`: `Numeric(18, 6)`
- `battery_charge_kw?`: `Numeric(18, 6)`
- `battery_discharge_kw?`: `Numeric(18, 6)`
- `production_kwh?`: `Numeric(18, 6)`
- `consumption_kwh?`: `Numeric(18, 6)`
- `grid_export_kwh?`: `Numeric(18, 6)`
- `grid_import_kwh?`: `Numeric(18, 6)`
- `solar_self_consumed_kwh?`: `Numeric(18, 6)`
- `quality_status`: `Enum("valid", "estimated", "incomplete", "invalid")`

### energy_daily_summaries

- `id`: `BIGINT(unsigned=True)` — primary key
- `system_id`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `local_date`: `Date`
- `production_kwh?`: `Numeric(18, 6)`
- `consumption_kwh?`: `Numeric(18, 6)`
- `grid_export_kwh?`: `Numeric(18, 6)`
- `grid_import_kwh?`: `Numeric(18, 6)`
- `solar_self_consumed_kwh?`: `Numeric(18, 6)`
- `savings_idr?`: `Numeric(18, 2)`
- `co2_avoided_kg?`: `Numeric(18, 6)`
- `peak_power_kw?`: `Numeric(18, 6)`
- `peak_at?`: `DATETIME(fsp=6)`
- `coverage_percent?`: `Numeric(5, 2)`
- `calculation_basis_json`: `JSON`
- `updated_at`: `DATETIME(fsp=6)`

### device_alerts

- `id`: `BIGINT(unsigned=True)` — primary key
- `device_id`: `BIGINT(unsigned=True)` → `devices.id` (RESTRICT)
- `code`: `String(100)`
- `level`: `Enum("info", "warning", "error")`
- `message`: `Text`
- `occurred_at`: `DATETIME(fsp=6)`
- `resolved_at?`: `DATETIME(fsp=6)`

### device_refresh_jobs

- `id`: `BIGINT(unsigned=True)` — primary key
- `device_id`: `BIGINT(unsigned=True)` → `devices.id` (RESTRICT)
- `requested_by_user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `status`: `Enum("pending", "running", "succeeded", "failed", "timed_out")`
- `requested_at`: `DATETIME(fsp=6)`
- `completed_at?`: `DATETIME(fsp=6)`
- `error_message?`: `Text`

### maintenance_tasks

- `id`: `BIGINT(unsigned=True)` — primary key
- `system_id`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `technician_id?`: `BIGINT(unsigned=True)` → `technicians.id` (RESTRICT)
- `task_type`: `String(100)`
- `scheduled_at`: `DATETIME(fsp=6)`
- `completed_at?`: `DATETIME(fsp=6)`
- `status`: `Enum("scheduled", "in_progress", "completed", "cancelled")`
- `notes?`: `Text`
- `created_by_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### notification_deliveries

- `id`: `BIGINT(unsigned=True)` — primary key
- `user_id`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `system_id?`: `BIGINT(unsigned=True)` → `solar_systems.id` (RESTRICT)
- `device_alert_id?`: `BIGINT(unsigned=True)` → `device_alerts.id` (RESTRICT)
- `maintenance_task_id?`: `BIGINT(unsigned=True)` → `maintenance_tasks.id` (RESTRICT)
- `event_type`: `Enum("power_drop", "daily_report", "maintenance", "device_alert", "installation_update")`
- `channel`: `Enum("whatsapp", "email", "in_app")`
- `title`: `String(255)`
- `message`: `Text`
- `scheduled_at`: `DATETIME(fsp=6)`
- `sent_at?`: `DATETIME(fsp=6)`
- `read_at?`: `DATETIME(fsp=6)`
- `status`: `Enum("pending", "sending", "sent", "failed", "cancelled")`
- `attempt_count`: `Integer`
- `provider_message_id?`: `String(255)`
- `deduplication_key`: `String(191)`
- `last_error?`: `Text`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### articles

- `id`: `BIGINT(unsigned=True)` — primary key
- `slug`: `String(191)`
- `title`: `String(255)`
- `summary`: `Text`
- `content`: `LONGTEXT`
- `category`: `Enum("Panduan Pemula", "Finansial & ROI", "Teknis & Instalasi", "Regulasi & Kebijakan")`
- `author_name`: `String(255)`
- `author_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `published_at?`: `DATETIME(fsp=6)`
- `read_time_minutes`: `Integer`
- `cover_file_id?`: `BIGINT(unsigned=True)` → `files.id` (RESTRICT)
- `video_embed_url?`: `String(2048)`
- `is_published`: `Boolean`
- `archived_at?`: `DATETIME(fsp=6)`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### article_tags

- `article_id`: `BIGINT(unsigned=True)` → `articles.id` (CASCADE) — primary key
- `tag`: `String(100)` — primary key

### faqs

- `id`: `BIGINT(unsigned=True)` — primary key
- `question`: `Text`
- `answer`: `Text`
- `category`: `Enum("Umum", "Kalkulator & Biaya", "Teknis & Atap", "Proses Instalasi", "Garansi & Pemeliharaan")`
- `sort_order`: `Integer`
- `is_published`: `Boolean`
- `created_at`: `DATETIME(fsp=6)`
- `updated_at`: `DATETIME(fsp=6)`

### audit_logs

- `id`: `BIGINT(unsigned=True)` — primary key
- `actor_user_id?`: `BIGINT(unsigned=True)` → `users.id` (RESTRICT)
- `action`: `String(100)`
- `entity_type`: `String(100)`
- `entity_id`: `BIGINT(unsigned=True)`
- `changes_json`: `JSON`
- `created_at`: `DATETIME(fsp=6)`

## Aturan pada lapisan service saat endpoint bisnis ditambahkan

Database menyediakan FK, enum, CHECK, indeks, serta unique key. Aturan lintas record berikut juga harus ditegakkan oleh service; jangan menganggap ORM sendiri sudah menyediakan autentikasi atau otorisasi:

- Untuk operasi pelanggan, verifikasi kepemilikan melalui Customer → Site → System → Device. Jangan fallback ke record pertama.
- Kaitkan pengajuan anonim ke akun hanya setelah verifikasi, bukan berdasarkan email/telepon yang diketik.
- Tautan request.site_id harus milik request.customer_id; system.site_id harus sesuai dengan lokasi request asal.
- Perubahan status dan log dalam satu transaksi; gunakan version untuk concurrency. Status terminal tidak dapat maju lagi.
- Untuk interval tarif/faktor, kunci record solar_systems dengan SELECT FOR UPDATE sebelum memeriksa overlap dan menyimpan profil. Rentang [effective_from, effective_to) tidak boleh tumpang tindih.
- Snapshot hasil/asumsi kalkulasi dan snapshot paket tidak diubah saat profil atau katalog berubah. Validasi struktur JSON di Pydantic.
- Token refresh/reset/akses kalkulasi disimpan sebagai hash, bukan token mentah. Password selalu hash. Audit tidak menyimpan password/token.
- Kalender survei, penugasan lead, dan pemeliharaan harus divalidasi terhadap status pengajuan. Dokumen privat tidak dihidangkan sebagai URL publik tanpa otorisasi.
- Ingest ulang sampel memakai unique key device_id + recorded_at; interval sistem tidak boleh overlap. Adapter memilih sumber tiap kanal agar inverter dan meter tidak dihitung ganda.
- NULL berarti tidak ada pengukuran. Nilai nol hanya untuk pembacaan nol yang valid. Ringkasan menyimpan coverage_percent sebagai persentase kelengkapan data.
- Gunakan delta meter energi/integrasi interval terukur untuk kWh, bukan menjumlahkan kW. Baterai memerlukan sumber energi yang dapat diatribusikan agar penghematan tidak dihitung ganda.
- Penghematan = solar_self_consumed_kwh × tarif impor + ekspor yang berhak dikreditkan × kredit ekspor. Kredit ekspor default 0.
- Simpan faktor, kebijakan perhitungan karbon, timezone, dan versi algoritma di calculation_basis_json. Nilai faktor awal frontend merupakan asumsi simulasi, bukan klaim tarif atau kebijakan terkini.
- Job refresh harus menunggu respons perangkat; status offline tidak otomatis berubah normal. Pengiriman WhatsApp/email memerlukan adapter provider dan worker.
- Dashboard, ekspor CSV, total kapasitas, jumlah pelanggan/perangkat dihitung dari record aktual. Tidak memakai konstanta tambahan data demo.
- Untuk penurunan daya, bandingkan dengan baseline produksi yang relevan; penurunan malam hari bukan otomatis alert. Preferensi threshold default 40%, digest pukul 18:00 Asia/Jakarta, jadwal perawatan enam bulanan diterapkan oleh worker.
- ON UPDATE pada ORM ditangani SQLAlchemy; penulisan melalui SQL mentah harus memperbarui updated_at secara eksplisit.

## Pemetaan ke frontend

| Kontrak frontend | Sumber |
|---|---|
| User, profil, login/reset | users, customers, auth_sessions, account_tokens |
| Preferensi notifikasi | notification_preferences |
| CalculatorInput / CalculatorResult | solar_calculations, calculation_profiles |
| SolarPackage | solar_packages, package_components, package_items |
| InstallationRequest / timelineLogs | installation_requests, request_status_logs, request_documents, quotations, request_appointments, request_assignments, technicians |
| DeviceStatus | devices, device_telemetry, device_alerts; customerName lewat relasi sistem/lokasi |
| EnergyTelemetryPoint / grafik / CSV | system_energy_intervals, energy_daily_summaries |
| Dampak karbon / penghematan | energy_daily_summaries, system_financial_profiles |
| Article / tags | articles, article_tags, files |
| FAQItem | faqs |

API nantinya memetakan snake_case ke camelCase. ticket_number menjadi nomor tiket frontend; FK memakai ID internal. totalYieldMwh = total_yield_kwh / 1000. URL foto berasal dari layanan file setelah pemeriksaan akses. Nilai penghematan/produksi agregat tidak disimpan di users.

