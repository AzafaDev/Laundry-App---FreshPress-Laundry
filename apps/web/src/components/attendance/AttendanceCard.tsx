"use client";

import {
  Clock,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/formatDate";

interface AttendanceCardProps {
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
  error?: Error | null;
  canCheckIn?: boolean;
  canCheckOut?: boolean;
  shiftEndTime?: string;
  shiftEnded?: boolean;
}

export function AttendanceCard({
  checkedIn,
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
  loading = false,
  error = null,
  canCheckIn = true,
  canCheckOut = true,
  shiftEndTime,
  shiftEnded = false,
}: AttendanceCardProps) {
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
            {checkedIn ? "Sedang Bertugas" : shiftEnded ? "Tidak Hadir" : "Belum Check In"}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {checkedIn && checkInTime
              ? `Check in: ${formatTime(checkInTime)}`
              : shiftEnded
              ? "Shift sudah berakhir, waktu check-in telah lewat"
              : "Silakan check in untuk memulai shift"}
          </p>
        </div>
      </div>

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

      <div>
        {checkOutTime ? (
          <div className="py-4 px-6 rounded-xl bg-surface-container-high text-on-surface-variant text-base font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Shift selesai
          </div>
        ) : checkedIn ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckOut}
            disabled={loading || !canCheckOut}
            className={`w-full py-4 px-5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              !canCheckOut
                ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                : "bg-error text-on-error hover:opacity-90"
            }`}
          >
            <LogOut className="w-5 h-5" />
            {loading ? "Memproses..." : "Check Out"}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckIn}
            disabled={loading || !canCheckIn}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              !canCheckIn
                ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20"
            }`}
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Memproses..." : "Check In"}
          </motion.button>
        )}
      </div>

      {checkedIn && !canCheckOut && !checkOutTime && shiftEndTime && (
        <p className="mt-3 text-center text-xs text-on-surface-variant">
          Checkout tersedia setelah shift selesai ({shiftEndTime})
        </p>
      )}

      {checkOutTime && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-on-surface-variant"
        >
          Check out: {formatTime(checkOutTime)}
        </motion.p>
      )}
    </motion.div>
  );
}