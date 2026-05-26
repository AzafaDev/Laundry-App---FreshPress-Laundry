"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAttendance } from "@/hooks/useAttendance";
import { useQuery } from "@tanstack/react-query";
import { toLogRecord } from "@/utils/formatDate";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function DriverHistoryPage() {
  const { _hasHydrated } = useEmployeeAuthStore();
  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { fetchLogs } = useAttendance();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["attendance", "logs", "history", page, startDate, endDate],
    queryFn: () =>
      fetchLogs({
        page,
        limit: 10,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const records = data?.data ?? [];
  const pagination = data?.pagination;
  const logRecords = records.map(toLogRecord);

  const handleFilter = () => {
    setPage(1);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-on-surface">
              Riwayat Absensi Driver
            </h1>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface"
              />
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90"
              >
                Filter
              </button>
            </div>
          </div>

          <AttendanceLog
            records={logRecords}
            pagination={pagination}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={isLoading}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
