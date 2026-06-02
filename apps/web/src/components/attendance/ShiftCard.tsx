"use client";

import { useState, useEffect } from "react";
import { formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import type { CurrentShift } from "@/services/attendance.service";

interface ShiftCardProps {
  currentShift: CurrentShift | null;
}

function useClientProgress(currentShift: CurrentShift | null) {
  const fetchTime = useState(() => Date.now())[0];
  const serverBase = currentShift?.serverNow ? new Date(currentShift.serverNow).getTime() : Date.now();
  const [now, setNow] = useState(() => new Date(serverBase + (Date.now() - fetchTime)));

  useEffect(() => {
    if (!currentShift || (currentShift.phase !== "active" && currentShift.phase !== "pre_shift")) return;
    const timer = setInterval(() => {
      setNow(new Date(serverBase + (Date.now() - fetchTime)));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentShift]);

  if (!currentShift) {
    return { progressPercent: 0, remainingSeconds: 0 };
  }

  const [startH, startM] = currentShift.startTime.split(":").map(Number);
  const [endH, endM] = currentShift.endTime.split(":").map(Number);
  const todayBase = new Date(now);

  const start = new Date(todayBase);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(todayBase);
  end.setHours(endH, endM, 0, 0);

  if (currentShift.phase === "pre_shift") {
    const remainingSeconds = Math.max(0, Math.round((start.getTime() - now.getTime()) / 1000));
    return { progressPercent: currentShift.progressPercent ?? 0, remainingSeconds };
  }

  if (currentShift.phase !== "active") {
    return { progressPercent: currentShift.progressPercent ?? 0, remainingSeconds: currentShift.remainingSeconds ?? 0 };
  }

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const remainingSeconds = Math.max(0, Math.round((end.getTime() - now.getTime()) / 1000));

  return { progressPercent, remainingSeconds };
}

export function ShiftCard({ currentShift }: ShiftCardProps) {
  const { progressPercent, remainingSeconds } = useClientProgress(currentShift);
  if (!currentShift) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-error font-semibold text-sm">Tidak Ada Shift Hari Ini</span>
        </div>
        <p className="text-on-surface-variant text-sm mt-2">
          Anda tidak memiliki jadwal shift untuk hari ini. Silakan hubungi outlet admin.
        </p>
      </div>
    );
  }

  const { shiftName, startTime, endTime, isActive, phase } = currentShift;

  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const startTimeStr = formatTime(startTime);
  const endTimeStr = formatTime(endTime);

  let statusText = "";
  let badgeColor = "";

  if (phase === "active") {
    statusText = "Sedang Berlangsung";
    badgeColor = "bg-primary/10 text-primary border-primary/20";
  } else if (phase === "pre_shift") {
    statusText = "Akan Segera Dimulai";
    badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
  } else {
    statusText = "Telah Berakhir";
    badgeColor = "bg-surface-container-high text-on-surface-variant border-outline-variant";
  }

  let remainingTimeStr = "";
  if (phase === "active" && remainingSeconds > 0) {
    const duration = intervalToDuration({ start: 0, end: remainingSeconds * 1000 });
    remainingTimeStr = formatDuration(duration, { locale: id, delimiter: " " });
  } else if (phase === "pre_shift" && remainingSeconds > 0) {
    if (remainingSeconds < 300) {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      remainingTimeStr = mins > 0
        ? `${mins} menit ${secs} detik lagi`
        : `${secs} detik lagi`;
    } else if (remainingSeconds < 3600) {
      const minutesToStart = Math.ceil(remainingSeconds / 60);
      remainingTimeStr = `${minutesToStart} menit lagi`;
    } else {
      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.ceil((remainingSeconds % 3600) / 60);
      remainingTimeStr = mins > 0
        ? `${hours} jam ${mins} menit lagi`
        : `${hours} jam lagi`;
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-outline"}`} />
          <h3 className="text-lg font-bold text-on-surface">{shiftName}</h3>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-on-surface-variant">
        <span>🕒 {startTimeStr} - {endTimeStr}</span>
      </div>

      {isActive && (
        <div className="space-y-2">
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant text-right">
            Sisa {remainingTimeStr || "0 menit"}
          </p>
        </div>
      )}

      {!isActive && statusText === "Akan Segera Dimulai" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
            ⏰ Shift akan dimulai dalam {remainingTimeStr}
          </p>
        </div>
      )}

      {!isActive && statusText === "Telah Berakhir" && (
        <div className="bg-surface-container-high rounded-lg p-3">
          <p className="text-sm text-on-surface-variant">
            Shift hari ini sudah berakhir. Anda tidak dapat melakukan check-in.
          </p>
        </div>
      )}
    </div>
  );
}