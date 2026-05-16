"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Shirt,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/authStore";

// ── Sidebar Link (reusable) ──
function SidebarLink({
  icon: Icon,
  label,
  active,
  href,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}

export default function WorkerDashboardPage() {
  const { user } = useAuthStore();

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
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJCjbsSWOQdviSh-_vdJ8vZ2FNTMazEDV8BNgdrjVPA5wpd4wa3_Is_cfr6WxC4z86FKQC88_QcfQeD77LwW9bIhP7mScd84kg0dR1Sx1fZfVCd6FdKNtx9XnT3AzTG2z_5VH0t283HDEhCb8hOfycWABWXEpTAriSrfefMbODGqS_fBMPuTYgdhWECMvFkEo-m7yppBILD3Esg7riiPAOc9XAVYHYygVbEsYb36hUHzDE13ndB4jaf3UcO-iMXIA5l746_oP_dtQ"
              alt="Profile"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <Shirt className="text-primary w-8 h-8" />
          <h1 className="text-lg font-bold text-primary">FreshPress</h1>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <SidebarLink
            icon={LayoutDashboard}
            label="Dashboard"
            active
            href="/dashboard/worker"
          />
          <SidebarLink
            icon={ClipboardList}
            label="Station"
            href="/dashboard/worker/station"
          />
          <SidebarLink
            icon={Package}
            label="Packing"
            href="/dashboard/worker/packing"
          />
          <SidebarLink
            icon={Clock}
            label="Attendance"
            href="/dashboard/worker/attendance"
          />
          <SidebarLink
            icon={BarChart3}
            label="History"
            href="/dashboard/worker/history"
          />
        </nav>
        <div className="border-t border-outline-variant pt-4 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? "W"}
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">
                {user?.full_name ?? "Worker"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

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
