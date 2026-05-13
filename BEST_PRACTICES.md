# Best Practice & Aturan Kode — Laundry Web App

## 1. Backend (API)

- **Naming API:** RESTful (`GET /api/v1/orders`, `POST /api/v1/pickup-requests`).
- **Validasi:** Zod di middleware atau service.
- **Autentikasi:** JWT dengan refresh token (bisa sederhana access token saja untuk final project).
- **Role-based middleware:** `isAuthenticated`, `hasRole(['admin', 'outlet_admin'])`.
- **Error handling:** Global middleware dengan format JSON `{ success: false, message: string }`.
- **Prisma:** Gunakan satu instance `prisma` di `lib/prisma.ts` dan import di service.
- **Database transaction:** Untuk operasi multi-tabel (misal create order + update status).

---

## 2. Frontend (Next.js)

- **App Router:** Manfaatkan route groups untuk memisahkan layout per role.
- **Data fetching:** Gunakan React Query untuk semua data server-side.
- **State management:** Zustand untuk client state (auth, location, UI).
- **Styling:** Tailwind CSS, komponen reusable di `src/components/ui`.
- **Form handling:** React Hook Form + Zod (integrasi dengan `react-hook-form`).
- **Middleware Next.js:** Proteksi rute berdasarkan role, redirect jika belum login.

---

## 3. CSS Rules

- **Jangan** gunakan warna hardcoded (`bg-[#00685f]`, `text-[#3D4947]`). Selalu gunakan token: `bg-primary`, `text-on-surface-variant`.
- **Jangan** gunakan `bg-white` atau `text-black`. Gunakan `bg-surface-container-lowest` atau `text-on-surface`.
- **Jangan** gunakan nilai spacing arbitrary (`p-[16px]`). Gunakan `p-md`.
- **Jangan** definisikan warna baru di `@theme` tanpa persetujuan tim.
- **Jangan** gunakan tailwind.config.ts (Tailwind v4 tidak memerlukannya).
- **Jangan** gunakan `@apply` di dalam komponen. Gunakan class utilitas langsung di JSX.
- **Jangan** gunakan inline style (`style={{}}`) kecuali untuk nilai dinamis.

---

## 4. Clean Code

- Maksimal 200 baris per file.
- Fungsi maksimal 15 baris → refactor ke helper functions.
- Hapus semua `console.log` sebelum production (kecuali error logging).
- Gunakan ESLint + Prettier dengan konfigurasi yang sudah ada.

---

## 5. Git & Kerja Tim

- Buat branch masing-masing fitur: `feature/customer-auth`, `feature/admin-outlet`, `feature/driver-attendance`.
- Setiap hari melakukan `pull` dari `main` untuk menghindari konflik.
- Gunakan PR (pull request) minimal 1 orang review sebelum merge.
