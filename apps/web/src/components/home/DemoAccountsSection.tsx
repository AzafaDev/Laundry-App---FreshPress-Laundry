"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, KeyRound, User, ShieldCheck, Store } from "lucide-react";
import {
  ADMIN_ACCOUNTS,
  CUSTOMER_ACCOUNTS,
  DEMO_OUTLETS,
  DEMO_PASSWORD,
  DEMO_SHIFTS,
  DEMO_SHIFT_LABEL,
  DEMO_WORKER_ROLES,
  workerEmail,
  type DemoAccount,
} from "@/lib/demoAccounts";

const ENTRY_GROUPS: {
  title: string;
  icon: typeof User;
  href: string;
  hint: string;
  accounts: DemoAccount[];
}[] = [
  {
    title: "Customer",
    icon: User,
    href: "/customer/login",
    hint: "Mulai dari sini — buat order, pilih alamat, bayar, lacak status.",
    accounts: CUSTOMER_ACCOUNTS,
  },
  {
    title: "Admin",
    icon: ShieldCheck,
    href: "/employee/login",
    hint: "Kelola outlet, pegawai, shift, laporan penjualan, dan bypass request.",
    accounts: ADMIN_ACCOUNTS,
  },
];

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Salin ${label}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
};

const AccountRow = ({ email, desc }: DemoAccount) => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
    <div className="min-w-0">
      <code className="block truncate text-sm font-semibold text-gray-900">{email}</code>
      <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
    </div>
    <CopyButton value={email} label={email} />
  </div>
);

export const DemoAccountsSection = ({ id }: { id?: string }) => (
  <section id={id} className="bg-white px-4 py-20 md:px-8">
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Akun Demo
        </span>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
          Coba setiap peran tanpa perlu daftar.
        </h2>
        <p className="mt-3 max-w-2xl text-gray-500">
          Seluruh akun di bawah sudah tersedia beserta data contoh — order berjalan, riwayat
          absensi, dan laporan penjualan. Silakan login dan telusuri alurnya dari sisi mana pun.
        </p>

        {/* Shared password */}
        <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <KeyRound className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="text-sm text-gray-600">
            Password untuk semua akun:{" "}
            <code className="font-bold text-gray-900">{DEMO_PASSWORD}</code>
          </span>
          <CopyButton value={DEMO_PASSWORD} label="password" />
        </div>
      </div>

      {/* Customer + Admin */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ENTRY_GROUPS.map(({ title, icon: Icon, href, hint, accounts }) => (
          <div key={title} className="rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{hint}</p>
              </div>
            </div>

            <div className="space-y-2">
              {accounts.map((account) => (
                <AccountRow key={account.email} {...account} />
              ))}
            </div>

            <Link
              href={href}
              className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
            >
              Login sebagai {title.toLowerCase()} →
            </Link>
          </div>
        ))}
      </div>

      {/* Driver & worker, per outlet */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900">Driver &amp; Worker</h3>
        <p className="mt-1 text-sm text-gray-500">
          Setiap outlet punya satu akun per peran untuk masing-masing shift. Absensi dan pembagian
          tugas mengikuti shift yang sedang aktif.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {DEMO_OUTLETS.map((outlet) => (
            <div key={outlet.number} className="rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                  <Store className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Outlet {outlet.number} — {outlet.name}
                  </h4>
                  <p className="text-sm text-gray-500">{outlet.district}</p>
                </div>
              </div>

              <div className="space-y-5">
                {DEMO_WORKER_ROLES.map((role) => (
                  <div key={role.key}>
                    <p className="text-sm font-bold text-gray-900">{role.label}</p>
                    <p className="mb-2 text-xs text-gray-500">{role.desc}</p>
                    <div className="space-y-2">
                      {DEMO_SHIFTS.map((shift) => {
                        const email = workerEmail(role.key, shift, outlet.number);
                        return (
                          <div
                            key={shift}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex-shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-gray-500">
                                {DEMO_SHIFT_LABEL[shift]}
                              </span>
                              <code className="truncate text-sm text-gray-900">{email}</code>
                            </div>
                            <CopyButton value={email} label={email} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/employee/login"
                className="mt-5 inline-block text-sm font-bold text-primary hover:underline"
              >
                Login sebagai pegawai →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
