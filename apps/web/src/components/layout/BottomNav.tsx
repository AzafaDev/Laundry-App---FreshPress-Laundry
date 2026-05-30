"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Truck, User, Clock, History, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

type Role = "customer" | "driver" | "worker" | null;

const NavItem = ({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={`flex flex-col items-center justify-center ${
      active ? "text-primary font-bold scale-95" : "text-on-surface-variant"
    }`}
    aria-label={label}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </Link>
);

export const BottomNav = () => {
  const pathname = usePathname();
  const { accessToken: customerToken } = useAuthStore();
  const { accessToken: employeeToken, user: employeeUser } = useEmployeeAuthStore();

  let activeRole: Role = null;
  if (employeeToken && employeeUser) {
    if (employeeUser.role === "driver") activeRole = "driver";
    else if (
      ["washing_worker", "ironing_worker", "packing_worker"].includes(employeeUser.role)
    )
      activeRole = "worker";
  } else if (customerToken) {
    activeRole = "customer";
  }

  if (activeRole === "customer") {
    const isAuthenticated = !!customerToken;
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
        <NavItem icon={Home} label="Home" href="/" active={pathname === "/"} />
        <NavItem
          icon={Shirt}
          label="Orders"
          href={isAuthenticated ? "/dashboard/orders" : "/login"}
          active={pathname.startsWith("/dashboard/orders")}
        />
        <NavItem
          icon={Truck}
          label="Pickup"
          href={isAuthenticated ? "/dashboard/pickup" : "/login"}
          active={pathname.startsWith("/dashboard/pickup")}
        />
        <NavItem
          icon={User}
          label="Profile"
          href={isAuthenticated ? "/profile" : "/login"}
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