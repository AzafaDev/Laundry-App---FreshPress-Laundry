"use client";

import { ChevronLeft, ChevronRight, CalendarX, Clock, LogIn, LogOut } from 'lucide-react';
import type { Pagination } from '@/types/attendance.type';

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: 'on_time' | 'late' | 'absent';
}

const statusConfig: Record<AttendanceRecord['status'], { label: string; borderClass: string; badgeClass: string }> = {
  on_time: {
    label: 'Tepat Waktu',
    borderClass: 'border-l-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  late: {
    label: 'Terlambat',
    borderClass: 'border-l-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  absent: {
    label: 'Absen',
    borderClass: 'border-l-red-400',
    badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  },
};

const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return {
    day: dayNames[date.getDay()],
    date: date.getDate(),
    month: monthNames[date.getMonth()],
    year: date.getFullYear(),
  };
};

interface AttendanceLogProps {
  records: AttendanceRecord[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function AttendanceLog({ records, pagination, onPageChange, isLoading }: AttendanceLogProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface border-l-4 border-l-outline-variant border border-outline-variant rounded-xl">
            <div className="w-12 space-y-1">
              <div className="h-3 w-full bg-outline-variant rounded" />
              <div className="h-6 w-8 bg-outline-variant rounded mx-auto" />
              <div className="h-3 w-full bg-outline-variant rounded" />
            </div>
            <div className="w-px h-10 bg-outline-variant" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-outline-variant rounded" />
              <div className="h-3 w-24 bg-outline-variant rounded" />
            </div>
            <div className="h-6 w-20 bg-outline-variant rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
        <CalendarX className="w-12 h-12 mx-auto text-outline mb-3" />
        <p className="text-on-surface-variant font-medium">Tidak ada data absensi</p>
        <p className="text-sm text-outline mt-1">Coba ubah rentang tanggal atau filter status</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {records.map((record, i) => {
        const config = statusConfig[record.status];
        const d = formatDateDisplay(record.date);
        return (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 sm:p-4 bg-surface-container-lowest border border-outline-variant border-l-4 ${config.borderClass} rounded-xl hover:shadow-sm transition-all duration-150`}
          >
            {/* Date block */}
            <div className="min-w-[40px] text-center shrink-0">
              <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">{d.day.slice(0, 3)}</p>
              <p className="text-xl font-bold text-on-surface leading-tight">{d.date}</p>
              <p className="text-[10px] text-on-surface-variant">{d.month}</p>
            </div>

            {/* Divider */}
            <div className="w-px h-9 bg-outline-variant self-center shrink-0" />

            {/* Time info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="flex items-center gap-1 text-xs text-on-surface-variant whitespace-nowrap">
                  <LogIn className="w-3 h-3 text-emerald-500 shrink-0" />
                  {record.checkIn}
                </span>
                <span className="flex items-center gap-1 text-xs text-on-surface-variant whitespace-nowrap">
                  <LogOut className="w-3 h-3 text-red-400 shrink-0" />
                  {record.checkOut}
                </span>
              </div>
              {record.duration !== '-' && (
                <p className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  {record.duration}
                </p>
              )}
            </div>

            {/* Status badge */}
            <span className={`shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${config.badgeClass}`}>
              {config.label}
            </span>
          </div>
        );
      })}

      {pagination && pagination.total_pages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-on-surface-variant">
            {pagination.page} / {pagination.total_pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
