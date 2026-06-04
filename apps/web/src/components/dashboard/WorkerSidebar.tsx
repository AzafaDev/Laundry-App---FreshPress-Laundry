"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Clock,
  BarChart3,
  LogOut,
  Shirt,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuth } from "@/hooks/useEmployeeAuth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/worker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/worker/station", label: "Station", icon: ClipboardList },
  { href: "/dashboard/worker/attendance", label: "Attendance", icon: Clock },
  { href: "/dashboard/worker/history", label: "Riwayat", icon: BarChart3 },
];

export function WorkerSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useEmployeeAuth();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Shirt className="text-primary w-7 h-7" />
        <span className="text-xl font-bold text-primary tracking-tight">FreshPress Worker</span>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-shrink-0">
          {user?.full_name?.slice(0, 1).toUpperCase() ?? "W"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">{user?.full_name ?? "Worker"}</span>
          <span className="text-xs text-on-surface-variant truncate capitalize">{user?.role ?? "worker"}</span>
        </div>
      </div>

      <div className="mx-4 h-px bg-outline-variant my-3" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // Active jika pathname sama persis atau dimulai dengan href (untuk nested)
          const active = pathname === href || (href !== "/dashboard/worker" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary-container/15 text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}