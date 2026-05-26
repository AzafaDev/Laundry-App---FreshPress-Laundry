"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import type { CurrentShift } from "@/services/attendance.service";

interface ShiftCardProps {
  currentShift: CurrentShift | null;
}

export function ShiftCard({ currentShift }: ShiftCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const { shiftName, startTime, endTime, isActive, progressPercent, remainingSeconds } = currentShift;

  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const startTimeStr = formatTime(startTime);
  const endTimeStr = formatTime(endTime);

  let statusText = "";
  let badgeColor = "";

  if (isActive) {
    statusText = "Sedang Berlangsung";
    badgeColor = "bg-primary/10 text-primary border-primary/20";
  } else {
    const nowDate = now;
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    const endHour = parseInt(endTime.split(":")[0]);
    const endMinute = parseInt(endTime.split(":")[1]);

    const shiftStartToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), startHour, startMinute, 0);
    const shiftEndToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), endHour, endMinute, 0);
    if (shiftEndToday <= shiftStartToday) shiftEndToday.setDate(shiftEndToday.getDate() + 1);

    const minutesToStart = differenceInSeconds(shiftStartToday, nowDate) / 60;
    const willStartSoon = !isActive && minutesToStart > 0 && minutesToStart <= 30;

    if (willStartSoon) {
      statusText = "Akan Segera Dimulai";
      badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
    } else if (nowDate > shiftEndToday) {
      statusText = "Telah Berakhir";
      badgeColor = "bg-surface-container-high text-on-surface-variant border-outline-variant";
    } else {
      statusText = "Belum Dimulai";
      badgeColor = "bg-surface-container-high text-on-surface-variant border-outline-variant";
    }
  }

  let remainingTimeStr = "";
  if (isActive && remainingSeconds > 0) {
    const duration = intervalToDuration({ start: 0, end: remainingSeconds * 1000 });
    remainingTimeStr = formatDuration(duration, { locale: id, delimiter: " " });
  } else if (!isActive && statusText === "Akan Segera Dimulai") {
    const shiftStartToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(startTime.split(":")[0]), parseInt(startTime.split(":")[1]), 0);
    const minutesToStart = Math.ceil((shiftStartToday.getTime() - now.getTime()) / (1000 * 60));
    remainingTimeStr = `${minutesToStart} menit lagi`;
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