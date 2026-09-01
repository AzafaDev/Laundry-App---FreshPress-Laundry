"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Truck, User, Clock, History, ClipboardList, Bell, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useTranslation } from "@/i18n/useTranslation";

type Role = "customer" | "guest" | "driver" | "worker" | null;

const NavItem = ({
  icon: Icon,
  label,
  href,
  active,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}) => (
  <Link
    href={href}
    className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors ${
      active ? "text-primary" : "text-on-surface-variant"
    }`}
    aria-label={label}
  >
    <div className="relative">
      <Icon className="w-5 h-5" />
      {badge && badge > 0 ? (
        <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-0.5">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </div>
    <span className={`text-[10px] truncate ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
    {active && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
    )}
  </Link>
);

export const BottomNav = () => {
  const pathname = usePathname();
  const { user: customerUser } = useAuthStore();
  const { user: employeeUser } = useEmployeeAuthStore();
  const { t } = useTranslation();

  let activeRole: Role = null;
  if (employeeUser) {
    if (employeeUser.role === "driver") activeRole = "driver";
    else if (
      ["washing_worker", "ironing_worker", "packing_worker"].includes(employeeUser.role)
    )
      activeRole = "worker";
  } else if (customerUser) {
    activeRole = "customer";
  } else {
    activeRole = "guest";
  }

  if (activeRole === "guest") {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
        <NavItem icon={Home} label={t("nav.home")} href="/" active={pathname === "/"} />
        <NavItem icon={LogIn} label={t("nav.login")} href="/customer/login" active={pathname === "/customer/login"} />
        <NavItem icon={User} label={t("nav.register")} href="/customer/register" active={pathname === "/customer/register"} />
      </nav>
    );
  }

  if (activeRole === "customer") {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
        <NavItem icon={Home} label={t("nav.home")} href="/" active={pathname === "/"} />
        <NavItem
          icon={Truck}
          label={t("nav.pickup")}
          href="/customer/pickup"
          active={pathname.startsWith("/customer/pickup")}
        />
        <NavItem
          icon={Shirt}
          label={t("nav.orders")}
          href="/customer/orders"
          active={pathname.startsWith("/customer/orders")}
        />
        <NavItem
          icon={Bell}
          label={t("nav.notifications")}
          href="/customer/notifications"
          active={pathname.startsWith("/customer/notifications")}
        />
        <NavItem
          icon={User}
          label={t("nav.profile")}
          href="/profile"
          active={pathname === "/profile"}
        />
      </nav>
    );
  }

  if (activeRole === "driver") {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
        <NavItem
          icon={Home}
          label="Beranda"
          href="/dashboard/driver"
          active={pathname === "/dashboard/driver"}
        />
        <NavItem
          icon={Clock}
          label="Absensi"
          href="/dashboard/driver/attendance"
          active={pathname.startsWith("/dashboard/driver/attendance")}
        />
        <NavItem
          icon={History}
          label="Riwayat"
          href="/dashboard/driver/history"
          active={pathname.startsWith("/dashboard/driver/history")}
        />
        <NavItem
          icon={Bell}
          label="Notifikasi"
          href="/dashboard/driver/notifications"
          active={pathname.startsWith("/dashboard/driver/notifications")}
        />
      </nav>
    );
  }

  if (activeRole === "worker") {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
        <NavItem
          icon={Home}
          label="Beranda"
          href="/dashboard/worker"
          active={pathname === "/dashboard/worker"}
        />
        <NavItem
          icon={Clock}
          label="Absensi"
          href="/dashboard/worker/attendance"
          active={pathname.startsWith("/dashboard/worker/attendance")}
        />
        <NavItem
          icon={ClipboardList}
          label="Station"
          href="/dashboard/worker/station"
          active={pathname.startsWith("/dashboard/worker/station")}
        />
        <NavItem
          icon={History}
          label="Riwayat"
          href="/dashboard/worker/history"
          active={pathname.startsWith("/dashboard/worker/history")}
        />
      </nav>
    );
  }

  return null;
};