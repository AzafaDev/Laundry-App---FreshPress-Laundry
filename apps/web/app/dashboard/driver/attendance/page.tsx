"use client";

import Link from "next/link";
import {
  Home,
  CalendarDays,
  User,
  MapPin,
  Navigation,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { ShiftCard } from "@/components/attendance/ShiftCard";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useGeolocation } from "@/hooks/useGeolocation";
import { attendanceService } from "@/services/attendance.service";
import { motion } from "framer-motion";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function DriverAttendancePage() {
  const att = useAttendance();
  const { user } = useEmployeeAuthStore();
  const { latitude, longitude, permissionDenied } = useGeolocation();

  const locationStatus =
    permissionDenied
      ? "denied"
      : latitude && longitude
      ? "available"
      : "checking";

  const { data: recentLogs, isLoading: recentLoading } = useQuery({
    queryKey: ["attendance", "recent", "driver"],
    queryFn: () => attendanceService.getMyLogs({ page: 1, limit: 5 }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const { refetch: refetchLogs } = useQuery({
    queryKey: ["attendance", "logs"],
    queryFn: () => att.fetchNextLogs(1),
    enabled: !!att.fetchNextLogs,
  });

  const recentRecords = (recentLogs?.data ?? []).map(toLogRecord);

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
          </motion.div>

          <ShiftCard currentShift={att.currentShift ?? null} />

          <AttendanceCard
            checkedIn={att.checkedIn}
            checkInTime={att.checkInTime}
            checkOutTime={att.checkOutTime}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            loading={att.isCheckingIn || att.isCheckingOut}
            error={att.error}
          />

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Riwayat Terbaru
            </h2>
            <AttendanceSummary
              records={recentRecords}
              viewAllHref="/dashboard/driver/history"
              isLoading={recentLoading || att.isLoading}
            />
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
