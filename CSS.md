# CSS Reference — FreshPress Laundry

> **Sumber:** `apps/web/app/globals.css` & `apps/web/src/components/`  
> **Stack:** Tailwind CSS v4 + `@tailwindcss/postcss` + Next.js v16

---

## 1. Setup

| File | Peran |
|------|-------|
| `apps/web/app/globals.css` | Semua token desain via `@theme`, base layer, utilities |
| `apps/web/postcss.config.mjs` | Plugin `@tailwindcss/postcss` |
| `apps/web/app/layout.tsx` | Import font Geist dari `next/font/google`, import `globals.css` |

Tailwind CSS v4 menggunakan direktif `@theme` untuk mendefinisikan custom design tokens — **tidak menggunakan `tailwind.config.ts`**.

---

## 2. Warna (Design Tokens)

Semua warna mengikuti **Material Design 3** naming convention. Token didefinisikan di `@theme` block `globals.css` baris 3-63.

### 2.1 Brand Colors

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `primary` | `#00685F` | Tombol aksi utama, link aktif, icon brand |
| `on-primary` | `#FFFFFF` | Teks di atas `bg-primary` |
| `primary-container` | `#008378` | Background container/badge primary |
| `on-primary-container` | `#F4FFFC` | Teks di atas `bg-primary-container` |
| `primary-fixed` | `#89F5E7` | Accent ringan (badge, chip) |
| `on-primary-fixed` | `#00201D` | Teks di atas `bg-primary-fixed` |

```tsx
<button className="bg-primary text-on-primary px-4 py-2 rounded-lg">
  Daftar
</button>
```

### 2.2 Secondary Colors

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `secondary` | `#006398` | Aksi sekunder |
| `secondary-container` | `#5BB8FE` | Container info (contoh: petunjuk di halaman access-denied) |
| `on-secondary-container` | `#00476E` | Teks di atas secondary-container |
| `secondary-fixed` | `#CCE5FF` | Variasi container |
| `on-secondary-fixed` | `#001D31` | Teks pendamping |

### 2.3 Tertiary Colors

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `tertiary` | `#924628` | Variasi aksen ketiga |
| `tertiary-container` | `#B05E3D` | Container tertiary |
| `on-tertiary-container` | `#FFFBFF` | Teks di atas tertiary-container |
| `tertiary-fixed` | `#FFDBCE` | Variasi fixed |
| `on-tertiary-fixed` | `#370E00` | Teks pendamping |

### 2.4 Error Colors

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `error` | `#BA1A1A` | Teks/icon error |
| `on-error` | `#FFFFFF` | Teks di atas `bg-error` |
| `error-container` | `#FFDAD6` | Container error |
| `on-error-container` | `#93000A` | Teks di atas container error |

### 2.5 Surface (Latar)

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `background` | `#F8F9FF` | Background halaman |
| `on-background` | `#0B1C30` | Teks di atas background |
| `surface` | `#F8F9FF` | Latar card, header, navbar |
| `on-surface` | `#0B1C30` | Teks utama (heading, body) |
| `on-surface-variant` | `#3D4947` | Teks sekunder (label, deskripsi) |
| `surface-container` | `#E5EEFF` | Container berlapis |
| `surface-container-low` | `#EFF4FF` | Sidebar, hover ringan |
| `surface-container-high` | `#DCE9FF` | Hover aktif, chip aktif |
| `surface-container-highest` | `#D3E4FE` | Avatar, overlay |
| `surface-container-lowest` | `#FFFFFF` | Card putih |
| `surface-dim` | `#CBDCF5` | Latar redup |
| `surface-bright` | `#FFFFFF` | Variasi terang |

### 2.6 Outline & Inverse

| Token | Hex | Contoh Penggunaan |
|-------|-----|-------------------|
| `outline` | `#6D7A77` | Icon input, border fokus |
| `outline-variant` | `#BCC9C6` | Border card, divider |
| `inverse-surface` | `#213145` | Surface invers |
| `inverse-on-surface` | `#EAF1FF` | Teks di invers |
| `inverse-primary` | `#6BD8CB` | Aksen di invers |

---

## 3. Spacing

| Token | Nilai | Ekivalen Tailwind Default |
|-------|-------|---------------------------|
| `xs` | `4px` | `p-1` |
| `sm` | `8px` | `p-2` |
| `md` | `16px` | `p-4` |
| `lg` | `24px` | `p-6` |
| `xl` | `32px` | `p-8` |
| `2xl` | `48px` | `p-12` |
| `margin-mobile` | `16px` | – |
| `margin-desktop` | `32px` | – |

```tsx
<div className="p-md gap-lg">  {/* padding 16px, gap 24px */}
```

---

## 4. Border Radius

| Token | Nilai | Contoh Penggunaan |
|-------|-------|-------------------|
| `xl` | `0.75rem` (12px) | Card, modal (`rounded-xl`) |
| `3xl` | `1.5rem` (24px) | Container besar (`rounded-3xl`) |

Card dan komponen utamanya menggunakan `rounded-xl`. Gunakan `rounded-lg` untuk elemen kecil (input, chip, button).

---

## 5. Font

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| `font-geist` | `"Geist", sans-serif` | Seluruh teks via `@apply font-geist` di body |
| `--font-geist-sans` | CSS variable | Import `next/font/google` |
| `--font-geist-mono` | CSS variable | Import `next/font/google` |

Font Geist di-load di `layout.tsx` sebagai CSS variable. Body di `@layer base` sudah otomatis pakai `font-geist`.

---

## 6. Base Layer (Default Styles)

```css
@layer base {
  body {
    @apply bg-surface text-on-surface font-geist;
    min-height: 100dvh;
  }
}
```

Semua halaman otomatis mendapat:
- Background: `#F8F9FF` (`bg-surface`)
- Teks: `#0B1C30` (`text-on-surface`)
- Font: Geist sans-serif

---

## 7. Utilities Kustom

### Hide Scrollbar

```tsx
<div className="hide-scrollbar overflow-y-auto">
  {/* konten scrollable tanpa scrollbar */}
</div>
```

Definisi di `globals.css` baris 78-85. Menyembunyikan scrollbar di Webkit, IE, dan Firefox.

---

## 8. Pola Layout

### 8.1 Halaman Standar

```tsx
<div className="min-h-screen bg-background text-on-surface antialiased overflow-x-hidden">
  <header className="sticky top-0 z-50 h-16 bg-surface border-b border-outline-variant">
    {/* navbar */}
  </header>
  <main className="p-md md:p-xl">
    {/* konten */}
  </main>
</div>
```

### 8.2 Layout Dashboard (Sidebar + Konten)

```tsx
{/* Sidebar (desktop only) */}
<aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72
  bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
  {/* menu items */}
</aside>

{/* Main content */}
<main className="lg:ml-72 p-md md:p-xl">
  {/* konten */}
</main>
```

### 8.3 Bottom Navigation (Mobile Only)

```tsx
<nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around
  bg-surface py-sm px-md pb-safe border-t border-outline-variant shadow-lg rounded-t-xl">
  {/* nav items */}
</nav>
```

Link aktif: `text-primary font-bold`, tidak aktif: `text-on-surface-variant`.

---

## 9. Pola Komponen

### 9.1 Card

```tsx
<div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm
  hover:shadow-md transition-all">
  <h3 className="text-xl font-bold text-on-surface">Judul</h3>
  <p className="text-sm text-on-surface-variant">Deskripsi</p>
</div>
```

Variasi:
- Card putih: `bg-surface-container-lowest`  
- Card dengan background berwarna: `bg-secondary-container`  
- Card dashed (outlet kosong): `border-2 border-dashed border-outline-variant`

### 9.2 Tombol Primary

```tsx
<button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold
  hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2">
  <Plus className="w-5 h-5" />
  Tambah Outlet
</button>
```

### 9.3 Tombol Secondary / Outline

```tsx
<button className="border border-outline text-primary px-6 py-3 rounded-lg font-bold
  hover:bg-surface-container-high transition-all active:scale-[0.98]">
  Batal
</button>
```

### 9.4 Tombol Text / Link

```tsx
<button className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1
  rounded-lg transition-colors">
  Orders
</button>
```

### 9.5 Input Field

```tsx
<div className="space-y-1">
  <label className="text-sm font-medium text-on-surface-variant">Email</label>
  <div className="relative group">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline
      group-focus-within:text-primary">
      <Mail />
    </span>
    <input
      className="w-full pl-12 pr-12 py-3 bg-white border border-outline-variant
        rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-base"
    />
  </div>
</div>
```

### 9.6 Badge / Chip

```tsx
<span className="px-2 py-1 bg-primary-container text-on-primary-container text-xs
  rounded-full font-bold">
  Active
</span>
```

### 9.7 Avatar

```tsx
<div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden
  border border-outline-variant">
  <img src={url} />
</div>
```

### 9.8 Modal

```tsx
<div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl p-6">
  <h2 className="text-lg font-bold text-on-surface mb-4">Konfirmasi</h2>
  <p className="text-on-surface-variant mb-6">Deskripsi aksi...</p>
  <div className="flex gap-4">
    <button className="flex-1 py-2 text-sm font-bold text-on-surface-variant
      hover:bg-surface-container-high rounded-lg">Batal</button>
    <button className="flex-1 py-2 bg-error text-on-error rounded-lg font-bold
      hover:opacity-90">Hapus</button>
  </div>
</div>
```

---

## 10. Responsive Breakpoints

Tailwind default breakpoints berlaku:

| Prefix | Min Width | Penggunaan |
|--------|-----------|------------|
| `sm:` | 640px | – |
| `md:` | 768px | Tablet, nav items muncul |
| `lg:` | 1024px | Desktop: sidebar muncul, bottom nav hilang |
| `xl:` | 1280px | – |
| `2xl:` | 1536px | – |

```tsx
{/* Mobile-first: default = mobile, md: = tablet, lg: = desktop */}
<div className="p-md md:p-xl">  {/* padding 16px di mobile, 32px di tablet+ */}
<div className="hidden md:flex">  {/* sembunyi di mobile, tampil di tablet+ */}
```

---

## 11. Icon

Library: **lucide-react** v1.14+

```tsx
import { Shirt, Plus, Settings, Mail, Menu } from "lucide-react";

<Shirt className="text-primary w-6 h-6" />
```

Ukuran icon umum: `w-5 h-5` (inline dengan teks), `w-6 h-6` (standalone).

---

## 12. State & Interaksi

### Hover
| Class | Efek |
|-------|------|
| `hover:bg-surface-container-low` | Background highlight saat hover |
| `hover:bg-surface-container-high` | Background lebih kuat saat hover |
| `hover:opacity-90` | Transparansi tombol primary |
| `hover:shadow-md` | Card shadow naik |
| `hover:scale-105` | Element membesar sedikit |

### Active / Pressed
| Class | Efek |
|-------|------|
| `active:scale-[0.98]` | Efek ditekan (scale down) |
| `active:scale-95` | Variasi lebih kuat |

### Focus
| Class | Efek |
|-------|------|
| `focus:ring-2 focus:ring-primary` | Ring fokus pada input |
| `group-focus-within:text-primary` | Icon berubah warna saat input di dalamnya fokus |

### Transitions
| Class | Penggunaan |
|-------|------------|
| `transition-all` | Semua properti animasi |
| `transition-colors` | Hanya warna (lebih ringan) |
| `transition-opacity` | Hanya opacity |
| `transition-transform` | Hanya transform |

---

## 13. Hal yang Harus Dihindari

- **Jangan** gunakan warna hardcoded (`bg-[#00685f]`, `text-[#3D4947]`). Selalu gunakan token: `bg-primary`, `text-on-surface-variant`.
- **Jangan** gunakan `bg-white` atau `text-black`. Gunakan `bg-surface-container-lowest` atau `text-on-surface`.
- **Jangan** gunakan nilai spacing arbitrary (`p-[16px]`). Gunakan `p-md`.
- **Jangan** definisikan warna baru di `@theme` tanpa persetujuan tim. Palet sudah komplet untuk semua use case.
- **Jangan** gunakan tailwind.config.ts (Tailwind v4 tidak memerlukannya).
- **Jangan** gunakan `@apply` di dalam komponen. Gunakan class utilitas langsung di JSX.
- **Jangan** gunakan inline style (`style={{}}`) kecuali untuk nilai dinamis (lewat props, library map, dll).

---

## 14. Cheat Sheet Cepat

| Kebutuhan | Class |
|-----------|-------|
| Background halaman | `bg-background` |
| Background card | `bg-surface` |
| Background card putih | `bg-surface-container-lowest` |
| Teks heading | `text-on-surface` |
| Teks body/deskripsi | `text-on-surface-variant` |
| Border komponen | `border border-outline-variant` |
| Tombol utama | `bg-primary text-on-primary` |
| Tombol outline | `border border-outline text-primary` |
| Link navigasi tidak aktif | `text-on-surface-variant` |
| Link navigasi aktif | `text-primary font-bold` |
| Teks error | `text-error` |
| Latar error | `bg-error-container text-on-error-container` |
| Padding standar mobile | `p-md` (16px) |
| Padding standar desktop | `md:p-xl` (32px) |
| Card standar | `rounded-xl shadow-sm` |
| Gap antar elemen | `gap-md` (16px) |
