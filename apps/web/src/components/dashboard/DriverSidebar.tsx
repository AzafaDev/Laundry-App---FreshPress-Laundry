"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  ReceiptText,
  Package,
  BarChart3,
  Clock,
  Shirt,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface DriverSidebarProps {
  activePath?: string;
}

const navItems = [
  { icon: Truck, label: "Active Tasks", href: "/dashboard/driver" },
  { icon: Clock, label: "Attendance", href: "/dashboard/driver/attendance" },
  { icon: ReceiptText, label: "Orders", href: "#" },
  { icon: Package, label: "Inventory", href: "#" },
  { icon: BarChart3, label: "Reports", href: "#" },
];

export const DriverSidebar = ({ activePath = "" }: DriverSidebarProps) => {
  const { user } = useAuthStore();
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "D";

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Shirt className="text-primary w-[28px] h-[28px]" />
        <span className="text-xl font-bold text-primary tracking-tight">
          FreshPress
        </span>
      </div>

      {/* Profile Card */}
      <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">
            {user?.full_name ?? "Driver"}
          </span>
          <span className="text-xs text-on-surface-variant truncate">
            {user?.email ?? ""}
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-outline-variant my-3" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = activePath === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary-container/15 text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
