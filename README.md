# 🧺 FreshPress Laundry

**Sistem manajemen laundry multi-outlet, real-time, multi-role** — dari customer request pickup sampai diterima kembali, lengkap dengan tracking driver, verifikasi item per station, payment gateway, dan dashboard laporan admin lintas-outlet.

Tugas akhir — backend (Express + Prisma + PostgreSQL + Socket.IO) dan frontend (Next.js) sebagai 2 aplikasi terpisah dalam satu repo.

```
apps/
  api/   → REST API + WebSocket server
  web/   → Web app (customer & employee dashboard)
```

---

## Engineering Highlights

Beberapa keputusan desain yang jadi fokus utama project ini — bukan cuma CRUD biasa:

### 1. Optimistic locking untuk cegah race condition
Saat 2 driver klaim task pickup yang sama bersamaan, atau 2 worker submit verifikasi station yang sama nyaris bersamaan, sistem pakai pola `updateMany` dengan kondisi status lama di `WHERE` clause:
```ts
const result = await tx.driverTask.updateMany({
  where: { id: taskId, status: "available", driver_id: null },
  data: { driver_id: employeeId, status: "in_progress" },
});
if (result.count === 0) throw new AppError("Task sudah diambil driver lain", 409);
```
Kalau dua request datang bersamaan, cuma satu yang berhasil update — yang kedua otomatis tahu dia "kalah" lewat `count === 0`, tanpa perlu row-level locking eksplisit.

### 2. Refresh token rotation + single-flight guard
Setiap refresh access token, refresh token lama langsung di-revoke dan diganti baru (mitigasi replay attack). Tapi ini bikin race condition kalau ada beberapa request 401 hampir bersamaan — bisa saling "membunuh" token masing-masing. Solusinya: di-coalesce jadi satu in-flight promise yang dibagi semua pemanggil:
```ts
let inFlightRefresh: Promise<boolean> | null = null;

export function performSilentRefresh(authType) {
  if (inFlightRefresh) return inFlightRefresh; // request lain numpang nunggu, gak bikin baru
  inFlightRefresh = axios.post(refreshUrl, ...).then(...).finally(() => { inFlightRefresh = null; });
  return inFlightRefresh;
}
```

### 3. Real-time socket dengan room-scoping per outlet + self-healing auth
Event socket (`station:order-completed`, `driver:task-claimed`, dst) di-broadcast ke room `outlet:{id}` — bukan global — supaya outlet A gak nerima noise dari outlet B. Karena koneksi socket bisa hidup lama (jam/hari) sementara access token cuma berumur 15 menit, ada periodic silent-refresh di background supaya reconnect handshake gak pernah gagal karena token kadaluarsa diam-diam.

### 4. Pemisahan layer: service / repository / helper
Domain `driver-worker` (yang paling kompleks: claim task, verifikasi station, bypass request) dipisah jadi:
- **service** — orkestrasi (guard → repository → helper → return)
- **repository** — transaksi Prisma murni
- **helper** — pure function (kalkulasi status) + orkestrasi efek samping (notifikasi/socket)

Bukan satu file raksasa yang nyampur semuanya — tiap layer bisa di-test/diganti independen.

### 5. Bypass request flow untuk audit ketidaksesuaian
Kalau jumlah item yang diterima worker beda dari yang tercatat di order, sistem **tidak** langsung percaya salah satu sisi — order di-hold, worker wajib upload foto bukti + deskripsi, lalu outlet admin yang approve/reject. Maksimal 2x percobaan sebelum order butuh eskalasi.

---

## Fitur per Role

### Customer
- Request pickup (auto-assign ke outlet terdekat berdasarkan radius layanan)
- Tracking status order real-time (lewat socket, gak perlu refresh)
- Pembayaran via Midtrans
- Komplain order (upload foto)
- Riwayat order & alamat tersimpan

### Driver
- Lihat daftar task pickup/delivery yang tersedia (di-filter per outlet, per shift)
- Klaim task (cuma bisa 1 task aktif di satu waktu)
- Complete task → trigger notifikasi customer otomatis
- Riwayat task selesai (dengan pagination)
- Attendance check-in/check-out dengan validasi geolokasi

### Worker (Washing / Ironing / Packing)
- Antrian order per station (real-time update)
- Verifikasi jumlah item aktual vs yang tercatat
- Kalau cocok → auto lanjut ke station berikutnya
- Kalau tidak cocok → ajukan bypass request (foto + deskripsi)
- Riwayat task selesai

### Outlet Admin
- Approve/reject bypass request
- Kelola staff & shift outlet
- Proses order masuk (input berat, breakdown item)
- Laporan attendance & performa karyawan (scoped ke outlet sendiri)

### Super Admin
- Kelola semua outlet
- Laporan sales (per hari/bulan/tahun, lintas outlet)
- Laporan performa karyawan lintas outlet
- Kelola data master (outlet, jenis layanan, shift)

---

## Tech Stack

| | Backend (`apps/api`) | Frontend (`apps/web`) |
|---|---|---|
| **Core** | Express 5, TypeScript (ESM) | Next.js (App Router), React 19 |
| **Database** | PostgreSQL (Neon), Prisma 7 | — |
| **Realtime** | Socket.IO server | Socket.IO client |
| **Auth** | JWT (access + refresh, httpOnly cookie) | Zustand (`persist`) |
| **Data fetching** | — | TanStack React Query |
| **Validasi** | Zod | Zod + React Hook Form |
| **Integrasi** | Resend (email), Cloudinary (upload), Midtrans (payment), Google OAuth, OpenCage (geocoding) | — |
| **Styling** | — | Tailwind CSS |
| **Lainnya** | Jest (testing) | Leaflet (peta), Recharts (chart) |

---

## Arsitektur

### Siklus order
```
Customer request pickup
      │
      ▼
Driver claim & pickup ──→ laundry tiba di outlet
      │
      ▼
washing → ironing → packing   (tiap station: verifikasi item, bisa trigger bypass)
      │
      ▼
menunggu pembayaran  /  siap dikirim
      │
      ▼
Driver claim & deliver ──→ diterima customer (auto-confirm 48 jam kalau tidak dikonfirmasi manual)
```

### Layer backend (domain `driver-worker`)
```
routes/v1/driver-worker.routes.ts
        │
        ▼
controllers/driver-worker/*.controller.ts   (parsing request, bentuk response)
        │
        ▼
services/driver-worker/*.service.ts         (orkestrasi: guard → repository → helper)
        │              │
        ▼              ▼
repositories/*.ts   helpers/*.ts
(transaksi DB)      (kalkulasi + notifikasi/socket)
```

### Struktur folder
```
apps/api/src/
  controllers/   → terima request, panggil service, bentuk response
  services/      → business logic per domain
  repositories/  → query Prisma murni (domain driver-worker)
  helpers/       → pure function & orkestrasi efek samping
  guards/        → authorization logic reusable (shift eligibility, dsb)
  middlewares/   → auth, error handler, rate limit, role check, validate
  validations/   → zod schema per domain
  cron/          → scheduled job (auto-complete order, cleanup token, mark absent)
  lib/           → integrasi eksternal (prisma, socket.io, email, notification)
  utils/         → utility umum (jwt, format tanggal, time WIB)

apps/web/
  app/           → routing per role (customer, employee, dashboard/*)
  src/components/→ UI per domain (worker, driver, admin, dst)
  src/hooks/     → React Query hooks + hook utilitas (socket, auth, file validation)
  src/services/  → HTTP client per domain
  src/stores/    → Zustand store (auth)
  src/lib/       → axios instance, socket client
```

---

## Setup Lokal

```bash
# Backend
cd apps/api
npm install
# isi .env: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET (wajib) — lihat src/config/env.ts
npx prisma generate && npx prisma migrate dev
npm run seed   # data dummy
npm run dev    # → localhost:8080

# Frontend
cd apps/web
npm install
# isi .env: NEXT_PUBLIC_URL, NEXT_PUBLIC_SOCKET_URL
npm run dev    # → localhost:3000
```

> Pakai Neon (serverless Postgres)? Kalau dapat error `P1001: Can't reach database server`, itu auto-suspend tier gratis — coba ulang, biasanya langsung normal.

---

## Screenshot

<!-- Tambahkan screenshot UI di sini -->
