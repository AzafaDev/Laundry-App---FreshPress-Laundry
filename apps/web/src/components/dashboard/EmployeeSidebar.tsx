"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shirt } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useEmployeeAuth } from "@/hooks/useEmployeeAuth";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface EmployeeSidebarProps {
  navItems: SidebarNavItem[];
  rootHref: string;
  brandName?: string;
  onClose?: () => void;
}

export function EmployeeSidebar({ navItems, rootHref, brandName = "FreshPress", onClose }: EmployeeSidebarProps) {
  const pathname = usePathname();
  const { user } = useEmployeeAuthStore();
  const { logout } = useEmployeeAuth();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      <div className="flex items-center gap-3 px-5 py-6">
        <Shirt className="text-primary w-7 h-7" />
        <span className="text-xl font-bold text-primary tracking-tight">{brandName}</span>
      </div>

      <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-shrink-0">
          {user?.full_name?.slice(0, 1).toUpperCase() ?? "?"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">{user?.full_name ?? "Employee"}</span>
          <span className="text-xs text-on-surface-variant truncate capitalize">
            {user?.role?.replace(/_/g, " ") ?? ""}
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-outline-variant my-3" />

      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== rootHref && pathname?.startsWith(href));
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
