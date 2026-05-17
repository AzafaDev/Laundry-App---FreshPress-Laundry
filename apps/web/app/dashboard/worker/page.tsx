"use client";

import Link from "next/link";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import {
  Bell,
  Shirt,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  Package,
  BarChart3,
  CalendarDays,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/authStore";

export default function WorkerDashboardPage() {
  const { user } = useAuthStore();
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "D";

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <Bell className="text-on-surface-variant w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <WorkerSidebar activePath="/dashboard/worker" />

      {/* ── Main Content ── */}
      <main className="lg:pl-72 p-4 md:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-container/20 p-6 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <User className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Selamat datang,</p>
              <h1 className="text-2xl font-bold text-on-surface">
                {user?.full_name ?? "Worker"}
              </h1>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <CalendarDays className="w-4 h-4" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Attendance */}
          <Link
            href="/dashboard/worker/attendance"
            className="bg-surface border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-4">Absensi</h3>
            <p className="text-sm text-on-surface-variant">
              Check-in / check-out dan lihat riwayat absensi
            </p>
          </Link>

          {/* Card: Station */}
          <Link
            href="/dashboard/worker/station"
            className="bg-surface border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-outline group-hover:text-secondary transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-4">
              Station Kerja
            </h3>
            <p className="text-sm text-on-surface-variant">
              Proses cuci, setrika, dan kelola item pesanan
            </p>
          </Link>

          {/* Card: Packing */}
          <Link
            href="/dashboard/worker/packing"
            className="bg-surface border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-outline group-hover:text-tertiary transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-4">Packing</h3>
            <p className="text-sm text-on-surface-variant">
              Kemas pesanan yang siap diantar
            </p>
          </Link>

          {/* Card: History */}
          <Link
            href="/dashboard/worker/history"
            className="bg-surface border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-outline group-hover:text-on-surface transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-4">Riwayat</h3>
            <p className="text-sm text-on-surface-variant">
              Lihat riwayat pekerjaan yang sudah selesai
            </p>
          </Link>
        </div>

        {/* Today's Summary */}
        <section className="bg-surface border border-outline-variant rounded-2xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Ringkasan Hari Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Pesanan Diproses
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-secondary">0</p>
              <p className="text-sm text-on-surface-variant mt-1">Selesai</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-tertiary">0</p>
              <p className="text-sm text-on-surface-variant mt-1">Menunggu</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
