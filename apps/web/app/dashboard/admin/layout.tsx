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
  const { user, accessToken } = useEmployeeAuthStore();

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "super_admin") {
      router.replace("/access-denied");
    }
  }, [user, accessToken, router]);

  if (!user || !accessToken || user.role !== "super_admin") {
    return null;
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
