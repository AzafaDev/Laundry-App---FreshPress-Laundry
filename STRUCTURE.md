# Panduan Struktur Folder — Laundry Web App

## 1. Arsitektur Proyek (Deployment Terpisah)

```
laundry-app/
├── apps/
│   ├── api/                     # Backend Express + Prisma (deploy ke Railway/Render)
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── generated/           # Prisma client output
│   │   ├── package.json
│   │   └── ...
│   └── web/                     # Frontend Next.js (deploy ke Vercel)
│       ├── app/
│       ├── src/components/
│       ├── package.json
│       └── ...
├── .gitignore
└── README.md
```

**Tidak ada `package.json` di root.** Masing-masing app di `apps/` berdiri sendiri dan di-deploy secara independen.

---

## 2. Struktur Folder API (Backend) — Detail

```
apps/api/
├── prisma/
│   ├── schema.prisma           # Semua model database dari ERD terintegrasi
│   └── migrations/             # File migrasi (generated)
├── generated/                  # Output prisma generate (client, enums, types)
├── src/
│   ├── controllers/            # Handler request/response
│   │   ├── customer/           # Milik Orang A
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── address.controller.ts
│   │   │   ├── pickup.controller.ts
│   │   │   └── payment.controller.ts
│   │   ├── admin/              # Milik Orang B
│   │   │   ├── user.controller.ts      # (Sprint 1)
│   │   │   ├── outlet.controller.ts    # (Sprint 2)
│   │   │   ├── order.controller.ts     # (Sprint 3-4)
│   │   │   ├── bypass.controller.ts    # (Sprint 4)
│   │   │   └── report.controller.ts    # (Sprint 1 — attendance report)
│   │   └── driver-worker/      # Milik Orang C
│   │       ├── attendance.controller.ts  # (Sprint 1) ✅
│   │       ├── driver.controller.ts      # (Sprint 2 & 4) 🔜
│   │       └── worker.controller.ts      # (Sprint 3, 4, 5) 🔜
│   ├── services/               # Business logic (aksi database)
│   │   ├── customer/
│   │   ├── admin/
│   │   └── driver-worker/
│   ├── middlewares/            # Auth, role, validation, error handler
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/                 # API endpoint definitions
│   │   ├── v1/
│   │   │   ├── customer.routes.ts
│   │   │   ├── admin.routes.ts        # (Sprint 1 — attendance report)
│   │   │   └── driver-worker.routes.ts # (Sprint 1 — attendance)
│   │   └── index.ts
│   ├── lib/                    # Utilities / third-party configs
│   │   ├── prisma.ts           # PrismaClient instance
│   │   ├── socket.ts           # Socket.IO server (Sprint 2)
│   │   ├── email.ts            # Nodemailer config
│   │   └── payment.ts          # Midtrans / Xendit config
│   ├── types/                  # Type definitions (overrides)
│   ├── utils/                  # Helper functions (bcrypt, jwt, geocode, distance, format)
│   ├── config/                 # Environment & app config
│   │   ├── env.ts
│   │   └── constants.ts
│   └── server.ts               # Entry point
├── .env                        # DATABASE_URL, JWT_SECRET, dll
├── .env.example
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## 3. Struktur Folder Web (Frontend) — Detail

```
apps/web/
├── app/
│   ├── (auth)/                 # Route group tanpa sidebar/navbar khusus (layout wrapper)
│   ├── (customer)/             # Milik Orang A — route group untuk customer
│   ├── (admin)/                # Milik Orang B — route group untuk admin
│   ├── (driver)/               # Milik Orang C — route group untuk driver
│   ├── (worker)/               # Milik Orang C — route group untuk worker
│   ├── login/                  # Halaman login
│   ├── register/               # Halaman registrasi
│   ├── forgot-password/        # Lupa password
│   ├── reset-password/         # Reset password
│   ├── verify/                 # Verifikasi email + set password
│   ├── access-denied/          # Halaman akses ditolak
│   ├── add-address/            # Tambah alamat baru
│   ├── profile/                # Edit profil
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard landing (redirect by role)
│   │   ├── admin/
│   │   │   ├── outlets/
│   │   │   ├── staff/          # Kelola user + attendance + clock-in-out
│   │   │   ├── orders/         # List + create + manage
│   │   │   ├── bypass-requests/
│   │   │   ├── attandance-report/
│   │   │   └── reports/
│   │   ├── driver/
│   │   │   ├── page.tsx
│   │   │   ├── attendance/
│   │   │   ├── task-detail/
│   │   │   └── task-history/
│   │   ├── worker/
│   │   │   ├── station/        # Washing, ironing, packing
│   │   │   ├── attendance/
│   │   │   ├── packing/
│   │   │   └── history/
│   │   ├── orders/             # Customer order list + detail + complain
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   ├── history/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── complain/
│   │   ├── outlets/            # Outlet list (customer view)
│   │   ├── pickup/             # Buat pickup request
│   │   ├── payment/            # Halaman pembayaran
│   │   └── profile/
│   │       └── addresses/
│   ├── layout.tsx              # Root layout (tanpa role specific)
│   ├── globals.css
│   ├── page.tsx                # Landing page
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Card dll (shared)
│   │   ├── layout/             # Navbar, Sidebar, BottomNav, Footer, TopBar
│   │   ├── home/               # Hero, ProcessSection, ServiceList
│   │   ├── orders/             # Komponen order (checklist, stepper, table, filter)
│   │   ├── outlets/            # OutletCard, OutletMap, AddOutletModal
│   │   ├── dashboard/          # Sidebar, TopBar, StatCard, TaskCard, StatusStepper
│   │   └── attendance/         # AttendanceCard, AttendanceLog
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGeolocation.ts
│   │   ├── useFileValidation.ts
│   │   └── useSocket.ts
│   ├── lib/
│   │   ├── axios.ts            # Axios instance with baseURL
│   │   ├── react-query.ts      # QueryClient config
│   │   └── socket.ts           # Socket.IO client
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── locationStore.ts
│   │   └── notificationStore.ts
│   ├── types/                  # Tipe data untuk frontend
│   │   ├── user.types.ts
│   │   ├── order.types.ts
│   │   └── outlet.types.ts
│   ├── utils/
│   │   ├── formatPrice.ts
│   │   ├── formatDate.ts
│   │   └── validateImage.ts
│   └── features/
│       └── location/
├── public/
│   ├── images/
│   └── icons/
├── .env.local                  # NEXT_PUBLIC_API_URL, dll
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

---

## 4. ERD yang Dibagi per Fitur

### A. ERD untuk Customer (Orang A) — tabel yang relevan:

- `Customer`
- `CustomerAddress`
- `Order`
- `OrderItem` (baca saja)
- `Payment`
- `Complaint`
- `Notification`

### B. ERD untuk Admin (Orang B) — tabel yang relevan:

- `Employee` (semua role)
- `Customer`
- `Outlet`
- `WorkShift`
- `EmployeeShift`
- `Order` (full akses)
- `OrderItem`
- `ProcessLog`
- `BypassRequest`
- `Complaint`
- `Notification`

### C. ERD untuk Driver & Worker (Orang C) — tabel yang relevan:

- `Employee` (role = driver, worker)
- `Order` (baca/tulis status)
- `DriverTask`
- `ProcessLog`
- `BypassRequest` (membuat request)
- `Attendance`
- `Notification`

> **Catatan:** Satu `schema.prisma` di `apps/api/prisma/` tetap berisi semua model. Pembagian ini hanya untuk memudahkan fokus pengembangan.
