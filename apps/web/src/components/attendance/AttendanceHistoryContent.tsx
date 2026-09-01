"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Home, ChevronRight, CheckCircle2, AlertTriangle, XCircle, CalendarDays } from "lucide-react";
import { useAttendanceLogs } from "@/hooks/attendance/useAttendance";
import { toLogRecord } from "@/utils/formatDate";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";

type StatusFilter = "all" | "on_time" | "late" | "absent";

type DatePreset = "this_week" | "this_month" | "last_month" | "custom";

const getDateRange = (preset: DatePreset): { start: string; end: string } => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (preset === "this_week") {
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return { start: fmt(monday), end: fmt(today) };
  }
  if (preset === "this_month") {
    return {
      start: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`,
      end: fmt(today),
    };
  }
  if (preset === "last_month") {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: fmt(first), end: fmt(last) };
  }
  return { start: "", end: "" };
};

interface Props {
  role: "driver" | "worker";
  dashboardHref: string;
  pageTitle: string;
}

export function AttendanceHistoryContent({ role, dashboardHref, pageTitle }: Props) {
  const [page, setPage] = useState(1);
  const [preset, setPreset] = useState<DatePreset>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { start: presetStart, end: presetEnd } = useMemo(
    () => (preset !== "custom" ? getDateRange(preset) : { start: customStart, end: customEnd }),
    [preset, customStart, customEnd]
  );

  const { data, isLoading } = useAttendanceLogs({
    page,
    limit: 10,
    startDate: presetStart || undefined,
    endDate: presetEnd || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const stats = useMemo(() => ({
    total: (data?.summary?.on_time ?? 0) + (data?.summary?.late ?? 0) + (data?.summary?.absent ?? 0),
    on_time: data?.summary?.on_time ?? 0,
    late: data?.summary?.late ?? 0,
    absent: data?.summary?.absent ?? 0,
  }), [data?.summary]);

  const records = useMemo(() => (data?.data ?? []).map(toLogRecord), [data]);

  const presets: { key: DatePreset; label: string }[] = [
    { key: "this_week", label: "Minggu ini" },
    { key: "this_month", label: "Bulan ini" },
    { key: "last_month", label: "Bulan lalu" },
    { key: "custom", label: "Kustom" },
  ];

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "on_time", label: "Tepat Waktu" },
    { key: "late", label: "Terlambat" },
    { key: "absent", label: "Absen" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
        <Link href={dashboardHref} className="hover:text-primary flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={role === "driver" ? "/dashboard/driver/attendance" : "/dashboard/worker/attendance"}
          className="hover:text-primary transition-colors"
        >
          Absensi
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary font-medium">Riwayat</span>
      </nav>

      <h1 className="text-2xl font-bold text-on-surface">{pageTitle}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-2xl font-bold text-emerald-700">{stats.on_time}</span>
          <span className="text-xs text-emerald-600 text-center">Tepat Waktu</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span className="text-2xl font-bold text-amber-600">{stats.late}</span>
          <span className="text-xs text-amber-600 text-center">Terlambat</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-4 bg-red-50 rounded-xl border border-red-100">
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
          <span className="text-xs text-red-600 text-center">Absen</span>
        </div>
      </div>

      {/* Filter section */}
      <div className="space-y-3">
        {/* Date preset — horizontal scroll on mobile */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-on-surface-variant px-0.5">Periode</p>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setPreset(key); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  preset === key
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date inputs */}
        {preset === "custom" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="hidden sm:flex items-center text-sm text-on-surface-variant">s/d</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Status filter — horizontal scroll on mobile */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-on-surface-variant px-0.5">Status</p>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {statusFilters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setStatusFilter(key); setPage(1); }}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                  statusFilter === key
                    ? key === "on_time"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : key === "late"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : key === "absent"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-primary/10 text-primary border-primary/20"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                {label}
                {key !== "all" && ` (${stats[key]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total indicator */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <CalendarDays className="w-4 h-4" />
        <span>{stats.total} record ditemukan</span>
      </div>

      <AttendanceLog
        records={records}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
        isLoading={isLoading}
      />
    </div>
  );
}
