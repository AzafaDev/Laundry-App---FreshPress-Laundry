'use client';
import { Clock, LogIn, LogOut, AlertCircle, Timer } from 'lucide-react';
import { ShiftBadge } from '@/components/ui/ShiftBadge';
import type { CurrentShift } from '@/services/attendance.service';
import { useState, useEffect } from 'react';

interface AttendanceCardProps {
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  currentShift?: CurrentShift | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
  error?: Error | null;
}

export function AttendanceCard({
  checkedIn,
  checkInTime,
  checkOutTime,
  currentShift,
  onCheckIn,
  onCheckOut,
  loading = false,
  error = null,
}: AttendanceCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!currentShift?.isActive || !currentShift?.endTime) {
      setTimeRemaining(null);
      return;
    }
    const updateRemaining = () => {
      const now = new Date();
      const [endHour, endMinute] = currentShift.endTime.split(':').map(Number);
      const end = new Date();
      end.setHours(endHour, endMinute, 0);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining('Shift ended');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / 60000);
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      }
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [currentShift]);

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            checkedIn
              ? 'bg-primary/10 text-primary'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            {checkedIn ? 'Sedang Bertugas' : 'Belum Check In'}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {checkedIn && checkInTime
              ? `Check in: ${checkInTime}`
              : 'Silakan check in untuk memulai'}
          </p>
        </div>
      </div>

      {currentShift && (
        <div className="mb-4 p-3 bg-surface-container-low rounded-lg">
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <span className="text-on-surface-variant">Shift hari ini:</span>
            <ShiftBadge
              shift={
                currentShift.shiftName as 'Morning' | 'Afternoon' | 'Night'
              }
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {currentShift.startTime} - {currentShift.endTime}
          </p>
          {currentShift.isActive && timeRemaining && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Timer className="w-3.5 h-3.5" />
                <span>{timeRemaining}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          )}
          {!currentShift.isActive && (
            <div className="flex items-center gap-1 mt-2 text-amber-600 text-xs">
              <AlertCircle className="w-3 h-3" />
              Di luar jam shift
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error/10 text-error text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCheckIn}
          disabled={checkedIn || loading}
          className={`py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            checkedIn
              ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
              : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20'
          } ${loading ? 'animate-pulse' : ''}`}
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Memproses...' : 'Check In'}
        </button>
        <button
          onClick={onCheckOut}
          disabled={!checkedIn || loading}
          className={`py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            !checkedIn
              ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
              : 'bg-error text-on-error hover:opacity-90 active:scale-[0.98]'
          } ${loading ? 'animate-pulse' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {loading ? 'Memproses...' : 'Check Out'}
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