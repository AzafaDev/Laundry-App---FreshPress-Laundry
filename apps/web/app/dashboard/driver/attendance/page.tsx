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
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { ShiftCard } from "@/components/attendance/ShiftCard";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { SkeletonAttendaceCard, SkeletonShiftCard, SkeletonText } from "@/components/ui/Skeleton";

export default function DriverAttendancePage() {
  const { _hasHydrated, user } = useEmployeeAuthStore();
  const att = useAttendance();
  const { latitude, longitude, permissionDenied } = useGeolocation();

  if (!_hasHydrated || att.isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <DriverSidebar />
        <DriverTopBar />
        <main className="lg:pl-72 p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <SkeletonText className="h-6 w-40 mb-4" />
            <SkeletonAttendaceCard />
            <SkeletonShiftCard />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const locationStatus =
    permissionDenied
      ? "denied"
      : latitude && longitude
      ? "available"
      : "checking";

  const recentRecords = att.records.slice(0, 5).map(toLogRecord);

  const handleCheckIn = async () => {
    if (locationStatus !== "available") {
      toast.error("Aktifkan akses lokasi untuk check-in", { icon: "📍" });
      return;
    }
    try {
      await att.checkInAsync();
      att.refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal check-in");
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal check-out");
    }
  };

  return (
    <div key={user?.id} className="min-h-screen bg-background pb-24 lg:pb-0">
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
            {locationStatus === "denied" && (
              <div className="mt-3 bg-error/10 border border-error/20 rounded-lg px-3 py-2 text-xs text-error">
                Izinkan akses lokasi di browser untuk check-in: klik ikon kunci/info di address bar → izinkan Lokasi → refresh halaman.
              </div>
            )}
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
            canCheckIn={att.currentShift?.canCheckIn ?? false}
            canCheckOut={att.checkedIn && !att.checkOutTime && (att.currentShift?.canCheckOut ?? false)}
            shiftEndTime={att.currentShift?.endTime}
          />

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Riwayat Terbaru
            </h2>
            <AttendanceSummary
              records={recentRecords}
              viewAllHref="/dashboard/driver/history"
              isLoading={att.isLoading}
            />
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
