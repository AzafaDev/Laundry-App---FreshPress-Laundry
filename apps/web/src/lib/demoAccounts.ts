// Sumber tunggal akun demo hasil seeding (apps/api/prisma/seeds).
// Dipakai oleh section akun demo di landing page dan tombol autofill di halaman login.

export const DEMO_PASSWORD = "Password123";

export type DemoAudience = "customer" | "employee";

export type DemoAccount = {
  email: string;
  label: string;
  desc: string;
  audience: DemoAudience;
  /** Hanya untuk driver/worker — admin & customer tidak terikat shift. */
  shift?: DemoShift;
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

// ── Jendela shift ───────────────────────────────────────────────────────────
// Nilai ini mencerminkan `apps/api/prisma/seeds/shifts.seed.ts` (Morning 08:00–16:00,
// Afternoon 13:00–21:00) dan toleransi 15 menit di `canCheckIn` pada
// `apps/api/src/helpers/driver-worker/attendance.helpers.ts`.
// Sengaja di-hardcode: halaman login belum terautentikasi, sedangkan endpoint
// shift hanya terbuka untuk admin.

export const CHECK_IN_LEAD_MINUTES = 15;

export const SHIFT_WINDOWS: Record<DemoShift, { startMin: number; endMin: number; range: string }> = {
  morning: { startMin: 8 * 60, endMin: 16 * 60, range: "08:00–16:00" },
  afternoon: { startMin: 13 * 60, endMin: 21 * 60, range: "13:00–21:00" },
};

/** Menit sejak tengah malam di zona WIB, apa pun zona waktu perangkat pengunjung. */
export function wibMinutesNow(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/** Meniru `canCheckIn` di API: boleh sejak 15 menit sebelum shift mulai sampai shift berakhir. */
export function isShiftOpen(shift: DemoShift, wibMinutes: number): boolean {
  const { startMin, endMin } = SHIFT_WINDOWS[shift];
  return wibMinutes >= startMin - CHECK_IN_LEAD_MINUTES && wibMinutes < endMin;
}

export const anyShiftOpen = (wibMinutes: number) =>
  DEMO_SHIFTS.some((shift) => isShiftOpen(shift, wibMinutes));

export const formatWibClock = (wibMinutes: number) =>
  `${String(Math.floor(wibMinutes / 60)).padStart(2, "0")}.${String(wibMinutes % 60).padStart(2, "0")}`;

// ── Daftar lengkap akun pegawai, dikelompokkan per peran ────────────────────

export type DemoAccountGroup = { title: string; hint?: string; accounts: DemoAccount[] };

export const EMPLOYEE_ACCOUNT_GROUPS: DemoAccountGroup[] = [
  {
    title: "Admin",
    hint: "Tidak terikat shift — bisa dipakai kapan saja.",
    accounts: ADMIN_ACCOUNTS,
  },
  ...DEMO_WORKER_ROLES.map((role) => ({
    title: role.label,
    hint: role.desc,
    accounts: DEMO_OUTLETS.flatMap((outlet) =>
      DEMO_SHIFTS.map((shift) => ({
        email: workerEmail(role.key, shift, outlet.number),
        label: `Outlet ${outlet.number} — ${outlet.name}`,
        desc: `Shift ${DEMO_SHIFT_LABEL[shift]} ${SHIFT_WINDOWS[shift].range}`,
        audience: "employee" as const,
        shift,
      })),
    ),
  })),
];

export const CUSTOMER_ACCOUNT_GROUPS: DemoAccountGroup[] = [
  {
    title: "Customer",
    hint: "Tidak terikat shift — bisa dipakai kapan saja.",
    accounts: CUSTOMER_ACCOUNTS,
  },
];
