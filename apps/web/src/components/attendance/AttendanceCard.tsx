"use client";

import { Clock, LogIn, LogOut } from "lucide-react";

interface AttendanceCardProps {
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
}

export function AttendanceCard({
  checkedIn,
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
  loading = false,
}: AttendanceCardProps) {
  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            checkedIn
              ? "bg-primary/10 text-primary"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            {checkedIn ? "Sedang Bertugas" : "Belum Check In"}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {checkedIn && checkInTime
              ? `Check in: ${checkInTime}`
              : "Silakan check in untuk memulai"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCheckIn}
          disabled={checkedIn || loading}
          className={`py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            checkedIn
              ? "bg-surface-container-low text-on-surface-variant cursor-not-allowed"
              : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20"
          }`}
        >
          <LogIn className="w-5 h-5" />
          Check In
        </button>
        <button
          onClick={onCheckOut}
          disabled={!checkedIn || loading}
          className={`py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            !checkedIn
              ? "bg-surface-container-low text-on-surface-variant cursor-not-allowed"
              : "bg-error text-on-error hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          <LogOut className="w-5 h-5" />
          Check Out
        </button>
      </div>

      {checkOutTime && (
        <p className="mt-4 text-center text-sm text-on-surface-variant">
          Check out: {checkOutTime}
        </p>
      )}
    </div>
  );
}
