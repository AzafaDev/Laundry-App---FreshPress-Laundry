# TASK DIVISION FINAL – LAUNDRY WEB APP (LENGKAP) – REVISI SESUAI BRD

## Sprint 1 – Foundation, Auth & Base Dashboards (Day 1-4)

| Owner  | Deliverable | Libraries |
| ------ | ----------- | --------- |
| Shared | Monorepo setup, Neon DB, Prisma schema + migration, shared types, ENV config | @neondatabase/serverless, @prisma/adapter-neon, @prisma/client, prisma, pg, dotenv, zod |
| A      | Landing page (navbar, hero carousel, footer) – **request izin lokasi user saat pertama kali akses** | next, tailwindcss, swiper, lucide-react, geolocation API browser |
| A      | Register (email + Google OAuth), login, JWT, redirect middleware | express, jsonwebtoken, bcrypt, zod, @prisma/client, axios, @tanstack/react-query, passport, passport-google-oauth20 |
| A      | Send verification + reset password emails, set password after verify (1h token) | nodemailer, jsonwebtoken, crypto, @prisma/client |
| B      | Role-based middleware, user management CRUD + paginated table (**saat create user worker, pilih tipe: washing/ironing/packing**), security headers + rate limiting | express, jsonwebtoken, @prisma/client, zod, @tanstack/react-query, axios, helmet, express-rate-limit |
| B      | Outlet CRUD, **tambah kolom service_radius_km (default 10 km)**, assign users to outlets, map view (Leaflet) | react-leaflet, leaflet, opencage-api-client, @prisma/client, zod |
| C      | Auth for Employee, Attendance clock-in/out API, history per user, outlet admin attendance report | express, @prisma/client, date-fns, zod |
| C      | Socket.IO server inside Express, driver + worker dashboard base layout | socket.io, socket.io-client, express, next, tailwindcss |

---

## Sprint 2 – Profile, Address, Order Management & Driver Flow (Day 5-8)

| Owner | Deliverable | Libraries |
| ----- | ----------- | --------- |
| A     | Edit profile, upload + validate photo (max 1MB, **ekstensi .jpg/.jpeg/.png/.gif**), update email with re-verify | cloudinary, multer, nodemailer, zod, @tanstack/react-query |
| A     | Address CRUD, geocode to coordinates (OpenCage), **simpan kota/kabupaten untuk ongkir (RajaOngkir)**, map picker UI | opencage-api-client, react-leaflet, leaflet, @prisma/client, zod, @tanstack/react-query |
| B     | Outlet admin: CRUD shift, assign shift ke worker/driver, validasi shift aktif saat absensi & proses order | @prisma/client, zod, express |
| B     | View + filter all orders, order tracking by status/worker/date (super admin lihat semua outlet, outlet admin lihat outletnya saja) | @prisma/client, date-fns, @tanstack/react-query, zustand, tailwindcss |
| B     | Laundry item master data CRUD | @prisma/client, zod, @tanstack/react-query |
| C     | Driver: request list (pickup/delivery), real-time notifications, update status, history, **validasi driver hanya bisa mengambil satu order aktif dalam satu waktu** | socket.io-client, @prisma/client, @tanstack/react-query, date-fns, axios |
| C     | Worker: **notifikasi hanya untuk station sesuai role (washing/ironing/packing)**, pending task list per station | socket.io-client, @tanstack/react-query, next, tailwindcss |

---

## Sprint 3 – Pickup, Create Order, Bypass & Worker Processing (Day 9-12)

| Owner | Deliverable | Libraries |
| ----- | ----------- | --------- |
| A     | Pickup request: select address + schedule, **cari outlet terdekat dengan jarak ≤ service_radius_km**, jika tidak ada dalam radius → error, assign driver via socket | geolib, socket.io-client, @prisma/client, zod, @tanstack/react-query, react-leaflet |
| A     | Order list with pagination + search, realtime status tracking UI | socket.io-client, @tanstack/react-query, date-fns, zustand |
| B     | Create order from pickup request: input kg + item quantities, generate invoice, status berubah menjadi `order_created` | @prisma/client, zod, date-fns, @tanstack/react-query |
| B     | Bypass flow: worker requests bypass **dengan foto bukti (max 2MB, .jpg/.png)** → admin approves/rejects with PIN, log reason | bcrypt, @prisma/client, socket.io-client, zod, multer, cloudinary |
| C     | Worker: re-input item quantities, validate vs previous station, block if mismatch, request bypass – **hanya bisa memproses order jika role-nya cocok dengan station** | @prisma/client, zod, socket.io-client, @tanstack/react-query |
| C     | Packing station: **check payment status. Jika lunas → ubah status ke `ready_for_delivery` dan auto-create delivery request. Jika belum lunas → ubah status ke `waiting_payment` (tidak membuat delivery request).** | @prisma/client, socket.io, date-fns |

---

## Sprint 4 – Payment, Reports, Polish & Deployment (Day 13-16)

| Owner  | Deliverable | Libraries |
| ------ | ----------- | --------- |
| A      | Midtrans Snap payment integration + webhook handler, **integrasi RajaOngkir hitung ongkir (kota outlet → kota alamat customer), tambahkan ke total tagihan** | midtrans-client, express, @prisma/client, crypto, axios |
| A      | **NOTIFIKASI PERINGATAN PEMBAYARAN PERIODIK:** Buat cron job berjalan setiap 6 jam untuk mengecek order dengan status `order_created`, `washing`, `ironing`, `packing` yang pembayarannya masih `unpaid`. Kirim notifikasi email + in-app ke customer (peringatan bahwa batas pembayaran adalah sampai packing selesai). | node-cron, nodemailer, socket.io, @prisma/client |
| A      | Saat packing selesai: jika status `waiting_payment`, kirim 1 notifikasi (email + in-app) ke customer | nodemailer, socket.io |
| A      | Auto-confirm order: cron tiap jam cek order dengan status `delivery_to_customer` > 48 jam, ubah jadi `completed` | node-cron, @prisma/client, date-fns |
| A      | Complaint submission (with photo, max 2MB, .jpg/.png), order confirmation UI, responsive polish | cloudinary, multer, @prisma/client, zod, tailwindcss |
| B      | Sales report: income per day/month/year, filter by outlet + date, export PDF/CSV | recharts, papaparse, pdf-lib, @prisma/client, date-fns |
| B      | Employee performance report: total jobs per worker/driver, filter by outlet + date, export PDF/CSV, responsive polish | recharts, papaparse, pdf-lib, @prisma/client, date-fns, tailwindcss |
| C      | Worker job history (per jenis worker), driver pickup/delivery history, responsive polish | @tanstack/react-query, date-fns, tailwindcss |
| Shared | Input sanitization (XSS), final security audit, **activity logging middleware (catat semua perubahan ke activity_logs)**, code cleanup (max 200 lines/file, max 15 lines/function) | xss, helmet, express-rate-limit, winston, eslint, prettier |
| Shared | Backend deployment (Railway), frontend deployment (Vercel), logging setup | winston, railway, vercel |

---

## Catatan Implementasi (Ringkasan) – Revisi

- **Driver** hanya bisa pegang satu order aktif (pickup/delivery) – validasi di backend.
- **Shift management** – worker/driver hanya proses order jika shift aktif dan sudah absen.
- **Worker 3 role** (washing, ironing, packing) – setiap worker hanya bisa mengerjakan station sesuai role-nya.
- **Radius layanan outlet** – jika tidak ada outlet dalam radius, customer tidak bisa request pickup.
- **Ongkos kirim** – dihitung dengan RajaOngkir (berdasarkan kota), ditambahkan ke total tagihan saat payment, pendapatan ongkir masuk ke outlet.
- **Geolokasi landing page** – minta izin lokasi saat pertama akses (tidak wajib disimpan).
- **Auto-confirm order** – cron tiap jam untuk status `delivery_to_customer` > 48 jam.
- **Notifikasi peringatan pembayaran** – cron setiap 6 jam untuk order unpaid dengan status sebelum packing selesai (FR-09.2).
- **Packing station** – hanya buat delivery request jika pembayaran sudah lunas; jika belum lunas, ubah ke `waiting_payment`.
- **Bypass request** – wajib menyertakan foto bukti (max 2MB, .jpg/.png).
- **Validasi file foto profil** – max 1MB, ekstensi .jpg/.jpeg/.png/.gif.
- **Activity log** – middleware otomatis mencatat semua operasi CREATE, UPDATE, DELETE, serta perubahan status order dan bypass.
- **Kode bersih** – setiap file maksimal 200 baris, setiap fungsi maksimal 15 baris.

---
