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
    { label: "Home", href: "/" },
    { label: "Orders", href: isAuthenticated ? "/dashboard/orders" : "/login" },
    { label: "Pickup", href: isAuthenticated ? "/dashboard/pickup" : "/login" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-outline-variant">
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
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-2 py-1 rounded-lg transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-4 ml-4 border-l border-outline-variant pl-6">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-surface-container-low transition-colors"
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
                  <span className="text-sm font-medium text-on-surface max-w-[120px] truncate">
                    {user?.full_name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-outline" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
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
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
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
        <div className="md:hidden bg-surface border-t border-outline-variant px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-outline-variant space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 text-error hover:bg-error-container/20 rounded-lg text-sm font-medium"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-primary hover:bg-surface-container-low rounded-lg text-sm font-medium"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium text-center"
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
