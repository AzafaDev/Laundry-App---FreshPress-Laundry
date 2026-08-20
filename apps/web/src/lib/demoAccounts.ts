// Sumber tunggal akun demo hasil seeding (apps/api/prisma/seeds).
// Dipakai oleh section akun demo di landing page dan tombol autofill di halaman login.

export const DEMO_PASSWORD = "Password123";

export type DemoAudience = "customer" | "employee";

export type DemoAccount = {
  email: string;
  label: string;
  desc: string;
  audience: DemoAudience;
};

export const DEMO_OUTLETS = [
  { number: 1, name: "Rumah Akmal", district: "Curug, Kab. Tangerang" },
  { number: 2, name: "Purwadhika", district: "Cisauk, Kab. Tangerang" },
] as const;

export const DEMO_WORKER_ROLES = [
  { key: "driver", label: "Driver", desc: "Jemput & antar order, lihat rute pelanggan." },
  { key: "washing_worker", label: "Washing Worker", desc: "Proses cuci, input berat & item." },
  { key: "ironing_worker", label: "Ironing Worker", desc: "Tahap setrika setelah cuci selesai." },
  { key: "packing_worker", label: "Packing Worker", desc: "Packing akhir sebelum diantar." },
] as const;

export const DEMO_SHIFTS = ["morning", "afternoon"] as const;

export type DemoShift = (typeof DEMO_SHIFTS)[number];

export const DEMO_SHIFT_LABEL: Record<DemoShift, string> = {
  morning: "Pagi",
  afternoon: "Siang",
};

export const workerEmail = (roleKey: string, shift: DemoShift, outletNumber: number) =>
  `${roleKey}.${shift}.${outletNumber}@freshpress.com`;

export const CUSTOMER_ACCOUNTS: DemoAccount[] = [
  {
    email: "testcustomer@freshpress.com",
    label: "Customer",
    desc: "Punya 6 alamat tersimpan untuk menguji ongkir & radius layanan.",
    audience: "customer",
  },
];

export const ADMIN_ACCOUNTS: DemoAccount[] = [
  {
    email: "superadmin@freshpress.com",
    label: "Super Admin",
    desc: "Akses seluruh outlet, pegawai, dan laporan global.",
    audience: "employee",
  },
  {
    email: "outletadmin.1@freshpress.com",
    label: "Outlet Admin — Rumah Akmal",
    desc: "Terbatas pada satu outlet saja.",
    audience: "employee",
  },
  {
    email: "outletadmin.2@freshpress.com",
    label: "Outlet Admin — Purwadhika",
    desc: "Terbatas pada satu outlet saja.",
    audience: "employee",
  },
];

/** Satu akun per peran (shift pagi, Outlet 1) — cukup untuk pintasan di halaman login. */
export const WORKER_QUICK_ACCOUNTS: DemoAccount[] = DEMO_WORKER_ROLES.map((role) => ({
  email: workerEmail(role.key, "morning", 1),
  label: role.label,
  desc: `${role.desc} (shift pagi, Outlet 1)`,
  audience: "employee" as const,
}));

export const EMPLOYEE_QUICK_ACCOUNTS: DemoAccount[] = [
  ...ADMIN_ACCOUNTS,
  ...WORKER_QUICK_ACCOUNTS,
];
