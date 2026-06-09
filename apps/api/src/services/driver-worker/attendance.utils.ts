import { LATE_THRESHOLD_MINUTES } from "../../config/constants.js";

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export function toWIBView(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

export function wibTimeOnDate(wibView: Date, hour: number, minute: number, second: number): Date {
  return new Date(
    Date.UTC(wibView.getUTCFullYear(), wibView.getUTCMonth(), wibView.getUTCDate(), hour, minute, second) - WIB_OFFSET_MS
  );
}

export function getNow(): Date {
  if (process.env.MOCK_NOW) return new Date(process.env.MOCK_NOW);
  return new Date();
}

export function getTodayLocalStart(): Date {
  const wib = toWIBView(getNow());
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
}

export function toLocalMidnight(date: Date): Date {
  const wib = toWIBView(date);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
}

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

export function formatLocalDate(date: Date): string {
  const wib = toWIBView(date);
  const year = wib.getUTCFullYear();
  const month = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wib.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(date: Date | null): string | null {
  if (!date) return null;
  const wib = toWIBView(date);
  const h = String(wib.getUTCHours()).padStart(2, "0");
  const m = String(wib.getUTCMinutes()).padStart(2, "0");
  const s = String(wib.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatShiftHHMM(date: Date): string {
  const wib = toWIBView(date);
  return `${String(wib.getUTCHours()).padStart(2, "0")}:${String(wib.getUTCMinutes()).padStart(2, "0")}`;
}
