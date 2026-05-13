"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceLog } from "@/components/attendance/AttendanceLog";

const mockRecords = [
  {
    date: "Sen, 12 Mei 2026",
    checkIn: "08:00",
    checkOut: "16:00",
    duration: "8h 0m",
    status: "on-time" as const,
  },
  {
    date: "Min, 11 Mei 2026",
    checkIn: "08:15",
    checkOut: "16:00",
    duration: "7h 45m",
    status: "late" as const,
  },
  {
    date: "Sab, 10 Mei 2026",
    checkIn: "07:55",
    checkOut: "15:30",
    duration: "7h 35m",
    status: "on-time" as const,
  },
];

export default function DriverAttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>();
  const [checkOutTime, setCheckOutTime] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleCheckIn = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCheckInTime(now);
      setCheckedIn(true);
      setCheckOutTime(undefined);
      setLoading(false);
    }, 800);
  };

  const handleCheckOut = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCheckOutTime(now);
      setCheckedIn(false);
      setLoading(false);
    }, 800);
  };

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
        <AttendanceCard
          checkedIn={checkedIn}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={loading}
        />

        <section>
          <h2 className="text-lg font-bold text-on-surface mb-3">
            Riwayat Absensi
          </h2>
          <AttendanceLog records={mockRecords} />
        </section>
      </main>
    </div>
  );
}
