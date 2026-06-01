"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlarmClock, ArrowRight } from "lucide-react";

interface CheckInPromptProps {
  href: string;
}

export function CheckInPrompt({ href }: CheckInPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-[#fffbeb] border border-amber-200 rounded-xl px-4 py-3"
    >
      {/* Pulsing dot */}
      <div className="relative flex-shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
        <span className="relative inline-flex w-3 h-3 rounded-full bg-amber-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 leading-tight">
          Belum check-in hari ini
        </p>
        <p className="text-xs text-amber-700/80 mt-0.5">
          Check-in dulu sebelum mulai bekerja
        </p>
      </div>

      <Link
        href={href}
        className="flex-shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.97] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
      >
        Check In
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
