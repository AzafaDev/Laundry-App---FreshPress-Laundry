"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";
import { useAttendance } from "@/hooks/useAttendance";
import { toLogRecord } from "@/utils/formatDate";

export default function DriverAttendancePage() {
  const att = useAttendance();
  const logRecords = att.records.map(toLogRecord);
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 w-full px-4 h-16 bg-surface border-b border-outline-variant flex items-center gap-2">
        <Link
          href="/dashboard/driver"
          className="p-1 hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label="Kembali ke dashboard"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface-variant" />
        </Link>
        <h1 className="text-xl font-bold text-on-surface">Absensi</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {att.isError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30">
            <p className="text-sm font-bold text-error">Gagal memuat data</p>
            <p className="text-xs text-error mt-1">
              {att.error instanceof Error
                ? att.error.message
                : "Terjadi kesalahan"}
            </p>
            <button
              onClick={att.refetch}
              className="mt-2 text-xs text-error underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        <AttendanceCard
          checkedIn={att.checkedIn}
          checkInTime={att.checkInTime}
          checkOutTime={att.checkOutTime}
          onCheckIn={att.checkIn}
          onCheckOut={() => {
            if (att.attendanceId) {
              att.checkOut(att.attendanceId);
            }
          }}
          loading={att.isCheckingIn || att.isCheckingOut}
        />

        <section>
          <h2 className="text-lg font-bold text-on-surface mb-3">
            Riwayat Absensi
          </h2>
          <AttendanceLog records={logRecords} />
        </section>
      </main>
    </div>
  );
}
