"use client";

import { useState } from "react";
import { ClipboardList, CalendarDays } from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceHistoryContent } from "@/components/attendance/AttendanceHistoryContent";
import { DriverTaskHistory } from "@/components/driver/DriverTaskHistory";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

type HistoryTab = "task" | "attendance";

const TABS: { key: HistoryTab; label: string; icon: typeof ClipboardList }[] = [
  { key: "task", label: "Riwayat Task", icon: ClipboardList },
  { key: "attendance", label: "Absensi", icon: CalendarDays },
];

export default function DriverHistoryPage() {
  const { _hasHydrated } = useEmployeeAuthStore();
  const [activeTab, setActiveTab] = useState<HistoryTab>("task");

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-on-surface mb-1">Riwayat</h1>
          <p className="text-sm text-on-surface-variant">Rekap aktivitas kamu sebagai driver</p>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "task" ? (
          <DriverTaskHistory />
        ) : (
          <AttendanceHistoryContent
            role="driver"
            dashboardHref="/dashboard/driver"
            pageTitle="Riwayat Absensi Driver"
          />
        )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
