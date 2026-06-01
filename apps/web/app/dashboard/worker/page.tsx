"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CalendarDays,
  User,
  Shirt,
  Package,
  Wheat,
  ArrowRight,
  UserX,
} from "lucide-react";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CheckInPrompt } from "@/components/dashboard/CheckInPrompt";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";

const stationMeta = {
  washing: {
    label: "Stasiun Cuci",
    icon: Shirt,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    cta: "Ke Stasiun Cuci",
  },
  ironing: {
    label: "Stasiun Setrika",
    icon: Wheat,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    cta: "Ke Stasiun Setrika",
  },
  packing: {
    label: "Stasiun Packing",
    icon: Package,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
    border: "border-tertiary/20",
    cta: "Ke Stasiun Packing",
  },
} as const;

function StationStatusCard({
  count,
  stationType,
  isLoading,
}: {
  count: number;
  stationType: "washing" | "ironing" | "packing" | null;
  isLoading: boolean;
}) {
  if (!stationType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center bg-surface border border-outline-variant rounded-2xl p-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-outline-variant/20 flex items-center justify-center mb-4">
          <UserX className="w-7 h-7 text-outline" />
        </div>
        <p className="text-base font-semibold text-on-surface">Belum di-assign ke stasiun</p>
        <p className="text-sm text-on-surface-variant mt-1">Hubungi supervisor untuk mendapatkan assignment</p>
      </motion.div>
    );
  }

  const meta = stationMeta[stationType];
  const Icon = meta.icon;

  if (isLoading) {
    return (
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-outline-variant/50 rounded mb-4" />
        <div className="h-16 w-24 bg-outline-variant/50 rounded mb-4" />
        <div className="h-12 bg-outline-variant/50 rounded-xl" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center bg-surface border border-outline-variant rounded-2xl p-10 text-center"
      >
        <div className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${meta.color}`} />
        </div>
        <p className="text-base font-semibold text-on-surface">Tidak ada pekerjaan saat ini</p>
        <p className="text-sm text-on-surface-variant mt-1">{meta.label} sedang kosong</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border-2 ${meta.border} rounded-2xl p-6 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <span className="text-sm font-semibold text-on-surface-variant">{meta.label}</span>
      </div>

      {/* Bold count */}
      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-black leading-none ${meta.color}`}>{count}</span>
          <span className="text-base text-on-surface-variant mb-1.5 font-medium">
            {count === 1 ? "item" : "item"} menunggu
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          Segera proses agar tidak menumpuk
        </p>
      </div>

      <Link
        href="/dashboard/worker/station"
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-on-primary transition-all active:scale-[0.98] ${
          stationType === "washing"
            ? "bg-primary hover:opacity-90"
            : stationType === "ironing"
            ? "bg-secondary hover:opacity-90"
            : "bg-tertiary hover:opacity-90"
        }`}
      >
        {meta.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

export default function WorkerDashboardPage() {
  const { _hasHydrated, user } = useEmployeeAuthStore();
  const { currentShift, checkedIn, checkInTime } = useAttendance();
  const { stationOrders, stationType, isLoading: isLoadingStation } = useWorkerStation();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = on("station:order-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "station"] });
    });
    return () => unsub();
  }, [on, queryClient]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-80 p-4 md:p-8 space-y-5">

        {/* Welcome Banner — secondary/blue identity */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 shadow-md shadow-primary/15"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-on-primary/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-on-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-on-primary" />
              </div>
              <div>
                <p className="text-xs text-on-primary/70">Selamat datang,</p>
                <h2 className="text-lg font-bold text-on-primary leading-tight">
                  {user?.full_name ?? "Worker"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentShift && (
                <div className="flex items-center gap-1.5 text-xs bg-on-primary/15 text-on-primary px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentShift.shiftName}</span>
                  <span className="font-semibold">{currentShift.startTime}–{currentShift.endTime}</span>
                </div>
              )}
              <Link
                href="/dashboard/worker/attendance"
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  checkedIn
                    ? "bg-on-primary text-primary"
                    : "bg-on-primary/20 text-on-primary hover:bg-on-primary/30"
                }`}
              >
                {checkedIn ? `✓ ${checkInTime}` : "Belum Check In"}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-primary/60 relative">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </motion.div>

        {/* Check-in prompt */}
        {!checkedIn && (
          <CheckInPrompt href="/dashboard/worker/attendance" />
        )}

        {/* Station status */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Station Kamu
          </h2>
          <StationStatusCard
            count={stationOrders.length}
            stationType={stationType}
            isLoading={isLoadingStation}
          />
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
