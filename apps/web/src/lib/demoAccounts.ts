// Sumber tunggal akun demo hasil seeding (apps/api/prisma/seeds).
// Dipakai oleh section akun demo di landing page dan tombol autofill di halaman login.

import type { useTranslation } from "@/i18n/useTranslation";

type T = ReturnType<typeof useTranslation>["t"];

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

export const DEMO_WORKER_ROLE_KEYS = [
  "driver",
  "washing_worker",
  "ironing_worker",
  "packing_worker",
] as const;

export type DemoWorkerRoleKey = (typeof DEMO_WORKER_ROLE_KEYS)[number];

export const getWorkerRoles = (t: T) =>
  DEMO_WORKER_ROLE_KEYS.map((key) => ({
    key,
    label: t(`demoAccounts.workerRoles.${key}.label`),
    desc: t(`demoAccounts.workerRoles.${key}.desc`),
  }));

export const DEMO_SHIFTS = ["morning", "afternoon"] as const;

export type DemoShift = (typeof DEMO_SHIFTS)[number];

export const getShiftLabel = (t: T, shift: DemoShift) => t(`demoAccounts.shift.${shift}`);

export const workerEmail = (roleKey: string, shift: DemoShift, outletNumber: number) =>
  `${roleKey}.${shift}.${outletNumber}@freshpress.com`;

export const getCustomerAccounts = (t: T): DemoAccount[] => [
  {
    email: "testcustomer@freshpress.com",
    label: t("demoAccounts.customer.label"),
    desc: t("demoAccounts.customer.desc"),
    audience: "customer",
  },
];

export const getAdminAccounts = (t: T): DemoAccount[] => [
  {
    email: "superadmin@freshpress.com",
    label: t("demoAccounts.superAdmin.label"),
    desc: t("demoAccounts.superAdmin.desc"),
    audience: "employee",
  },
  {
    email: "outletadmin.1@freshpress.com",
    label: t("demoAccounts.outletAdmin.label", { outlet: DEMO_OUTLETS[0].name }),
    desc: t("demoAccounts.outletAdmin.desc"),
    audience: "employee",
  },
  {
    email: "outletadmin.2@freshpress.com",
    label: t("demoAccounts.outletAdmin.label", { outlet: DEMO_OUTLETS[1].name }),
    desc: t("demoAccounts.outletAdmin.desc"),
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

export const getEmployeeAccountGroups = (t: T): DemoAccountGroup[] => [
  {
    title: t("demoAccounts.groups.adminTitle"),
    hint: t("demoAccounts.groups.noShiftHint"),
    accounts: getAdminAccounts(t),
  },
  ...getWorkerRoles(t).map((role) => ({
    title: role.label,
    hint: role.desc,
    accounts: DEMO_OUTLETS.flatMap((outlet) =>
      DEMO_SHIFTS.map((shift) => ({
        email: workerEmail(role.key, shift, outlet.number),
        label: t("demoAccounts.groups.outletLabel", { number: outlet.number, name: outlet.name }),
        desc: t("demoAccounts.groups.shiftDesc", {
          shift: getShiftLabel(t, shift),
          range: SHIFT_WINDOWS[shift].range,
        }),
        audience: "employee" as const,
        shift,
      })),
    ),
  })),
];

export const getCustomerAccountGroups = (t: T): DemoAccountGroup[] => [
  {
    title: t("demoAccounts.groups.customerTitle"),
    hint: t("demoAccounts.groups.noShiftHint"),
    accounts: getCustomerAccounts(t),
  },
];
