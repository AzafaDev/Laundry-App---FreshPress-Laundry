"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { formatTime } from "@/utils/formatDate";
import type { AttendanceRecord } from "@/utils/formatDate";

interface AttendanceSummaryProps {
  records: AttendanceRecord[];
  viewAllHref: string;
  isLoading?: boolean;
}

export function AttendanceSummary({
  records,
  viewAllHref,
  isLoading,
}: AttendanceSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between p-3 bg-surface border border-outline-variant rounded-xl">
            <div className="h-4 w-24 bg-outline-variant rounded" />
            <div className="h-4 w-16 bg-outline-variant rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-6 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
        <CalendarDays className="w-8 h-8 mx-auto text-outline mb-2" />
        <p className="text-sm text-on-surface-variant">Belum ada riwayat absensi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.slice(0, 5).map((att) => (
        <div
          key={att.date}
          className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-sm transition-shadow"
        >
          <div>
            <p className="text-sm font-medium text-on-surface">
              {att.date}
            </p>
            <p className="text-xs text-on-surface-variant">
              {att.checkIn} - {att.checkOut}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              att.status === "on-time"
                ? "bg-primary/10 text-primary"
                : att.status === "late"
                ? "bg-amber-100 text-amber-700"
                : "bg-error/10 text-error"
            }`}
          >
            {att.status === "on-time"
              ? "Tepat Waktu"
              : att.status === "late"
              ? "Terlambat"
              : "Absen"}
          </span>
        </div>
      ))}

      {records.length > 0 && (
        <Link
          href={viewAllHref}
          className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Lihat Riwayat Lengkap
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}