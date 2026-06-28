"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, User, LogOut, ChevronDown, Bell } from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

export const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  const { data } = useQuery({
    queryKey: ["customer", "notifications"],
    queryFn: () => notificationService.list(1, 50),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/");
  };

  const desktopLinks = [
    { label: "Home", href: "/" },
    ...(isAuthenticated ? [
      { label: "Pickup", href: "/customer/pickup" },
      { label: "Orders", href: "/customer/orders" },
      { label: "Alamat", href: "/customer/locations" },
      { label: "Notifikasi", href: "/customer/notifications" },
    ] : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex justify-center md:justify-between items-center px-4 md:px-8 h-14 md:h-16 max-w-7xl mx-auto">

        {/* Brand — centered on mobile, left on desktop */}
        <Link href="/" className="flex items-center gap-2">
          <Shirt className="text-primary w-5 h-5 md:w-6 md:h-6" />
          <span className="text-lg md:text-xl font-bold text-primary">FreshPress</span>
        </Link>

        {/* Desktop full nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {desktopLinks.map((link) => (
            <Link key={link.label} href={link.href}
              className={`relative px-2 py-1 rounded-lg transition-colors text-sm font-medium ${
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-gray-600 hover:text-primary hover:bg-gray-100"
              }`}
            >
              {link.label === "Notifikasi" && unreadCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  {link.label}
                  <span className="min-w-[16px] h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              ) : link.label}
            </Link>
          ))}

          <div className="flex items-center gap-4 ml-4 border-l border-gray-300 pl-6">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img key={user.avatar_url} src={user.avatar_url} alt={user.full_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                      <User className="w-4 h-4 text-on-primary-container" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate">{user?.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-outline" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                    {!user?.is_verified && (
                      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
                        <p className="text-xs text-amber-700 font-medium">⚠️ Akun belum terverifikasi</p>
                      </div>
                    )}
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                      <User className="w-4 h-4" /> Profil Saya
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200">
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/customer/login" className="text-gray-700 text-sm font-medium hover:text-primary transition-colors">
                  Masuk
                </Link>
                <Link href="/customer/register" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Backdrop untuk tutup dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </header>
  );
};
