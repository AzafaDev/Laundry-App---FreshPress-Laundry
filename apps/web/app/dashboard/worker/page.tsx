"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CalendarDays,
  Package,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  User,
  Shirt,
} from "lucide-react";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";

export default function WorkerDashboardPage() {
  const { _hasHydrated, user } = useAuthStore();
  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }
  const { currentShift, checkedIn, checkInTime } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: "Pesanan Diproses",
      value: 0,
      color: "text-primary",
      icon: Package,
    },
    { label: "Selesai", value: 0, color: "text-secondary", icon: CheckCircle2 },
    { label: "Menunggu", value: 0, color: "text-tertiary", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-80 p-4 md:p-8 space-y-6">
        {/* Welcome Banner with Shift Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary-container/20 p-5 rounded-2xl border border-primary/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">
                  Selamat datang,
                </p>
                <h2 className="text-xl font-bold text-on-surface">
                  {user?.full_name ?? "Worker"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentShift && (
                <div className="flex items-center gap-2 text-sm bg-surface/80 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-on-surface-variant">
                    Shift: {currentShift.shiftName}
                  </span>
                  <span className="text-primary font-medium">
                    {currentShift.startTime} - {currentShift.endTime}
                  </span>
                </div>
              )}
              <Link
                href="/dashboard/worker/attendance"
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  checkedIn
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {checkedIn ? `Check In: ${checkInTime}` : "Belum Check In"}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
            <CalendarDays className="w-4 h-4" />
            <span>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: "/dashboard/worker/attendance",
              icon: Clock,
              title: "Absensi",
              desc: "Check-in / check-out dan lihat riwayat absensi",
              color: "primary",
            },
            {
              href: "/dashboard/worker/station",
              icon: ClipboardList,
              title: "Station Kerja",
              desc: "Proses cuci, setrika, dan kelola item pesanan",
              color: "secondary",
            },
            {
              href: "/dashboard/worker/packing",
              icon: Package,
              title: "Packing",
              desc: "Kemas pesanan yang siap diantar",
              color: "tertiary",
            },
            {
              href: "/dashboard/worker/history",
              icon: CheckCircle2,
              title: "Riwayat",
              desc: "Lihat riwayat pekerjaan yang sudah selesai",
              color: "surface",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-surface border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center text-${item.color} group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mt-4">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-variant">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Today's Summary */}
        <section className="bg-surface border border-outline-variant rounded-2xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Ringkasan Hari Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-low p-4 rounded-xl text-center"
              >
                <stat.icon className={`w-8 h-8 mx-auto ${stat.color} mb-2`} />
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
