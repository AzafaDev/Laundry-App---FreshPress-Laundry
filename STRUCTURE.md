# Panduan Struktur Folder — Laundry Web App

## 1. Arsitektur Proyek (Deployment Terpisah)

```
laundry-app/
├── apps/
│   ├── api/                     # Backend Express + Prisma (deploy ke Railway/Render)
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── package.json
│   │   └── ...
│   └── web/                     # Frontend Next.js (deploy ke Vercel)
│       ├── app/
│       ├── src/components/
│       ├── package.json
│       └── ...
├── docs/                        # Dokumentasi proyek
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
├── src/
│   ├── controllers/            # Handler request/response
│   │   ├── customer/           # Milik Orang A
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── address.controller.ts
│   │   │   ├── pickup.controller.ts
│   │   │   └── payment.controller.ts
│   │   ├── admin/              # Milik Orang B
│   │   │   ├── user.controller.ts
│   │   │   ├── outlet.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── bypass.controller.ts
│   │   │   └── report.controller.ts
│   │   └── driver-worker/      # Milik Orang C
│   │       ├── attendance.controller.ts
│   │       ├── driver.controller.ts
│   │       └── worker.controller.ts
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
│   │   │   ├── admin.routes.ts
│   │   │   └── driver-worker.routes.ts
│   │   └── index.ts
│   ├── lib/                    # Utilities / third-party configs
│   │   ├── prisma.ts           # PrismaClient instance
│   │   ├── socket.ts           # Socket.IO server
│   │   ├── email.ts            # Nodemailer config
│   │   └── payment.ts          # Midtrans / Xendit config
│   ├── types/                  # Type definitions (overrides)
│   ├── utils/                  # Helper functions (bcrypt, jwt, geocode, distance, format)
│   ├── config/                 # Environment & app config
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
│   ├── (auth)/                 # Rute tanpa sidebar / navbar khusus
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify/
│   ├── (customer)/             # Milik Orang A — semua rute customer
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── addresses/
│   │   │   ├── orders/
│   │   │   ├── pickup/
│   │   │   └── payment/
│   │   └── layout.tsx          # Layout dengan BottomNav & TopBar khusus customer
│   ├── (admin)/                # Milik Orang B
│   │   ├── dashboard/admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── outlets/
│   │   │   ├── orders/
│   │   │   ├── bypass-requests/
│   │   │   └── reports/
│   │   └── layout.tsx          # Layout dengan Sidebar admin
│   ├── (driver)/               # Milik Orang C
│   │   ├── dashboard/driver/
│   │   │   ├── page.tsx
│   │   │   ├── tasks/
│   │   │   ├── task-history/
│   │   │   └── attendance/
│   │   └── layout.tsx
│   ├── (worker)/               # Milik Orang C
│   │   ├── dashboard/worker/
│   │   │   ├── station/        # washing, ironing, packing
│   │   │   ├── history/
│   │   │   └── attendance/
│   │   └── layout.tsx
│   ├── layout.tsx              # Root layout (tanpa role specific)
│   ├── globals.css
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Card dll (shared)
│   │   ├── layout/             # Navbar, Sidebar, BottomNav, Footer
│   │   ├── customer/           # Komponen khusus feature 1 (Orang A)
│   │   ├── admin/              # Komponen khusus feature 2 (Orang B)
│   │   └── driver-worker/      # Komponen khusus feature 3 (Orang C)
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
├── tailwind.config.ts
├── postcss.config.mjs
└── README.md
```

---

## 4. ERD yang Dibagi per Fitur

### A. ERD untuk Customer (Orang A) — tabel yang relevan:

- `User` (role = customer)
- `UserAddress`
- `PickupRequest`
- `LaundryOrder`
- `OrderItem` (baca saja)
- `Payment`
- `Complaint`
- `Notification`

### B. ERD untuk Admin (Orang B) — tabel yang relevan:

- `User` (semua role)
- `Outlet`
- `Shift`
- `UserShift`
- `LaundryOrder` (full akses)
- `OrderItem`
- `Station`
- `StationProcess`
- `BypassRequest`
- `Complaint`
- `Notification`

### C. ERD untuk Driver & Worker (Orang C) — tabel yang relevan:

- `User` (role = driver, worker)
- `PickupRequest` (untuk driver)
- `LaundryOrder` (baca/tulis status)
- `StationProcess`
- `BypassRequest` (membuat request)
- `Attendance`
- `Notification`

> **Catatan:** Satu `schema.prisma` di `apps/api/prisma/` tetap berisi semua model. Pembagian ini hanya untuk memudahkan fokus pengembangan.
