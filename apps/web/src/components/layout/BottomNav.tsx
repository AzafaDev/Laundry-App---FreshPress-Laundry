"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Shirt,
  Truck,
  User,
  Clock,
  ClipboardList,
  LayoutDashboard,
  BadgeCheck,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

type NavItemConfig = {
  icon: React.ElementType;
  label: string;
  href: string;
};

const roleNavMap: Record<string, NavItemConfig[]> = {
  driver: [
    { icon: Home, label: "Home", href: "/dashboard/driver" },
    { icon: Truck, label: "Tasks", href: "/dashboard/driver" },
    { icon: Clock, label: "Attendance", href: "/dashboard/driver/attendance" },
    { icon: User, label: "Profile", href: "/profile" },
  ],
  worker: [
    { icon: Home, label: "Home", href: "/dashboard/worker" },
    {
      icon: ClipboardList,
      label: "Station",
      href: "/dashboard/worker/station",
    },
    { icon: Clock, label: "Attendance", href: "/dashboard/worker/attendance" },
    { icon: User, label: "Profile", href: "/profile" },
  ],
  outlet_admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Shirt, label: "Orders", href: "/dashboard/admin/orders" },
    { icon: BadgeCheck, label: "Staff", href: "/dashboard/admin/staff" },
    { icon: User, label: "Profile", href: "/profile" },
  ],
  super_admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Shirt, label: "Orders", href: "/dashboard/admin/orders" },
    { icon: BadgeCheck, label: "Staff", href: "/dashboard/admin/staff" },
    { icon: User, label: "Profile", href: "/profile" },
  ],
};

export const BottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role ?? "customer";
  const navItems = roleNavMap[role] ?? roleNavMap.customer ?? [];

  if (!navItems.length) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe"
      aria-label="Navigasi utama"
    >
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              isActive
                ? "text-primary scale-95"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
