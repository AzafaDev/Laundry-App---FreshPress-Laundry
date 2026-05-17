"use client";

import { useState, useCallback } from "react";
import {
  ChevronLeft,
  Home,
  CalendarDays,
  User,
  Clock,
  Shirt,
  Bell,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useAuthStore } from "@/stores/authStore";
import { DriverSidebar } from "../dashboard/DriverSidebar";

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
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "D";

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
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="text-on-surface-variant w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      <DriverSidebar activePath="/dashboard/driver/attendance" />

      <main className="max-w-7xl mx-auto p-4 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-6">
        {/* Left Column: Welcome + AttendanceCard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary/5 to-primary-container/10 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <User className="w-5 h-5 text-on-primary-container" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">
                  Selamat datang,
                </p>
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
        </div>

        {/* Right Column: Attendance Log */}
        <div className="lg:col-span-3">
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
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
