import { LATE_THRESHOLD_MINUTES } from "../../config/constants.js";
import { formatShiftHHMM } from "../../utils/format.util.js";

export function canCheckIn(now: Date, shiftStart: Date, shiftEnd: Date, toleranceMinutes = 15): boolean {
  const allowedStart = new Date(shiftStart.getTime() - toleranceMinutes * 60000);
  return now >= allowedStart && now <= shiftEnd;
}

export function canCheckOut(now: Date, shiftEnd: Date): boolean {
  return now > shiftEnd;
}

export function isLate(checkInTime: Date, shiftStartTime: Date): boolean {
  const diffMinutes = (checkInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60);
  return diffMinutes > LATE_THRESHOLD_MINUTES;
}

export function calcLateMinutes(checkInTime: Date, shiftStartTime: Date): number {
  const diff = (checkInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60);
  return Math.max(0, Math.floor(diff));
}

export function determineAttendanceStatus(
  checkInTime: Date | null,
  shiftStartTime: Date | null,
): "on_time" | "late" | "absent" {
  if (!checkInTime) return "absent";
  if (!shiftStartTime) return "on_time";
  return isLate(checkInTime, shiftStartTime) ? "late" : "on_time";
}

export function buildShiftPayload(
  shiftInfo: { shiftName: string; startTime: Date; endTime: Date },
  now: Date,
  todayAttendance: { check_in_time: Date | null; check_out_time: Date | null } | null,
  outletId: string,
  outletName: string,
) {
  const { shiftName, startTime, endTime } = shiftInfo;

  const isEnded = now > endTime;
  const isActive = !isEnded && now >= startTime;
  const isPreShift = now < startTime;
  const phase: "pre_shift" | "active" | "ended" = isEnded ? "ended" : isActive ? "active" : "pre_shift";

  let progressPercent = 0;
  let remainingSeconds = 0;
  if (isActive) {
    const total = endTime.getTime() - startTime.getTime();
    const elapsed = now.getTime() - startTime.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    remainingSeconds = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
  } else if (isPreShift) {
    remainingSeconds = Math.max(0, (startTime.getTime() - now.getTime()) / 1000);
  } else {
    progressPercent = 100;
  }

  const alreadyCheckedIn = !!todayAttendance?.check_in_time;
  const alreadyCheckedOut = !!todayAttendance?.check_out_time;

  return {
    shiftName,
    startTime: formatShiftHHMM(startTime),
    endTime: formatShiftHHMM(endTime),
    isActive,
    phase,
    progressPercent: Math.round(progressPercent),
    remainingSeconds,
    outletName,
    outletId,
    canCheckIn: !alreadyCheckedIn && canCheckIn(now, startTime, endTime, 15),
    canCheckOut: alreadyCheckedIn && !alreadyCheckedOut && now > endTime,
    serverNow: now.toISOString(),
  };
}
