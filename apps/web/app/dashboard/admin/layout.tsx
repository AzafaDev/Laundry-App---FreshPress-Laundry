"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, _hasHydrated } = useEmployeeAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "super_admin") {
      router.replace("/employee/login");
    }
  }, [user, accessToken, _hasHydrated, router]);

  if (!_hasHydrated || !user || !accessToken || user.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
