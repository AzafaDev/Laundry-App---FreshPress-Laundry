"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

const ALLOWED_ROLES = ["super_admin", "outlet_admin"] as const;

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/employee/login");
      return;
    }
    if (!ALLOWED_ROLES.includes(user.role as (typeof ALLOWED_ROLES)[number])) {
      router.replace("/access-denied");
    }
  }, [user, _hasHydrated, router]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}
