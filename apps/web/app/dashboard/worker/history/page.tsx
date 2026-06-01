"use client";

import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceHistoryContent } from "@/components/attendance/AttendanceHistoryContent";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function WorkerHistoryPage() {
  const { _hasHydrated } = useEmployeeAuthStore();

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <AttendanceHistoryContent
          role="worker"
          dashboardHref="/dashboard/worker"
          pageTitle="Riwayat Absensi Worker"
        />
      </main>
      <BottomNav />
    </div>
  );
}
