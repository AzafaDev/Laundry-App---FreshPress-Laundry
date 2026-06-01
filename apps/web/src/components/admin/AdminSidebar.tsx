"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Receipt,
  BarChart3,
  Clock,
  Settings,
  LogOut,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Array<"super_admin" | "outlet_admin">;
}

const NAV: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    href: "/dashboard/admin/outlets",
    label: "Outlets",
    icon: Store,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/admin/shifts",
    label: "Work Shifts",
    icon: Clock,
    roles: ["super_admin"],
  },
  {
    href: "/dashboard/admin/orders",
    label: "Orders",
    icon: Receipt,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/admin/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/outlet-admin/attendance-report",
    label: "Attendance Report",
    icon: BarChart3,
    roles: ["outlet_admin"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useEmployeeAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/employee/login");
  };

  const role = user?.role as "super_admin" | "outlet_admin" | undefined;
  const items = NAV.filter((n) =>
    role && (role === "super_admin" || role === "outlet_admin")
      ? n.roles.includes(role)
      : false,
  );

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Shirt className="text-primary w-7 h-7" />
        <span className="text-xl font-bold text-primary tracking-tight">
          FreshPress Admin
        </span>
      </div>

      {/* User card */}
      <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-shrink-0">
          {user?.full_name?.slice(0, 1).toUpperCase() ?? "A"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">
            {user?.full_name ?? "Admin"}
          </span>
          <span className="text-xs text-on-surface-variant truncate capitalize">
            {role?.replace(/_/g, " ") ?? "—"}
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-outline-variant my-3" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard/admin" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary-container/15 text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
