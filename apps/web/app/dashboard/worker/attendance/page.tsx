"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  CalendarDays,
  User,
  MapPin,
  Navigation,
  AlertCircle,
} from "lucide-react";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { ShiftCard } from "@/components/attendance/ShiftCard";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useAuthStore } from "@/stores/authStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function WorkerAttendancePage() {
  const [page, setPage] = useState(1);
  const att = useAttendance();
  const { user } = useEmployeeAuthStore();
  const { latitude, longitude, permissionDenied } = useGeolocation();
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "checking" | "available" | "denied"
  >("idle");

  useEffect(() => {
    if (permissionDenied) setLocationStatus("denied");
    else if (latitude && longitude) setLocationStatus("available");
    else if (!permissionDenied && !latitude) setLocationStatus("checking");
  }, [latitude, longitude, permissionDenied]);

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

  const handleCheckIn = async () => {
    if (locationStatus !== "available") {
      toast.error("Aktifkan akses lokasi untuk check-in", { icon: "📍" });
      return;
    }
    try {
      await att.checkInAsync();
      att.refetch();
      refetchLogs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal check-in");
    }
  };

  const handleCheckOut = async () => {
    if (!att.attendanceId) {
      toast.error("Belum melakukan check-in");
      return;
    }
    try {
      await att.checkOutAsync(att.attendanceId);
      att.refetch();
      refetchLogs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal check-out");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link
              href="/dashboard/worker"
              className="hover:text-primary flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">Absensi Worker</span>
          </div>

          {/* Welcome Banner with Location Status */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              locationStatus === "available"
                ? "bg-primary/5 border-primary/20"
                : locationStatus === "denied"
                  ? "bg-error/5 border-error/20"
                  : "bg-surface-container-low border-outline-variant"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <User className="w-5 h-5 text-on-primary-container" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface-variant">
                  Selamat datang,
                </p>
                <p className="text-lg font-bold text-on-surface">
                  {user?.full_name || "Worker"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {locationStatus === "available" && (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary">Lokasi aktif</span>
                  </>
                )}
                {locationStatus === "denied" && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-error" />
                    <span className="text-error">Lokasi ditolak</span>
                  </>
                )}
                {locationStatus === "checking" && (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-outline animate-pulse" />
                    <span className="text-outline">Mendeteksi...</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <ShiftCard currentShift={att.currentShift ?? null} />

          {/* Attendance Card */}
          <AttendanceCard
            checkedIn={att.checkedIn}
            checkInTime={att.checkInTime}
            checkOutTime={att.checkOutTime}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            loading={att.isCheckingIn || att.isCheckingOut}
            error={att.error}
          />

          {/* Riwayat Absensi */}
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Riwayat Absensi
              {pagination?.total !== undefined && pagination.total > 0 && (
                <span className="text-xs text-on-surface-variant ml-2">
                  ({pagination.total} catatan)
                </span>
              )}
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
      <BottomNav />
    </div>
  );
}
