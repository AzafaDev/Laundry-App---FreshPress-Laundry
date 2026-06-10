// /dashboard/outlet layout — outlet_admin area.
// Access is restricted to outlet_admin only. Super admins use /dashboard/admin;
// everyone else is redirected to /access-denied.
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { OutletDashboardSidebar } from "@/components/admin/OutletDashboardSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default function OutletDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user } = useEmployeeAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "outlet_admin") {
      router.replace(
        user.role === "super_admin" ? "/dashboard/admin" : "/access-denied",
      );
    }
  }, [user, router]);

  if (!user || user.role !== "outlet_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <OutletDashboardSidebar />
      <AdminTopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
