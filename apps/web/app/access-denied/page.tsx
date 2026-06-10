"use client";

import Link from "next/link";
import { Shirt, ShieldOff, ArrowLeft, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

function getDashboardUrl(
  employeeRole: string | undefined,
  hasEmployeeToken: boolean,
  hasCustomerToken: boolean,
): { url: string; isEmployee: boolean } {
  if (hasEmployeeToken && employeeRole) {
    if (employeeRole === "driver") return { url: "/dashboard/driver", isEmployee: true };
    if (["washing_worker", "ironing_worker", "packing_worker"].includes(employeeRole))
      return { url: "/dashboard/worker", isEmployee: true };
    if (employeeRole === "outlet_admin") return { url: "/dashboard/outlet", isEmployee: true };
    if (employeeRole === "super_admin") return { url: "/dashboard/admin", isEmployee: true };
  }
  if (hasCustomerToken) return { url: "/", isEmployee: false };
  return { url: "/login", isEmployee: false };
}

export default function AccessDeniedPage() {
  const { user: customerUser } = useAuthStore();
  const { user: employeeUser } = useEmployeeAuthStore();

  const { url: dashboardUrl, isEmployee } = getDashboardUrl(
    employeeUser?.role,
    !!employeeUser,
    !!customerUser,
  );

  const loginUrl = isEmployee ? "/employee/login" : "/login";
  const isAuthenticated = !!employeeUser || !!customerUser;

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center gap-2.5 px-6 py-4 border-b border-outline-variant">
        <Shirt className="text-primary w-6 h-6" />
        <span className="text-lg font-bold text-primary tracking-tight">FreshPress</span>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-error-container flex items-center justify-center mb-6">
              <ShieldOff className="text-error w-8 h-8" />
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-on-surface mb-2">
              Akses Ditolak
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke
              dashboard yang sesuai dengan peranmu.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href={dashboardUrl}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary h-12 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dashboard
              </Link>

              {isAuthenticated && (
                <Link
                  href={loginUrl}
                  className="flex items-center justify-center gap-2 border border-outline text-on-surface-variant h-12 rounded-xl font-medium text-sm hover:bg-surface-container-high transition-colors active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  Login dengan akun lain
                </Link>
              )}

              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 border border-outline text-on-surface-variant h-12 rounded-xl font-medium text-sm hover:bg-surface-container-high transition-colors active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
