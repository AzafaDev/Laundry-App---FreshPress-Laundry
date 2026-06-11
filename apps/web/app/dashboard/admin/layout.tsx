"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AdminTopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="p-4 md:p-6 space-y-4">{children}</div>
      </main>
    </div>
  );
}
