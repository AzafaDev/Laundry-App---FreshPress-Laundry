"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
  const { on } = useSocket();
  const queryClient = useQueryClient();

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

  // Attendance real-time notifications (outlet-scoped)
  useEffect(() => {
    if (!user) return;
    const unsubCheckin = on("attendance:checkin", (data: { employeeName?: string; checkInTime?: string; outletId?: string }) => {
      if (user.role === "outlet_admin" && data.outletId && data.outletId !== user.outlet_id) return;
      toast.success(`${data.employeeName ?? "Karyawan"} check-in pukul ${data.checkInTime ?? ""}`);
      queryClient.invalidateQueries({ queryKey: ["attendance", "report"] });
    });
    const unsubCheckout = on("attendance:checkout", (data: { employeeName?: string; outletId?: string }) => {
      if (user.role === "outlet_admin" && data.outletId && data.outletId !== user.outlet_id) return;
      toast.success(`${data.employeeName ?? "Karyawan"} telah check-out`);
      queryClient.invalidateQueries({ queryKey: ["attendance", "report"] });
    });
    const unsubDriverClaimed = on("driver:task-claimed", (data: { task_type: string }) => {
      if (user.role !== "outlet_admin") return;
      const msg = data.task_type === "pickup"
        ? "Driver sedang menuju lokasi pickup"
        : "Driver sedang menuju lokasi pengantaran";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    });
    const unsubDriverCompleted = on("driver:task-completed", (data: { taskType?: string }) => {
      if (user.role !== "outlet_admin") return;
      const msg = data.taskType === "pickup"
        ? "Laundry tiba di outlet"
        : "Pesanan telah diterima customer";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    });
    return () => { unsubCheckin(); unsubCheckout(); unsubDriverClaimed(); unsubDriverCompleted(); };
  }, [user, on, queryClient]);

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
