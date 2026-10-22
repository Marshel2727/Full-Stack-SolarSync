"""Explicit local demo-data import; never called at application startup.

Run: python -m app.seed_demo [--dry-run]
Existing rows are preserved. Natural keys make repeated imports additive/idempotent.
Customer contact details, prices, telemetry and documents are synthetic.
Articles are original Indonesian educational summaries with source attribution.
"""
import argparse
from collections import Counter
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
import json
import math
from pathlib import Path
import secrets
from zoneinfo import ZoneInfo

from fastapi.encoders import jsonable_encoder
from sqlalchemy import select

from app.model import (
    Article, ArticleTag, AuditLog, CalculationProfile, Customer, Device,
    DeviceAlert, DeviceTelemetry, EnergyDailySummary, FAQ, InstallationRequest,
    MaintenanceTask, NotificationDelivery, NotificationPreference,
    PackageComponent, PackageItem, Quotation, RequestAppointment,
    RequestAssignment, RequestDocument, RequestStatusLog, Site, SolarCalculation,
    SolarPackage, SolarSystem, StoredFile, SystemEnergyInterval,
    SystemFinancialProfile, Technician, User,
)
from app.service.package import package_data
from app.utils.cache import bump_epoch
from app.utils.config import get_settings
from app.utils.database import SessionLocal
from app.utils.passwords import passwords
from app.utils.uploads import private_file_path, store_attachment

MARKER = "demo-20261018-v1"
NOTE = "DATA SIMULASI untuk demo lokal; bukan pelanggan, penawaran, atau pengukuran nyata."
D = Decimal

CUSTOMERS = [
    ("Adi Pratama", "Samarinda", "household", 4, 3500),
    ("Nadia Permata", "Balikpapan", "household", 6, 5500),
    ("Rizky Saputra", "Bontang", "household", 8, 6600),
    ("Dewi Lestari", "Tenggarong", "household", 10, 7700),
    ("Usaha Kopi Mahakam", "Samarinda", "business", 12, 10600),
    ("Toko Berkah Energi", "Balikpapan", "business", 16, 16500),
    ("Kantor Harmoni", "Bontang", "business", 20, 23000),
    ("Sekolah Cahaya Ilmu", "Tenggarong", "school", 24, 33000),
    ("Bengkel Mitra Teknik", "Samarinda", "industry", 30, 41500),
    ("Gudang Nusantara", "Balikpapan", "industry", 40, 53000),
]

FAQ_DATA = [
    ("Apa yang dimaksud dengan PLTS atap?", "Umum",
     "PLTS atap menggunakan modul fotovoltaik untuk mengubah cahaya menjadi listrik. Panel bekerja bersama inverter, rangka, pengawatan, dan proteksi. Baca artikel pengantar di menu Edukasi untuk penjelasan dan sumbernya."),
    ("Apa perbedaan kWp dan kWh?", "Umum",
     "kWp adalah kapasitas nominal puncak panel pada kondisi pengujian standar. kWh adalah energi selama suatu periode. Kapasitas 5 kWp tidak berarti produksi 5 kWh pada setiap jam."),
    ("Apakah hasil kalkulator merupakan penawaran final?", "Kalkulator & Biaya",
     "Hasil kalkulator adalah estimasi dari input dan asumsi. Penawaran final membutuhkan survei, pemeriksaan struktur dan instalasi, rincian komponen, serta konfirmasi persyaratan setempat. Harga paket berlabel DEMO di situs ini adalah simulasi."),
    ("Apakah seluruh produksi surya menjadi penghematan tagihan?", "Kalkulator & Biaya",
     "Tidak selalu. Penghematan bergantung pada energi yang menggantikan pembelian listrik, pola konsumsi, biaya, serta ketentuan yang berlaku. Contoh perhitungan dalam artikel memakai asumsi yang dijelaskan, bukan tarif resmi."),
    ("Apakah semua luas atap bisa diisi panel?", "Teknis & Atap",
     "Luas efektif perlu memperhitungkan bayangan, struktur, bentuk atap, akses pemeliharaan, dan jalur instalasi. Luas keseluruhan atap belum membuktikan kelayakan pemasangan; perlu survei teknis."),
    ("Apakah PLTS pasti tetap menyala saat PLN padam?", "Teknis & Atap",
     "Kemampuan cadangan memerlukan rancangan yang mendukung operasi saat jaringan padam, termasuk inverter, penyimpanan bila diperlukan, dan pengamanan yang sesuai. Jangan menganggap semua sistem on-grid memiliki fungsi cadangan."),
    ("Data apa yang disiapkan sebelum mengajukan survei?", "Proses Instalasi",
     "Siapkan informasi alamat, daya tersambung, pemakaian energi, kondisi atap, dan tujuan pemasangan. Foto atau dokumen yang dikirim harus milik Anda dan sesuai kebutuhan layanan. Data DEMO pada situs ini hanya untuk mencoba alur."),
    ("Apakah pengajuan di website berarti izin PLTS disetujui?", "Proses Instalasi",
     "Pengajuan website adalah catatan permintaan layanan. Persetujuan penyambungan dan ketentuan kuota mengikuti proses resmi pemegang IUPTLU serta ketentuan yang berlaku di wilayah dan waktu permohonan. Lihat artikel regulasi beserta sumber ESDM."),
    ("Seberapa sering panel perlu dibersihkan?", "Garansi & Pemeliharaan",
     "Kebutuhan pembersihan mengikuti kondisi lokasi, penumpukan kotoran, hasil monitoring, dan petunjuk pabrikan. Minta rencana pemeriksaan dari teknisi; jangan melakukan pekerjaan berisiko di atap tanpa prosedur yang sesuai."),
    ("Apakah garansi dan hasil energi pada paket DEMO berlaku nyata?", "Garansi & Pemeliharaan",
     "Tidak. Harga, garansi, produksi, dan penghematan paket DEMO adalah data simulasi untuk pengujian tampilan. Garansi nyata harus merujuk dokumen pabrikan serta kontrak pemasangan; hasil energi membutuhkan penilaian lokasi."),
]


class Importer:
    def __init__(self, db, dry_run):
        self.db = db
        self.dry_run = dry_run
        self.created = Counter()
        self.existing = Counter()
        self.created_files = []
        self.password = None
        self.password_hash = None

    def get(self, entity_class, key, **values):
        row = self.db.scalar(select(entity_class).filter_by(**key))
        if row is not None:
            self.existing[entity_class.__tablename__] += 1
            return row
        row = entity_class(**key, **values)
        self.db.add(row)
        self.db.flush()
        self.created[entity_class.__tablename__] += 1
        return row

    def credential_hash(self):
        if self.password_hash is None:
            self.password = secrets.token_urlsafe(21)
            self.password_hash = passwords.hash(self.password)
        return self.password_hash

    def run(self):
        if get_settings().app_environment != "development":
            raise RuntimeError("Demo import is only allowed in the development environment.")
        admin = self.db.scalar(select(User).where(
            User.role == "admin", User.is_active.is_(True)).order_by(User.id))
        if admin is None:
            raise RuntimeError("Create an operator admin account first; no demo admin is created.")
        now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
        profile = self.get(CalculationProfile, {"version": MARKER},
            sun_hours_per_day=D("4"), system_efficiency=D("0.8"), panel_watt_peak=550,
            area_per_panel_sqm=D("2.6"), cost_per_kwp_min_idr=12000000,
            cost_per_kwp_max_idr=16000000, emission_factor=D("0.8"),
            tree_absorption_kg_per_year=22, is_active=False, effective_from=now,
            tariff_rules_json={"demo": True, "note": NOTE, "assumed_idr_per_kwh": 1500,
                               "export_credit_idr_per_kwh": 0})
        # Freeze the dataset's dates on its first import, including later reruns.
        anchor = profile.effective_from
        local_today = anchor.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("Asia/Makassar")).date()
        packages, users, systems, requests, techs = [], [], [], [], []
        statuses = ["Diajukan", "Diverifikasi", "Menunggu Survei", "Penawaran",
                    "Disetujui", "Dijadwalkan", "Instalasi", "Selesai", "Dibatalkan", "Menunggu Survei"]

        for i, (name, city, segment, panels, pln_va) in enumerate(CUSTOMERS, 1):
            label = f"{i:02d}"
            capacity = D(panels) * D("0.55")
            roof_area = D(panels * 4 + 20)
            price = capacity * 13000000
            production = capacity * D("4") * D("0.8") * 30
            package = self.get(SolarPackage, {"slug": f"demo-plts-{label}"},
                name=f"DEMO PLTS {str(capacity).replace('.', ',')} kWp",
                segment=segment, capacity_kwp=capacity, tagline="Paket simulasi untuk mencoba katalog",
                description=f"{NOTE} Harga dan garansi adalah ilustrasi, bukan penawaran. "
                    "Produksi memakai asumsi 4 jam matahari ekuivalen/hari, faktor kinerja 0,8, "
                    "30 hari/bulan. Penghematan memakai pemakaian langsung 70% dan tarif contoh Rp1.500/kWh; "
                    "nilai ekspor diasumsikan nol. Survei dan rancangan nyata tetap diperlukan.",
                price_from_idr=price, estimated_monthly_production_kwh=production,
                estimated_monthly_savings_idr=production * D("0.7") * 1500,
                warranty_panels_years=25, warranty_inverter_years=5, warranty_workmanship_years=2,
                recommended_roof_area_sqm=panels * 3, ideal_for=f"Contoh segmen {segment}; lokasi {city}",
                is_popular=i in (3, 5), is_active=True, sort_order=i)
            packages.append(package)
            for order, (component, spec, qty) in enumerate([
                ("Modul fotovoltaik (simulasi)", "550 Wp per modul; spesifikasi ilustratif", panels),
                ("Inverter on-grid (simulasi)", f"Rancangan contoh untuk sistem {capacity} kWp", 1),
                ("Rangka, kabel, dan proteksi (simulasi)", "Satu set; detail mengikuti survei nyata", 1),
            ]):
                self.get(PackageComponent, {"package_id": package.id, "sort_order": order},
                         name=component, specs=spec, quantity=qty)
            for order, (kind, content) in enumerate([
                ("feature", "Data ilustrasi untuk demonstrasi katalog dan dashboard"),
                ("feature", "Asumsi produksi dan penghematan tercantum dalam deskripsi"),
                ("included_service", "Contoh lingkup: survei dan perencanaan teknis"),
                ("included_service", "Contoh lingkup: instalasi dan pengujian oleh tenaga kompeten"),
                ("exclusion", "Baterai, penguatan struktur, dan biaya administratif tidak diasumsikan termasuk"),
                ("exclusion", "Harga dan masa garansi DEMO tidak berlaku sebagai penawaran nyata"),
            ]):
                self.get(PackageItem, {"package_id": package.id, "sort_order": order},
                         item_type=kind, content=content)
            email = f"demo.customer{label}@example.test"
            user = self.db.scalar(select(User).where(User.email == email))
            if user is None:
                user = self.get(User, {"email": email}, name=f"DEMO {name}",
                    password_hash=self.credential_hash(), role="customer", is_active=True)
            else:
                self.existing["users"] += 1
            users.append(user)
            customer = self.get(Customer, {"customer_code": f"DEMO-CUST-{label}"},
                user_id=user.id, name=f"DEMO {name}", email=email, phone=f"DEMO-CONTACT-{label}",
                notes=NOTE, is_active=True)
            self.get(NotificationPreference, {"user_id": user.id}, timezone="Asia/Makassar",
                whatsapp_enabled=False, notify_power_drop=False, notify_daily_report=False,
                notify_maintenance=False)
            site = self.get(Site, {"customer_id": customer.id, "name": f"DEMO Lokasi {label} - {city}"},
                address=f"Alamat fiktif DEMO Blok {label}, bukan alamat pelanggan nyata",
                city=city, property_type=segment, pln_power_va=pln_va, roof_area_sqm=roof_area,
                roof_type="spandek_metal", roof_orientation="optimal", shading_condition="none",
                timezone="Asia/Makassar", is_active=True)
            system = self.get(SolarSystem, {"site_id": site.id, "name": f"DEMO Sistem PLTS {label}"},
                capacity_kwp=capacity, panel_count=panels, panel_watt_peak=550,
                system_type="on_grid", status="active", grid_connection_status="connected",
                installed_at=anchor-timedelta(days=60), commissioned_at=anchor-timedelta(days=55))
            systems.append(system)
            self.get(SystemFinancialProfile, {"system_id": system.id, "effective_from": anchor-timedelta(days=55)},
                import_tariff_idr_per_kwh=1500, export_credit_idr_per_kwh=0,
                emission_factor_kg_per_kwh=D("0.8"), tree_absorption_kg_per_year=22)
            calculation = self.get(SolarCalculation, {"user_id": user.id, "profile_id": profile.id},
                city=city, property_type=segment, monthly_kwh=production/D("0.7"),
                monthly_bill_idr=production/D("0.7")*1500, pln_power_va=pln_va,
                roof_area_sqm=roof_area, roof_orientation="optimal", shading_condition="none",
                target_coverage_percent=70,
                result_json={"demo": True, "capacityKwp": float(capacity), "panelCount": panels,
                    "monthlyProductionKwh": float(production), "investmentIdr": float(price),
                    "monthlySavingsIdr": float(production*D("0.7")*1500)},
                assumptions_json={"demo": True, "note": NOTE, "sun_hours_per_day": 4,
                    "performance_factor": 0.8, "days_per_month": 30,
                    "self_consumption_fraction": 0.7, "tariff_idr_per_kwh": 1500,
                    "export_credit_idr_per_kwh": 0})
            status = statuses[i-1]
            submitted = anchor-timedelta(days=20+i)
            req = self.get(InstallationRequest, {"ticket_number": f"DEMO-REQ-{label}"},
                customer_id=customer.id, site_id=site.id, submitted_by_user_id=user.id,
                calculation_id=calculation.id, package_id=package.id, full_name=customer.name,
                phone_number=customer.phone, email=email, address=site.address, city=city,
                property_type=segment, pln_power_va=pln_va,
                monthly_bill_idr=calculation.monthly_bill_idr, roof_area_sqm=roof_area,
                package_snapshot_json=jsonable_encoder(package_data(self.db, package)),
                notes=f"{NOTE} Pengajuan perluasan terpisah dari sistem DEMO yang sudah aktif.",
                status=status, consent_version="demo-no-real-submission", consented_at=submitted,
                created_at=submitted)
            requests.append(req)
            path = statuses[:8]
            steps = (["Diajukan", "Diverifikasi", "Dibatalkan"] if status == "Dibatalkan"
                     else path[:path.index(status)+1])
            for order, step in enumerate(steps):
                self.get(RequestStatusLog, {"request_id": req.id, "to_status": step},
                    from_status=steps[order-1] if order else None,
                    note=f"SIMULASI: contoh tahapan {step.lower()}, bukan tindakan layanan nyata.",
                    actor_name_snapshot="Import data DEMO", created_at=submitted+timedelta(days=order))
            # Real downloadable text attachment, explicitly not a bill, permit or certificate.
            document = self.db.scalar(select(RequestDocument).where(
                RequestDocument.request_id == req.id, RequestDocument.document_number == f"DEMO-NOTE-{label}"))
            if document is None:
                payload = (f"CATATAN DEMO SOLARSYNC {label}\n\n{NOTE}\n"
                    f"Nomor pengajuan: {req.ticket_number}\nLokasi simulasi: {city}\n"
                    f"Kapasitas contoh: {capacity} kWp\n\n"
                    "Berkas ini hanya lampiran pengujian. Bukan bukti survei, tagihan PLN, "
                    "persetujuan, SLO, atau dokumen legal. Tidak ada data pribadi nyata.\n").encode("utf-8")
                key = secrets.token_hex(16)
                if not self.dry_run:
                    key = store_attachment({"content": payload})
                    self.created_files.append(key)
                stored = self.get(StoredFile, {"storage_key": key}, original_name=f"catatan-demo-{label}.txt",
                    mime_type="text/plain; charset=utf-8", size_bytes=len(payload), visibility="private")
                self.get(RequestDocument, {"request_id": req.id, "document_number": f"DEMO-NOTE-{label}"},
                    document_type="other", file_id=stored.id, status="pending", notes=NOTE)
            else:
                stored = self.db.get(StoredFile, document.file_id)
                if not stored or (not self.dry_run and not private_file_path(stored.storage_key).is_file()):
                    raise RuntimeError("An existing demo attachment is missing; refusing to hide a broken file.")
                self.existing["request_documents"] += 1
            tech = self.get(Technician, {"name": f"DEMO Teknisi {label}"},
                phone=f"DEMO-TECH-{label}", qualification="Personel simulasi; bukan klaim sertifikasi", is_active=True)
            techs.append(tech)
            device = self.get(Device, {"device_code": f"DEMO-INV-{label}"}, system_id=system.id,
                device_type="inverter", serial_number=f"DEMO-SERIAL-{label}",
                model=f"DEMO Inverter {capacity} kWp", firmware_version="simulation-v1",
                status="warning" if i in (3, 7) else "normal", last_seen_at=anchor,
                expected_interval_seconds=300, is_active=True)
            alert = self.get(DeviceAlert, {"device_id": device.id, "code": f"DEMO-CHECK-{label}"},
                level="warning" if i in (3, 7) else "info",
                message="SIMULASI: contoh notifikasi pemeriksaan performa, bukan gangguan perangkat nyata.",
                occurred_at=anchor-timedelta(days=1),
                resolved_at=None if i in (3, 7) else anchor-timedelta(hours=12))
            completed = i % 3 == 0
            maintenance = self.get(MaintenanceTask, {"system_id": system.id, "task_type": f"DEMO inspeksi {label}"},
                technician_id=tech.id, scheduled_at=anchor+timedelta(days=-2 if completed else i),
                completed_at=anchor-timedelta(days=1) if completed else None,
                status="completed" if completed else "scheduled", notes=NOTE)
            self.get(NotificationDelivery, {"deduplication_key": f"{MARKER}-in-app-{label}"},
                user_id=user.id, system_id=system.id, device_alert_id=alert.id,
                maintenance_task_id=maintenance.id, event_type="maintenance", channel="in_app",
                title=f"DEMO Informasi perawatan {label}", message=NOTE,
                scheduled_at=anchor, sent_at=anchor, status="sent", attempt_count=0)
            self.get(AuditLog, {"action": "demo_seed", "entity_type": "customers", "entity_id": customer.id},
                changes_json={"dataset": MARKER, "demo": True, "action": "Imported synthetic demo data"})
            self.seed_energy(system, device, capacity, anchor, local_today)

        # Two quotation revisions for each request that has reached quotation stage.
        for index in (3, 4, 5, 6, 7):
            req = requests[index]
            for revision in (1, 2):
                accepted = revision == 2 and index >= 4
                self.get(Quotation, {"request_id": req.id, "revision_number": revision},
                    amount_idr=packages[index].price_from_idr * (D("1.05") if revision == 1 else D("1")),
                    status="superseded" if revision == 1 else ("accepted" if accepted else "sent"),
                    notes=f"{NOTE} Revisi penawaran contoh {revision}.",
                    issued_at=anchor-timedelta(days=15-revision),
                    accepted_at=anchor-timedelta(days=10) if accepted else None,
                    created_by_user_id=admin.id)
        # Ten survey/installation appointments, respecting each request's stage.
        appointments = [(2, "survey"), (9, "survey"), (3, "survey"), (4, "survey"),
                        (5, "survey"), (6, "survey"), (7, "survey"),
                        (5, "installation"), (6, "installation"), (7, "installation")]
        for order, (index, kind) in enumerate(appointments):
            done = kind == "survey" and index not in (2, 9) or index == 7
            current = kind == "installation" and index == 6
            start = anchor + timedelta(days=-12 if done else (0 if current else 2+order))
            self.get(RequestAppointment, {"request_id": requests[index].id, "appointment_type": kind},
                scheduled_start_at=start, scheduled_end_at=start+timedelta(hours=2),
                status="completed" if done else "scheduled", notes=NOTE, created_by_user_id=admin.id)
            self.get(RequestAssignment, {"request_id": requests[index].id, "technician_id": techs[order].id},
                assignment_role="lead" if order < 7 else "member",
                field_status="completed" if done else ("on_site" if current else "assigned"),
                assigned_by_user_id=admin.id, assigned_at=start-timedelta(days=1),
                ended_at=start+timedelta(hours=2) if done else None)

        self.seed_articles(anchor)
        for order, (question, category, answer) in enumerate(FAQ_DATA, 1):
            self.get(FAQ, {"question": question}, answer=answer, category=category,
                     sort_order=order, is_published=True)
        # Cache epochs change transactionally only when new domain records were added.
        if self.created:
            for namespace in ("articles", "packages", "faqs", *(f"system-{s.id}" for s in systems)):
                bump_epoch(self.db, namespace)
        return {"dataset": MARKER, "dry_run": self.dry_run,
                "created": dict(sorted(self.created.items())), "existing": dict(sorted(self.existing.items())),
                "demo_customers": [u.email for u in users], "anchor_utc": anchor.isoformat()+"Z"}

    def seed_energy(self, system, device, capacity, anchor, local_today):
        local_anchor = anchor.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("Asia/Makassar"))
        elapsed_hours = D(str(local_anchor.hour+local_anchor.minute/60))
        daylight_fraction = min(D(1), max(D(0), (elapsed_hours-D(6))/D(12)))
        for day in range(10):
            local_date = local_today-timedelta(days=9-day)
            # Today is a partial-day aggregate up to the seed time, never future energy.
            hours = D("3.2") * daylight_fraction if day == 9 else D("3.2")
            weather = D(str([0.82, 0.94, 0.73, 1.02, 0.87, 0.98, 0.76, 0.91, 1.0, 0.88][day]))
            production = (capacity*hours*weather).quantize(D("0.000001"))
            consumption = (capacity*D("4.48") *
                (elapsed_hours/D(24) if day == 9 else D(1))).quantize(D("0.000001"))
            own = min(consumption, (production*D("0.7")).quantize(D("0.000001")))
            exported, imported = production-own, consumption-own
            self.get(EnergyDailySummary, {"system_id": system.id, "local_date": local_date},
                production_kwh=production, consumption_kwh=consumption,
                grid_export_kwh=exported, grid_import_kwh=imported, solar_self_consumed_kwh=own,
                savings_idr=own*1500, co2_avoided_kg=own*D("0.8"),
                peak_power_kw=capacity*D("0.75") if hours else 0,
                coverage_percent=own/consumption*100 if consumption else 0,
                calculation_basis_json={"demo": True, "dataset": MARKER, "note": NOTE,
                    "quality_status": "estimated", "partial_day": day == 9,
                    "tariff_idr_per_kwh": 1500, "export_credit_idr_per_kwh": 0,
                    "emission_factor_kg_per_kwh": 0.8})
        # Ten recent five-minute samples with a balanced on-grid energy flow.
        for sample in range(10):
            end = anchor-timedelta(minutes=(9-sample)*5)
            start = end-timedelta(minutes=5)
            local_hour = end.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("Asia/Makassar"))
            hour = local_hour.hour+local_hour.minute/60
            sunlight = max(0.0, math.sin(math.pi*(hour-6)/12)) if 6 <= hour <= 18 else 0.0
            power = (capacity*D(str(sunlight))*D("0.75")).quantize(D("0.000001"))
            load = (capacity*D("0.55")).quantize(D("0.000001"))
            own = min(power, load)
            exported, imported = power-own, load-own
            energy = lambda kw: (kw/D(12)).quantize(D("0.000001"))
            self.get(DeviceTelemetry, {"device_id": device.id, "recorded_at": end},
                received_at=end, current_power_kw=power, voltage_v=230,
                current_a=(power*1000/D(230)).quantize(D("0.000001")), grid_frequency_hz=50,
                temperature_c=D("34")+sample/D(10),
                total_yield_kwh=capacity*100+energy(power)*sample,
                efficiency_percent=97 if power else 0, quality_status="estimated")
            self.get(SystemEnergyInterval, {"system_id": system.id, "interval_start_at": start},
                interval_end_at=end, solar_production_kw=power, home_consumption_kw=load,
                grid_export_kw=exported, grid_import_kw=imported,
                battery_charge_kw=0, battery_discharge_kw=0, production_kwh=energy(power),
                consumption_kwh=energy(load), grid_export_kwh=energy(exported),
                grid_import_kwh=energy(imported), solar_self_consumed_kwh=energy(own),
                quality_status="estimated")

    def seed_articles(self, anchor):
        data = json.loads(Path(__file__).with_name("demo_articles.json").read_text(encoding="utf-8"))
        if len(data) != 10 or len({item["slug"] for item in data}) != 10:
            raise ValueError("Exactly ten unique educational articles are required.")
        for i, item in enumerate(data):
            references = "\n\n".join(
                f"[{j}] {source['title']}\n{source['url']}" for j, source in enumerate(item["sources"], 1))
            content = "\n\n".join(item["paragraphs"])+"\n\nSumber dan bacaan lanjutan\n\n"+references
            content += ("\n\nDisusun untuk edukasi SolarSync dari sumber yang dicantumkan; "
                        "bukan salinan artikel sumber. Sumber diperiksa 18 Oktober 2026. "
                        "Contoh angka yang disebut sebagai asumsi merupakan simulasi pembelajaran.")
            article = self.get(Article, {"slug": item["slug"]}, title=item["title"],
                summary=item["summary"], content=content, category=item["category"],
                author_name="Redaksi Edukasi SolarSync", published_at=anchor-timedelta(minutes=i),
                read_time_minutes=max(1, math.ceil(len(content.split())/200)), is_published=True)
            for tag in item["tags"]:
                self.get(ArticleTag, {"article_id": article.id, "tag": tag})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Validate real DB constraints, then roll back; no files written")
    args = parser.parse_args()
    with SessionLocal() as db:
        importer = Importer(db, args.dry_run)
        try:
            result = importer.run()
            if args.dry_run:
                db.rollback()
            else:
                db.commit()
        except Exception:
            db.rollback()
            for key in importer.created_files:
                private_file_path(key).unlink(missing_ok=True)
            raise
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if importer.password and not args.dry_run:
            print("NEW_DEMO_CUSTOMER_PASSWORD="+importer.password)
            print("Only newly created demo customers use this password. Existing accounts were not modified.")


if __name__ == "__main__":
    main()
