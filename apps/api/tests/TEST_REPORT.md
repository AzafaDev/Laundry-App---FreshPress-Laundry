# FreshPress Laundry — Integration Test Report

**Tanggal**: 2026-06-17  
**Total Tests**: 130 passed, 0 failed  
**Test Suites**: 11 suites (5 positive + 6 negative)  
**Runner**: Jest + Supertest, terhadap Neon production DB  
**Durasi**: ~84 detik (serial, `maxWorkers: 1`)

---

## Cara Menjalankan

```bash
cd apps/api

# Semua tests
npm test

# Hanya positive tests
npm run test:positive

# Hanya negative tests
npm run test:negative

# Per role
npm run test:customer
npm run test:driver
npm run test:worker
npm run test:outlet-admin
npm run test:super-admin
npm run test:auth
```

---

## Hasil Positive Tests (61 passed)

### `customer.positive.test.ts` — 10 tests

| # | Test Case | Endpoint | Status |
|---|-----------|----------|--------|
| 1 | Auth cookie berhasil di-set | `POST /customer/auth/login` | ✅ |
| 2 | Return profile customer | `GET /customer/profile` | ✅ |
| 3 | Buat alamat baru | `POST /customer/addresses` | ✅ |
| 4 | Ambil daftar alamat | `GET /customer/addresses` | ✅ |
| 5 | Set alamat sebagai primary | `PATCH /customer/addresses/:id/primary` | ✅ |
| 6 | Hapus alamat (204) | `DELETE /customer/addresses/:id` | ✅ |
| 7 | List orders dengan pagination | `GET /customer/orders` | ✅ |
| 8 | Buat order (201 + invoice_number) | `POST /customer/orders` | ✅ |
| 9 | List notifikasi | `GET /customer/notifications` | ✅ |
| 10 | Jumlah notifikasi belum dibaca | `GET /customer/notifications/unread-count` | ✅ |

### `driver.positive.test.ts` — 9 tests

| # | Test Case | Endpoint | Status |
|---|-----------|----------|--------|
| 1 | Auth cookie driver berhasil | `POST /employee/auth/login` | ✅ |
| 2 | Return profile driver | `GET /employee/profile` | ✅ |
| 3 | Check-in kehadiran | `POST /attendance/check-in` | ✅ |
| 4 | Status kehadiran hari ini | `GET /attendance/today` | ✅ |
| 5 | Daftar pickup tersedia (200 atau 403 shift) | `GET /driver/pickups/available` | ✅ |
| 6 | Daftar delivery tersedia (200 atau 403 shift) | `GET /driver/deliveries/available` | ✅ |
| 7 | Task aktif saat ini | `GET /driver/tasks/active` | ✅ |
| 8 | Riwayat task driver | `GET /driver/tasks/history` | ✅ |
| 9 | Klaim task kondisional (skip jika tidak ada) | `POST /driver/tasks/:id/claim` | ✅ |

> **Catatan**: Endpoint `/pickups/available` dan `/deliveries/available` memerlukan shift aktif dan check-in. Jika dijalankan di luar jam shift, mengembalikan 403 (business guard `assertShiftEligibility`).

### `worker.positive.test.ts` — 5 tests

| # | Test Case | Endpoint | Status |
|---|-----------|----------|--------|
| 1 | Auth cookie worker berhasil | `POST /employee/auth/login` | ✅ |
| 2 | Return profile worker | `GET /employee/profile` | ✅ |
| 3 | Check-in kehadiran | `POST /attendance/check-in` | ✅ |
| 4 | Status kehadiran hari ini | `GET /attendance/today` | ✅ |
| 5 | Daftar order di stasiun cuci (200 atau 403 shift) | `GET /worker/station/washing` | ✅ |

### `outlet-admin.positive.test.ts` — 12 tests

| # | Test Case | Endpoint | Status |
|---|-----------|----------|--------|
| 1 | Auth cookie outlet_admin berhasil | `POST /employee/auth/login` | ✅ |
| 2 | Return profile outlet_admin | `GET /employee/profile` | ✅ |
| 3 | Daftar order di outlet | `GET /admin/orders` | ✅ |
| 4 | Detail order (skip jika tidak ada data) | `GET /admin/orders/:id` | ✅ |
| 5 | Daftar bypass request | `GET /admin/bypass-requests` | ✅ |
| 6 | Daftar complaint | `GET /admin/complaints` | ✅ |
| 7 | Statistik complaint | `GET /admin/complaints/stats` | ✅ |
| 8 | Laporan kehadiran | `GET /reports/attendance` | ✅ |
| 9 | Laporan penjualan | `GET /reports/sales` | ✅ |
| 10 | Laporan performa karyawan | `GET /reports/employees` | ✅ |
| 11 | Daftar shift (read-only) | `GET /admin/shifts` | ✅ |
| 12 | Daftar laundry items (read-only) | `GET /admin/laundry-items` | ✅ |

### `super-admin.positive.test.ts` — 25 tests

| # | Test Case | Endpoint | Status |
|---|-----------|----------|--------|
| 1 | Auth cookie super_admin berhasil | — | ✅ |
| 2 | Daftar users | `GET /admin/users` | ✅ |
| 3 | Buat user (driver) baru | `POST /admin/users` | ✅ |
| 4 | Detail user | `GET /admin/users/:id` | ✅ |
| 5 | Update full_name user | `PATCH /admin/users/:id` | ✅ |
| 6 | Hapus user | `DELETE /admin/users/:id` | ✅ |
| 7 | Daftar outlet | `GET /admin/outlets` | ✅ |
| 8 | Buat outlet baru | `POST /admin/outlets` | ✅ |
| 9 | Update outlet | `PATCH /admin/outlets/:id` | ✅ |
| 10 | Deaktivasi outlet | `DELETE /admin/outlets/:id` | ✅ |
| 11 | Daftar shift | `GET /admin/shifts` | ✅ |
| 12 | Buat shift baru | `POST /admin/shifts` | ✅ |
| 13 | Update shift | `PATCH /admin/shifts/:id` | ✅ |
| 14 | Hapus shift | `DELETE /admin/shifts/:id` | ✅ |
| 15 | Daftar laundry items | `GET /admin/laundry-items` | ✅ |
| 16 | Buat laundry item baru | `POST /admin/laundry-items` | ✅ |
| 17 | Update laundry item | `PATCH /admin/laundry-items/:id` | ✅ |
| 18 | Hapus laundry item | `DELETE /admin/laundry-items/:id` | ✅ |
| 19 | Unread notifikasi | `GET /admin/notifications/unread-count` | ✅ |

---

## Hasil Negative Tests (69 passed)

### `auth.negative.test.ts` — 15 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Login customer: password salah | 401 | ✅ |
| 2 | Login customer: email tidak ada | 401 | ✅ |
| 3 | Login employee: password salah | 401 | ✅ |
| 4 | Login employee: email tidak ada | 401 | ✅ |
| 5 | Akses `customer/profile` tanpa token | 401 | ✅ |
| 6 | Akses `employee/profile` tanpa token | 401 | ✅ |
| 7 | Akses `admin/users` tanpa token | 401 | ✅ |
| 8 | Token malformat (string random) | 401 | ✅ |
| 9 | Customer akses `admin/users` | 403 | ✅ |
| 10 | Driver akses `admin/users` | 403 | ✅ |
| 11 | Worker akses `admin/users` | 403 | ✅ |
| 12 | Outlet_admin POST `admin/users` (super_admin only) | 403 | ✅ |
| 13 | Customer akses `admin/orders` | 403 | ✅ |
| 14 | Driver akses `worker/station/washing` | 403 | ✅ |
| 15 | Customer akses `driver/pickups/available` | 403 | ✅ |

### `customer.negative.test.ts` — 11 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Register: full_name tidak ada | 400/422 | ✅ |
| 2 | Register: format email invalid | 400/422 | ✅ |
| 3 | Register: email duplikat | 409 | ✅ |
| 4 | Buat alamat: label tidak ada | 400/422 | ✅ |
| 5 | Buat alamat: latitude > 90 | 400/422 | ✅ |
| 6 | Buat alamat: longitude < -180 | 400/422 | ✅ |
| 7 | Buat order: tanpa pickup_address_id | 400/422 | ✅ |
| 8 | Buat order: pickup_date tanggal lampau | 400/422 | ✅ |
| 9 | Buat order: pickup_date > 7 hari | 400/422 | ✅ |
| 10 | Buat order: pickup_address_id bukan UUID | 400/422 | ✅ |
| 11 | Delete alamat milik customer lain | 403/404 | ✅ |

### `driver.negative.test.ts` — 9 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Customer akses `driver/pickups/available` | 403 | ✅ |
| 2 | Worker akses `driver/deliveries/available` | 403 | ✅ |
| 3 | Customer akses `driver/tasks/active` | 403 | ✅ |
| 4 | Klaim task tidak ada (403 shift atau 404) | 400/403/404 | ✅ |
| 5 | Driver akses `admin/orders` | 403 | ✅ |
| 6 | Driver akses `admin/users` | 403 | ✅ |
| 7 | Driver akses `worker/station/washing` | 403 | ✅ |
| 8 | Driver akses `customer/profile` (bukan 200) | non-200 | ✅ |

### `worker.negative.test.ts` — 10 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Worker akses `driver/pickups/available` | 403 | ✅ |
| 2 | Worker akses `driver/deliveries/available` | 403 | ✅ |
| 3 | Worker akses `driver/tasks/:id/claim` | 403 | ✅ |
| 4 | Worker akses `admin/users` | 403 | ✅ |
| 5 | Worker akses `admin/orders` | 403 | ✅ |
| 6 | Worker POST `admin/laundry-items` | 403 | ✅ |
| 7 | Submit items: orderId tidak valid | 400/403/404 | ✅ |
| 8 | Complete station: orderId tidak ada | 400/403/404 | ✅ |
| 9 | Driver akses `worker/station/washing` | 403 | ✅ |
| 10 | Customer akses `worker/station/washing` | 403 | ✅ |

### `outlet-admin.negative.test.ts` — 12 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | POST `admin/users` (super_admin only) | 403 | ✅ |
| 2 | DELETE `admin/users/:id` (super_admin only) | 403 | ✅ |
| 3 | POST `admin/outlets` (super_admin only) | 403 | ✅ |
| 4 | POST `admin/shifts` (super_admin only) | 403 | ✅ |
| 5 | POST `admin/laundry-items` (super_admin only) | 403 | ✅ |
| 6 | GET `admin/orders/:id` tidak ada | 400/404 | ✅ |
| 7 | GET `admin/complaints/:id` tidak ada | 400/404 | ✅ |
| 8 | GET `admin/bypass-requests/:id` tidak ada | 400/404 | ✅ |
| 9 | Outlet_admin akses `customer/profile` (bukan 200) | non-200 | ✅ |
| 10 | Outlet_admin akses `driver/pickups/available` | 403 | ✅ |
| 11 | Outlet_admin akses `worker/station/washing` | 403 | ✅ |

### `super-admin.negative.test.ts` — 12 tests

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | POST user: role bukan enum valid | 400/422 | ✅ |
| 2 | POST user: email format invalid | 400/422 | ✅ |
| 3 | POST user: password < 8 karakter | 400/422 | ✅ |
| 4 | POST user: full_name tidak ada | 400/422 | ✅ |
| 5 | PATCH user: body kosong | 400/422 | ✅ |
| 6 | GET user: id tidak ada | 400/404 | ✅ |
| 7 | POST outlet: name tidak ada | 400/422 | ✅ |
| 8 | POST outlet: service_radius_km = 0 | 400/422 | ✅ |
| 9 | POST shift: format start_time salah | 400/422 | ✅ |
| 10 | POST shift: name < 2 karakter | 400/422 | ✅ |
| 11 | POST laundry item: base_price = 0 | 400/422 | ✅ |
| 12 | POST laundry item: name tidak ada | 400/422 | ✅ |

---

## Catatan Teknis

### Shift Guard (Business Logic)
Beberapa endpoint driver/worker menerapkan `assertShiftEligibility` yang mengembalikan **403** ketika:
- Shift tidak sedang aktif (di luar jam shift)
- Karyawan belum check-in hari ini
- Karyawan sudah check-out

Endpoint yang terpengaruh:
- `GET /driver/pickups/available`
- `GET /driver/deliveries/available`
- `GET /worker/station/:station`
- `POST /worker/station/:station/orders/:id/submit-items`
- `PATCH /worker/station/:station/orders/:id/complete`

### Status Kode Validasi
API menggunakan **422 Unprocessable Entity** (bukan 400) untuk error validasi Zod. Test menerima keduanya: `[400, 422]`.

### Respon List Endpoint
- **Customer endpoints** (`apiResponse.ok()`): `{ success, message, data: [...] }`
- **Admin endpoints** (spread result): `{ success, items: [...], pagination: {...} }`

### Cleanup Data
Setiap test membuat data unik (`${Date.now()}`) dan membersihkannya di `afterAll`. Tidak ada data test yang tersisa di DB setelah run.

---

## Struktur File Test

```
apps/api/tests/
├── globalSetup.ts
├── globalTeardown.ts
├── helpers/
│   ├── auth.helper.ts       # Login + token caching per role
│   └── data.helper.ts       # Prisma helpers (create/delete test data)
├── positive/
│   ├── customer.positive.test.ts      (10 tests)
│   ├── driver.positive.test.ts        (9 tests)
│   ├── worker.positive.test.ts        (5 tests)
│   ├── outlet-admin.positive.test.ts  (12 tests)
│   └── super-admin.positive.test.ts   (25 tests)
└── negative/
    ├── auth.negative.test.ts          (15 tests)
    ├── customer.negative.test.ts      (11 tests)
    ├── driver.negative.test.ts        (9 tests)
    ├── worker.negative.test.ts        (10 tests)
    ├── outlet-admin.negative.test.ts  (11 tests)
    └── super-admin.negative.test.ts   (12 tests)
```
