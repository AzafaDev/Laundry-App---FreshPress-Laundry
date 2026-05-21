"use client";

import { useState } from "react";
import Link from "next/link";
import { Shirt, Menu, X, User, LogOut, ChevronDown, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, accessToken, clearAuth } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = !!accessToken && !!user;

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Cara Kerja", href: "/#how-it-works" },
    { label: "Harga & Layanan", href: "/#services" },
    { label: "Orders", href: isAuthenticated ? "/dashboard/orders" : "/login" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 max-w-7xl mx-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <span className="text-xl font-bold text-primary">FreshPress</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-600 hover:text-primary hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors text-sm font-medium"
            >
              {link.label}
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
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                      <User className="w-4 h-4 text-on-primary-container" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                    {user?.full_name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-outline" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
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
                    {(user?.role === "super_admin" || user?.role === "outlet_admin") && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 text-sm font-medium hover:text-primary transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-on-surface"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-primary hover:bg-primary/5 rounded-lg text-sm font-medium"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 bg-primary text-white rounded-lg text-sm font-medium text-center"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};
