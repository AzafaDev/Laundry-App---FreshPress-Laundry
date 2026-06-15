import { toWIBView } from "./time.util.js";

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
