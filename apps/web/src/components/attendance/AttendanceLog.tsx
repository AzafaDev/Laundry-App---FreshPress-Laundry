import { ChevronLeft, ChevronRight, CalendarX } from 'lucide-react';
import type { Pagination } from '@/types/attendance.type';
import type { AttendanceRecord } from '@/utils/formatDate';
import { STATUS_STYLES, STATUS_LABELS } from '@/utils/formatDate';

interface AttendanceLogProps {
  records: AttendanceRecord[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function AttendanceLog({ records, pagination, onPageChange, isLoading }: AttendanceLogProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" role="list" aria-label="Memuat riwayat absensi">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl" role="listitem">
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
    <div className="space-y-3" role="list" aria-label="Riwayat absensi">
      {records.map((record, i) => (
        <div
          key={i}
          role="listitem"
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
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_STYLES[record.status]}`}
            >
              {STATUS_LABELS[record.status]}
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
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-on-surface-variant" aria-current="page">
            Halaman {pagination.page} dari {pagination.total_pages}
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
