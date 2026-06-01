import { CHECKIN_RADIUS_METERS, LATE_THRESHOLD_MINUTES } from "../../config/constants.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { getDistance } from "geolib";

// Untuk testing: set MOCK_NOW di .env, contoh: MOCK_NOW=2026-05-29T07:45:00
export function getNow(): Date {
  if (process.env.MOCK_NOW) return new Date(process.env.MOCK_NOW);
  return new Date();
}

export function getTodayLocalStart(): Date {
  const now = getNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function getEmployeeOutlet(employeeId: string): Promise<string> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { outlet_id: true },
  });
  if (!employee) {
    throw new AppError("Employee tidak ditemukan.", 404);
  }
  if (!employee.outlet_id) {
    throw new AppError("Employee tidak memiliki outlet terdaftar.", 400);
  }
  return employee.outlet_id;
}

export async function getEmployeeShiftForDate(
  employeeId: string,
  localDate: Date,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const jsDay = localDate.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShift = await prisma.employeeShift.findFirst({
    where: {
      employee_id: employeeId,
      day_of_week: dbDay,
      is_active: true,
    },
    include: { shift: true },
  });

  if (!employeeShift || !employeeShift.shift) {
    return null;
  }

  const shift = employeeShift.shift;
  const startHour = shift.start_time.getUTCHours();
  const startMinute = shift.start_time.getUTCMinutes();
  const startSecond = shift.start_time.getUTCSeconds();
  const endHour = shift.end_time.getUTCHours();
  const endMinute = shift.end_time.getUTCMinutes();
  const endSecond = shift.end_time.getUTCSeconds();

  const startTime = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    startHour,
    startMinute,
    startSecond,
  );

  let endTime = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    endHour,
    endMinute,
    endSecond,
  );

  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return { shiftName: shift.name, startTime, endTime };
}

export function canCheckIn(
  now: Date,
  shiftStart: Date,
  shiftEnd: Date,
  toleranceMinutes = 15,
): boolean {
  const allowedStart = new Date(
    shiftStart.getTime() - toleranceMinutes * 60000,
  );
  return now >= allowedStart && now <= shiftEnd;
}

export function canCheckOut(now: Date, shiftStart: Date, shiftEnd: Date): boolean {
  return now >= shiftStart && now <= shiftEnd;
}

export function isLate(
  checkInTime: Date,
  shiftStartTime: Date,
): boolean {
  const diffMinutes =
    (checkInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60);
  return diffMinutes > LATE_THRESHOLD_MINUTES;
}

export function determineAttendanceStatus(
  checkInTime: Date | null,
  shiftStartTime: Date | null,
): "on_time" | "late" | "absent" {
  if (!checkInTime) return "absent";
  if (!shiftStartTime) return "on_time";
  return isLate(checkInTime, shiftStartTime) ? "late" : "on_time";
}

export async function isWithinRadius(
  outletId: string,
  userLat: number,
  userLng: number,
): Promise<boolean> {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { latitude: true, longitude: true },
  });
  if (!outlet || outlet.latitude === null || outlet.longitude === null) {
    return false;
  }
  const distance = getDistance(
    { latitude: userLat, longitude: userLng },
    { latitude: Number(outlet.latitude), longitude: Number(outlet.longitude) },
  );
  return distance <= CHECKIN_RADIUS_METERS;
}

export async function getShiftForDateTime(
  employeeId: string,
  targetDate: Date,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const jsDay = targetDate.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShifts = await prisma.employeeShift.findMany({
    where: {
      employee_id: employeeId,
      day_of_week: dbDay,
      is_active: true,
    },
    include: { shift: true },
  });

  if (employeeShifts.length === 0) return null;

  const targetHour = targetDate.getHours();
  const targetMinute = targetDate.getMinutes();
  const targetTimeInMinutes = targetHour * 60 + targetMinute;

  for (const es of employeeShifts) {
    const shift = es.shift;
    const startHour = shift.start_time.getUTCHours();
    const startMinute = shift.start_time.getUTCMinutes();
    const startSecond = shift.start_time.getUTCSeconds();
    const endHour = shift.end_time.getUTCHours();
    const endMinute = shift.end_time.getUTCMinutes();
    const endSecond = shift.end_time.getUTCSeconds();

    const startTotal = startHour * 60 + startMinute;
    let endTotal = endHour * 60 + endMinute;

    const isOvernight = endTotal < startTotal;
    if (isOvernight) endTotal += 24 * 60;

    let targetAdjusted = targetTimeInMinutes;
    if (isOvernight && targetAdjusted < startTotal) {
      targetAdjusted += 24 * 60;
    }

    if (targetAdjusted >= startTotal && targetAdjusted <= endTotal) {
      const startDate = new Date(targetDate);
      startDate.setHours(startHour, startMinute, startSecond, 0);
      if (isOvernight && targetAdjusted < startTotal) {
        startDate.setDate(startDate.getDate() - 1);
      }

      let endDate = new Date(targetDate);
      endDate.setHours(endHour, endMinute, endSecond, 0);
      if (isOvernight && targetAdjusted >= startTotal) {
        endDate.setDate(endDate.getDate() + 1);
      }

      return {
        shiftName: shift.name,
        startTime: startDate,
        endTime: endDate,
      };
    }
  }
  return null;
}

export async function getUpcomingShiftForDateTime(
  employeeId: string,
  targetDate: Date,
  preShiftMinutes = 15,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const jsDay = targetDate.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShifts = await prisma.employeeShift.findMany({
    where: { employee_id: employeeId, day_of_week: dbDay, is_active: true },
    include: { shift: true },
  });

  if (employeeShifts.length === 0) return null;

  const preShiftMs = preShiftMinutes * 60 * 1000;

  for (const es of employeeShifts) {
    const shift = es.shift;
    const startDate = new Date(targetDate);
    startDate.setHours(
      shift.start_time.getUTCHours(),
      shift.start_time.getUTCMinutes(),
      shift.start_time.getUTCSeconds(),
      0,
    );

    let endDate = new Date(targetDate);
    endDate.setHours(
      shift.end_time.getUTCHours(),
      shift.end_time.getUTCMinutes(),
      shift.end_time.getUTCSeconds(),
      0,
    );

    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);

    const allowedStart = new Date(startDate.getTime() - preShiftMs);
    if (targetDate >= allowedStart && targetDate <= endDate) {
      return { shiftName: shift.name, startTime: startDate, endTime: endDate };
    }
  }

  return null;
}

export async function hasActiveDriverTask(employeeId: string): Promise<boolean> {
  const activeTask = await prisma.driverTask.findFirst({
    where: {
      driver_id: employeeId,
      status: "in_progress",
    },
    select: { id: true },
  });
  return !!activeTask;
}
