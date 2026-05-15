import { ChevronLeft, ChevronRight, CalendarX } from 'lucide-react';
import type { Pagination } from '@/types/attendance.type';

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: 'on-time' | 'late' | 'absent';
}

const statusStyles: Record<AttendanceRecord['status'], string> = {
  'on-time': 'bg-primary/10 text-primary',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-error/10 text-error',
};

const statusLabels: Record<AttendanceRecord['status'], string> = {
  'on-time': 'Tepat Waktu',
  late: 'Terlambat',
  absent: 'Absen',
};

interface AttendanceLogProps {
  records: AttendanceRecord[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function AttendanceLog({ records, pagination, onPageChange, isLoading }: AttendanceLogProps) {
  // Skeleton loading
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-outline-variant rounded"></div>
              <div className="h-3 w-24 bg-outline-variant rounded"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-3 w-16 bg-outline-variant rounded"></div>
              <div className="h-5 w-20 bg-outline-variant rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
        <CalendarX className="w-12 h-12 mx-auto text-outline mb-3" />
        <p className="text-on-surface-variant font-medium">Belum ada riwayat absensi</p>
        <p className="text-sm text-outline mt-1">Lakukan check-in untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-sm transition-shadow group"
        >
          <div>
            <p className="text-sm font-bold text-on-surface">{record.date}</p>
            <p className="text-xs text-on-surface-variant">
              {record.checkIn} — {record.checkOut}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">{record.duration}</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusStyles[record.status]}`}
            >
              {statusLabels[record.status]}
            </span>
          </div>
        </div>
      ))}

      {pagination && pagination.total_pages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-on-surface-variant">
            Halaman {pagination.page} dari {pagination.total_pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}