"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, Home, CalendarDays, User, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useAuthStore } from "@/stores/authStore";

interface AttendancePageShellProps {
  role: "driver" | "worker";
  backHref: string;
  title: string;
}

export function AttendancePageShell({
  role,
  backHref,
  title,
}: AttendancePageShellProps) {
  const [page, setPage] = useState(1);
  const att = useAttendance();
  const { user } = useAuthStore();

  const {
    data: paginatedLogs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["attendance", "logs", page],
    queryFn: () => att.fetchNextLogs(page),
    enabled: !!att.fetchNextLogs,
  });

  const logRecords = (paginatedLogs?.data ?? att.records).map(toLogRecord);
  const pagination = paginatedLogs?.pagination ?? att.pagination;

  const handleCheckIn = useCallback(async () => {
    try {
      await att.checkInAsync();
      toast.success("Check-in berhasil! Selamat bekerja.");
      att.refetch();
      refetchLogs();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Gagal check-in",
      );
    }
  }, [att, refetchLogs]);

  const handleCheckOut = useCallback(async () => {
    if (!att.attendanceId) {
      toast.error("Belum melakukan check-in");
      return;
    }
    try {
      await att.checkOutAsync(att.attendanceId);
      toast.success("Check-out berhasil. Istirahat yang cukup!");
      att.refetch();
      refetchLogs();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Gagal check-out",
      );
    }
  }, [att, refetchLogs]);

  const roleLabel = role === "driver" ? "Driver" : "Worker";

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-4 h-16 bg-surface border-b border-outline-variant flex items-center gap-2 shadow-sm">
        <Link
          href={backHref}
          className="p-1 hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label={`Kembali ke dashboard ${roleLabel}`}
        >
          <ChevronLeft className="w-6 h-6 text-on-surface-variant" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/dashboard" className="hover:text-primary">
              <Home className="w-4 h-4 inline mr-1" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{title}</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <CalendarDays className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-primary-container/10 p-4 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <User className="w-5 h-5 text-on-primary-container" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Selamat datang,</p>
              <p className="text-lg font-bold text-on-surface">
                {user?.full_name || roleLabel}
              </p>
            </div>
          </div>
          {att.currentShift && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Shift: {att.currentShift.shiftName} (
                {att.currentShift.startTime} - {att.currentShift.endTime})
              </span>
            </div>
          )}
        </div>

        {/* Attendance Card */}
        <AttendanceCard
          checkedIn={att.checkedIn}
          checkInTime={att.checkInTime}
          checkOutTime={att.checkOutTime}
          currentShift={att.currentShift}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={att.isCheckingIn || att.isCheckingOut}
          error={att.error}
        />

        {/* Attendance Log */}
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Riwayat Absensi
          </h2>
          <AttendanceLog
            records={logRecords}
            pagination={pagination}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={logsLoading || att.isLoading}
          />
        </section>
      </main>
    </div>
  );
}
