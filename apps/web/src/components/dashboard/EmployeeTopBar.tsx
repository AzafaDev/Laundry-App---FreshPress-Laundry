"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, User, LogOut, ChevronDown, ShieldAlert } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

export function EmployeeTopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, clearAuth } = useEmployeeAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/");
  };

  const initial = user?.full_name?.slice(0, 1).toUpperCase() ?? user?.role?.slice(0, 1).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant lg:pl-72">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="p-2 lg:hidden hover:bg-surface-container-low transition-colors rounded-full text-on-surface"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <div className="flex items-center gap-4 ml-auto">
        <NotificationBell />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-semibold text-sm text-on-primary-container">
                {initial}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start leading-tight text-left">
              <span className="text-xs font-semibold text-on-surface truncate max-w-[120px]">{user?.full_name ?? "Employee"}</span>
              <span className="text-[10px] text-on-surface-variant truncate max-w-[120px]">{user?.email ?? ""}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-outline hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <Link
                href="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <User className="w-4 h-4" /> Profil Saya
              </Link>
              {(user?.role === "super_admin" || user?.role === "outlet_admin") && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors border-t border-outline-variant"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
