"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function DriverTopBar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex justify-between md:justify-end items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant lg:pl-72">
        {/* Tombol Hamburger Mobile */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 lg:hidden hover:bg-surface-container-low transition-colors rounded-full text-on-surface"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Sisi Kanan: Notifikasi & Profile Dropdown */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifikasi */}
          <button
            className="p-2 hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
          </button>

          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
            >
              {/* Avatar */}
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-semibold text-sm text-on-primary-container">
                  {user?.full_name?.slice(0, 1).toUpperCase() ?? "D"}
                </div>
              )}

              {/* Name & Email */}
              <div className="hidden sm:flex flex-col items-start leading-tight text-left">
                <span className="text-xs font-semibold text-on-surface truncate max-w-[120px]">
                  {user?.full_name ?? "Driver"}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate max-w-[120px]">
                  {user?.email ?? ""}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-outline hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                {!user?.is_verified && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
                    <p className="text-xs text-amber-700 font-medium">
                      ⚠️ Akun belum terverifikasi
                    </p>
                  </div>
                )}
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profil Saya
                </Link>
                {(user?.role === "super_admin" ||
                  user?.role === "outlet_admin") && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors border-t border-outline-variant"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
