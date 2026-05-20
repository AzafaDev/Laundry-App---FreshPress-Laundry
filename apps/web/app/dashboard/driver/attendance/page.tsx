"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  CalendarDays,
  User,
  Clock,
  MapPin,
  Navigation,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useAuthStore } from "@/stores/authStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DriverAttendancePage() {
  const [page, setPage] = useState(1);
  const att = useAttendance();
  const { user } = useAuthStore();
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
    await att.checkInAsync();
    att.refetch();
    refetchLogs();
  };

  const handleCheckOut = async () => {
    if (!att.attendanceId) {
      toast.error("Belum melakukan check-in");
      return;
    }
    await att.checkOutAsync(att.attendanceId);
    att.refetch();
    refetchLogs();
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />

      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link
              href="/dashboard/driver"
              className="hover:text-primary flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">Absensi Driver</span>
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
                  {user?.full_name || "Driver"}
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
            {att.currentShift && (
              <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 py-1.5 px-3 rounded-full inline-flex">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Shift: {att.currentShift.shiftName} (
                  {att.currentShift.startTime} - {att.currentShift.endTime})
                </span>
              </div>
            )}
          </motion.div>

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

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Riwayat Absensi
              {pagination?.total && (
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
