"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function OutletAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, _hasHydrated } = useEmployeeAuthStore();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "outlet_admin") {
      router.replace("/access-denied");
    }
  }, [user, accessToken, _hasHydrated, router]);

  useEffect(() => {
    if (!user || user.role !== "outlet_admin") return;

    const unsubscribeCheckin = on("attendance:checkin", (data: any) => {
      if (data.outletId !== user.outlet_id) return;
      toast.success(`✅ ${data.employeeName || "Karyawan"} check-in pukul ${data.checkInTime}`);
      queryClient.invalidateQueries({ queryKey: ["attendance", "report"] });
    });

    const unsubscribeCheckout = on("attendance:checkout", (data: any) => {
      if (data.outletId !== user.outlet_id) return;
      toast.success(`✅ ${data.employeeName || "Karyawan"} check-out`);
      queryClient.invalidateQueries({ queryKey: ["attendance", "report"] });
    });

    return () => {
      unsubscribeCheckin();
      unsubscribeCheckout();
    };
  }, [user, on, queryClient]);

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
