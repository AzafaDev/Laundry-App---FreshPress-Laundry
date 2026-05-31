"use client";

import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceHistoryContent } from "@/components/attendance/AttendanceHistoryContent";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function DriverHistoryPage() {
  const { _hasHydrated } = useEmployeeAuthStore();

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <AttendanceHistoryContent
          role="driver"
          dashboardHref="/dashboard/driver"
          pageTitle="Riwayat Absensi Driver"
        />
      </main>
      <BottomNav />
    </div>
  );
}
