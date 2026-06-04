"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, CalendarDays, User } from "lucide-react";

interface ShiftInfo {
  shiftName: string;
  startTime: string;
  endTime: string;
  phase: string;
}

interface Props {
  fullName: string;
  attendanceHref: string;
  checkedIn: boolean;
  checkInTime: string | null | undefined;
  currentShift: ShiftInfo | null | undefined;
}

export function EmployeeWelcomeBanner({ fullName, attendanceHref, checkedIn, checkInTime, currentShift }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 shadow-md shadow-primary/15"
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-on-primary/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-on-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <p className="text-xs text-on-primary/70">Selamat datang,</p>
            <h2 className="text-lg font-bold text-on-primary leading-tight">{fullName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {currentShift && (
            <div className="flex items-center gap-1.5 text-xs bg-on-primary/15 text-on-primary px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentShift.shiftName}</span>
              <span className="font-semibold">{currentShift.startTime}–{currentShift.endTime}</span>
            </div>
          )}
          <Link
            href={attendanceHref}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              checkedIn
                ? "bg-on-primary text-primary"
                : "bg-on-primary/20 text-on-primary hover:bg-on-primary/30"
            }`}
          >
            {checkedIn
              ? `✓ ${checkInTime}`
              : currentShift?.phase === "ended"
              ? "Shift Berakhir"
              : "Belum Check In"}
          </Link>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-on-primary/60 relative">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </motion.div>
  );
}
