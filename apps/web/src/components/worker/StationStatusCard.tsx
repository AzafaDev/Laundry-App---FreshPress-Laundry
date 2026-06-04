"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Package, Wheat, ArrowRight, UserX, Lock } from "lucide-react";

export const stationMeta = {
  washing: {
    label: "Stasiun Cuci",
    icon: Shirt,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    cta: "Ke Stasiun Cuci",
  },
  ironing: {
    label: "Stasiun Setrika",
    icon: Wheat,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    cta: "Ke Stasiun Setrika",
  },
  packing: {
    label: "Stasiun Packing",
    icon: Package,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
    border: "border-tertiary/20",
    cta: "Ke Stasiun Packing",
  },
} as const;

export function LockedStationPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center bg-surface border border-outline-variant rounded-2xl p-10 text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-2xl" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-outline-variant/20 flex items-center justify-center">
          <Lock className="w-7 h-7 text-outline" />
        </div>
        <p className="text-base font-semibold text-on-surface">Check-in dulu</p>
        <p className="text-sm text-on-surface-variant">Check-in untuk melihat pekerjaan di stasiunmu</p>
      </div>
    </motion.div>
  );
}

export function StationStatusCard({
  count,
  stationType,
  isLoading,
}: {
  count: number;
  stationType: "washing" | "ironing" | "packing" | null;
  isLoading: boolean;
}) {
  if (!stationType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center bg-surface border border-outline-variant rounded-2xl p-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-outline-variant/20 flex items-center justify-center mb-4">
          <UserX className="w-7 h-7 text-outline" />
        </div>
        <p className="text-base font-semibold text-on-surface">Belum di-assign ke stasiun</p>
        <p className="text-sm text-on-surface-variant mt-1">Hubungi supervisor untuk mendapatkan assignment</p>
      </motion.div>
    );
  }

  const meta = stationMeta[stationType];
  const Icon = meta.icon;

  if (isLoading) {
    return (
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-outline-variant/50 rounded mb-4" />
        <div className="h-16 w-24 bg-outline-variant/50 rounded mb-4" />
        <div className="h-12 bg-outline-variant/50 rounded-xl" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center bg-surface border border-outline-variant rounded-2xl p-10 text-center"
      >
        <div className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${meta.color}`} />
        </div>
        <p className="text-base font-semibold text-on-surface">Tidak ada pekerjaan saat ini</p>
        <p className="text-sm text-on-surface-variant mt-1">{meta.label} sedang kosong</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border-2 ${meta.border} rounded-2xl p-6 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <span className="text-sm font-semibold text-on-surface-variant">{meta.label}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-black leading-none ${meta.color}`}>{count}</span>
          <span className="text-base text-on-surface-variant mb-1.5 font-medium">item menunggu</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">Segera proses agar tidak menumpuk</p>
      </div>

      <Link
        href="/dashboard/worker/station"
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-on-primary transition-all active:scale-[0.98] ${
          stationType === "washing"
            ? "bg-primary hover:opacity-90"
            : stationType === "ironing"
            ? "bg-secondary hover:opacity-90"
            : "bg-tertiary hover:opacity-90"
        }`}
      >
        {meta.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
