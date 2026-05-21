"use client";

import {
  Clock,
  LogIn,
  LogOut,
  AlertCircle,
  Timer,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import type { CurrentShift } from "@/services/attendance.service";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!currentShift?.isActive || !currentShift?.endTime) {
      setTimeRemaining(null);
      setProgressPercent(0);
      return;
    }

    const updateRemaining = () => {
      const now = new Date();
      const [startHour, startMinute] = currentShift.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = currentShift.endTime.split(":").map(Number);

      const start = new Date();
      start.setHours(startHour, startMinute, 0);
      const end = new Date();
      end.setHours(endHour, endMinute, 0);

      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const percent = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100),
      );
      setProgressPercent(percent);

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining("Shift ended");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [currentShift]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          animate={checkedIn ? { scale: [1, 1.1, 1] } : {}}
          transition={{
            duration: 0.5,
            repeat: checkedIn ? Infinity : 0,
            repeatDelay: 3,
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            checkedIn
              ? "bg-primary/10 text-primary"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {checkedIn ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Clock className="w-7 h-7" />
          )}
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-on-surface">
            {checkedIn ? "Sedang Bertugas" : "Belum Check In"}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {checkedIn && checkInTime
              ? `Check in: ${checkInTime}`
              : "Silakan check in untuk memulai shift"}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {currentShift && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50"
          >
            <div className="flex items-center justify-between text-sm flex-wrap gap-2 mb-2">
              <span className="text-on-surface-variant">Shift hari ini:</span>
              <ShiftBadge
                shift={
                  currentShift.shiftName as "Morning" | "Afternoon" | "Night"
                }
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              {currentShift.startTime} - {currentShift.endTime}
            </p>

            {currentShift.isActive && timeRemaining && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-primary" />
                    Progress shift
                  </span>
                  <span className="text-primary font-medium">
                    {timeRemaining}
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-primary h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {!currentShift.isActive && (
              <div className="flex items-center gap-1 mt-2 text-amber-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                Di luar jam shift — check-in hanya diperbolehkan saat shift
                aktif
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 p-3 bg-error/10 text-error text-sm rounded-xl flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error.message}
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCheckIn}
          disabled={checkedIn || loading}
          className={`py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            checkedIn
              ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
              : "bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20"
          } ${loading ? "animate-pulse" : ""}`}
        >
          <LogIn className="w-5 h-5" />
          {loading ? "Memproses..." : "Check In"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCheckOut}
          disabled={!checkedIn || loading}
          className={`py-4 px-5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            !checkedIn
              ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
              : "bg-error text-on-error hover:opacity-90"
          } ${loading ? "animate-pulse" : ""}`}
        >
          <LogOut className="w-5 h-5" />
          {loading ? "Memproses..." : "Check Out"}
        </motion.button>
      </div>

      {checkOutTime && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-on-surface-variant"
        >
          Check out: {checkOutTime}
        </motion.p>
      )}
    </motion.div>
  );
}
