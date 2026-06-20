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
  LogOut,
  Shirt,
  ShoppingBag,
  PlayCircle,
  ShieldAlert,
  CalendarCheck,
  CalendarDays,
  MessageSquareWarning,
  X,
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
    roles: ["super_admin"],
  },
  {
    href: "/dashboard/admin/laundry-items",
    label: "Laundry Items",
    icon: ShoppingBag,
    roles: ["super_admin"],
  },
  {
    href: "/dashboard/admin/clothing-types",
    label: "Clothing Types",
    icon: Shirt,
    roles: ["super_admin"],
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
    href: "/dashboard/admin/orders/create",
    label: "Process Order",
    icon: PlayCircle,
    roles: ["outlet_admin"],
  },
  {
    href: "/dashboard/admin/bypass-requests",
    label: "Bypass Requests",
    icon: ShieldAlert,
    roles: ["outlet_admin"],
  },
  {
    href: "/dashboard/admin/complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/admin/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["super_admin", "outlet_admin"],
  },
  {
    href: "/dashboard/admin/staff/shifts",
    label: "Work Shift Schedule",
    icon: CalendarDays,
    roles: ["outlet_admin"],
  },
  {
    href: "/dashboard/admin/attendance-report",
    label: "Attendance Report",
    icon: CalendarCheck,
    roles: ["outlet_admin"],
  },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useEmployeeAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/employee/login");
  };

  const role = user?.role as "super_admin" | "outlet_admin" | undefined;
  const items = NAV.filter((n) => (role ? n.roles.includes(role) : false));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Shirt className="text-primary w-6 h-6" />
          <span className="text-lg font-bold text-primary tracking-tight">
            FreshPress Admin
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User card */}
      <div className="mx-4 p-3 bg-surface-container-high rounded-xl flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-shrink-0 text-sm">
          {user?.full_name?.slice(0, 1).toUpperCase() ?? "A"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">
            {user?.full_name ?? "Admin"}
          </span>
          <span className="text-xs text-on-surface-variant truncate capitalize">
            {role?.replace(/_/g, " ") ?? "—"}
          </span>
          {role === "outlet_admin" && (
            <span className={`text-xs truncate font-medium mt-0.5 ${user?.outlet_name ? "text-primary/80" : "text-on-surface-variant italic"}`}>
              {user?.outlet_name ? `📍 ${user.outlet_name}` : "Outlet belum ditetapkan"}
            </span>
          )}
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
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: always-visible fixed sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        {sidebarContent}
      </aside>

      {/* ── Mobile: backdrop + slide-in drawer ────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
