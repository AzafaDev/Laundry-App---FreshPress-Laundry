"use client";

import Link from "next/link";
import {
  Clock,
  Droplets,
  KeyRound,
  Package,
  Shirt,
  ShieldCheck,
  Store,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  DEMO_OUTLETS,
  DEMO_PASSWORD,
  getWorkerRoles,
  SHIFT_WINDOWS,
} from "@/lib/demoAccounts";
import { useTranslation } from "@/i18n/useTranslation";

const WORKER_ICONS: Record<string, LucideIcon> = {
  driver: Truck,
  washing_worker: Droplets,
  ironing_worker: Shirt,
  packing_worker: Package,
};

export const DemoAccountsSection = ({ id }: { id?: string }) => {
  const { t } = useTranslation();

  const roles: { title: string; desc: string; icon: LucideIcon; href: string; meta: string }[] = [
    {
      title: t("demoAccounts.section.roles.customer.title"),
      desc: t("demoAccounts.section.roles.customer.desc"),
      icon: User,
      href: "/customer/login",
      meta: t("demoAccounts.section.oneAccountNoShift"),
    },
    {
      title: t("demoAccounts.section.roles.superAdmin.title"),
      desc: t("demoAccounts.section.roles.superAdmin.desc"),
      icon: ShieldCheck,
      href: "/employee/login",
      meta: t("demoAccounts.section.oneAccountNoShift"),
    },
    {
      title: t("demoAccounts.section.roles.outletAdmin.title"),
      desc: t("demoAccounts.section.roles.outletAdmin.desc"),
      icon: Store,
      href: "/employee/login",
      meta: t("demoAccounts.section.outletAdminMeta", { count: DEMO_OUTLETS.length }),
    },
    ...getWorkerRoles(t).map((role) => ({
      title: role.label,
      desc: role.desc,
      icon: WORKER_ICONS[role.key] ?? Package,
      href: "/employee/login",
      meta: t("demoAccounts.section.workerMeta", { count: DEMO_OUTLETS.length * 2 }),
    })),
  ];

  return (
    <section id={id} className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("demoAccounts.section.eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
            {t("demoAccounts.section.title")}
          </h2>
          <p className="mt-3 text-gray-500">{t("demoAccounts.section.description")}</p>

          <div className="mt-5 inline-flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
            <KeyRound className="h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm text-gray-600">
              {t("demoAccounts.section.passwordLabel")}{" "}
              <code className="font-bold text-gray-900">{DEMO_PASSWORD}</code>
            </span>
          </div>
        </div>

        {/* Kartu peran */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className="group rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <role.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900">{role.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{role.desc}</p>
              <p className="mt-3 text-xs font-semibold text-gray-400">{role.meta}</p>
              <span className="mt-4 inline-block text-sm font-bold text-primary group-hover:underline">
                {t("demoAccounts.section.loginAs", { role: role.title.toLowerCase() })}
              </span>
            </Link>
          ))}
        </div>

        {/* Catatan shift — mencegah penolakan check-in dikira bug */}
        <div className="mt-8 flex gap-3 rounded-2xl bg-surface-container-low px-5 py-4">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-gray-600">
            {t("demoAccounts.section.shiftNote", {
              morning: SHIFT_WINDOWS.morning.range,
              afternoon: SHIFT_WINDOWS.afternoon.range,
            })}
          </p>
        </div>
      </div>
    </section>
  );
};
