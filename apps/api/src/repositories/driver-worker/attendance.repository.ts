import { CHECKIN_RADIUS_METERS } from "../../config/constants.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { getDistance } from "geolib";
import { toWIBView, wibTimeOnDate } from "../../utils/time.util.js";

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
  const wibDate = toWIBView(localDate);
  const jsDay = wibDate.getUTCDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShift = await prisma.employeeShift.findFirst({
    where: { employee_id: employeeId, day_of_week: dbDay, is_active: true },
    include: { shift: true },
  });

  if (!employeeShift || !employeeShift.shift) return null;

  const shift = employeeShift.shift;
  const startTime = wibTimeOnDate(wibDate, shift.start_time.getUTCHours(), shift.start_time.getUTCMinutes(), shift.start_time.getUTCSeconds());
  let endTime = wibTimeOnDate(wibDate, shift.end_time.getUTCHours(), shift.end_time.getUTCMinutes(), shift.end_time.getUTCSeconds());

  if (endTime <= startTime) endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

  return { shiftName: shift.name, startTime, endTime };
}

export async function getShiftForDateTime(
  employeeId: string,
  targetDate: Date,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const wibTarget = toWIBView(targetDate);
  const jsDay = wibTarget.getUTCDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShifts = await prisma.employeeShift.findMany({
    where: { employee_id: employeeId, day_of_week: dbDay, is_active: true },
    include: { shift: true },
  });

  if (employeeShifts.length === 0) return null;

  const targetHour = wibTarget.getUTCHours();
  const targetMinute = wibTarget.getUTCMinutes();
  const targetTimeInMinutes = targetHour * 60 + targetMinute;

  for (const es of employeeShifts) {
    const shift = es.shift;
    const startTotal = shift.start_time.getUTCHours() * 60 + shift.start_time.getUTCMinutes();
    let endTotal = shift.end_time.getUTCHours() * 60 + shift.end_time.getUTCMinutes();

    const isOvernight = endTotal < startTotal;
    if (isOvernight) endTotal += 24 * 60;

    let targetAdjusted = targetTimeInMinutes;
    if (isOvernight && targetAdjusted < startTotal) targetAdjusted += 24 * 60;

    if (targetAdjusted >= startTotal && targetAdjusted <= endTotal) {
      const startDate = wibTimeOnDate(wibTarget, shift.start_time.getUTCHours(), shift.start_time.getUTCMinutes(), shift.start_time.getUTCSeconds());
      const isAfterMidnight = isOvernight && targetTimeInMinutes < startTotal;
      const adjustedStart = isAfterMidnight ? new Date(startDate.getTime() - 24 * 60 * 60 * 1000) : startDate;

      let endDate = wibTimeOnDate(wibTarget, shift.end_time.getUTCHours(), shift.end_time.getUTCMinutes(), shift.end_time.getUTCSeconds());
      if (isOvernight && !isAfterMidnight) endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

      return { shiftName: shift.name, startTime: adjustedStart, endTime: endDate };
    }
  }
  return null;
}

export async function getUpcomingShiftForDateTime(
  employeeId: string,
  targetDate: Date,
  preShiftMinutes = 15,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const wibTarget = toWIBView(targetDate);
  const jsDay = wibTarget.getUTCDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShifts = await prisma.employeeShift.findMany({
    where: { employee_id: employeeId, day_of_week: dbDay, is_active: true },
    include: { shift: true },
  });

  if (employeeShifts.length === 0) return null;

  const preShiftMs = preShiftMinutes * 60 * 1000;

  for (const es of employeeShifts) {
    const shift = es.shift;
    const startDate = wibTimeOnDate(wibTarget, shift.start_time.getUTCHours(), shift.start_time.getUTCMinutes(), shift.start_time.getUTCSeconds());
    let endDate = wibTimeOnDate(wibTarget, shift.end_time.getUTCHours(), shift.end_time.getUTCMinutes(), shift.end_time.getUTCSeconds());

    if (endDate <= startDate) endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

    const allowedStart = new Date(startDate.getTime() - preShiftMs);
    if (targetDate >= allowedStart && targetDate <= endDate) {
      return { shiftName: shift.name, startTime: startDate, endTime: endDate };
    }
  }

  return null;
}

export async function hasActiveDriverTask(employeeId: string): Promise<boolean> {
  const activeTask = await prisma.driverTask.findFirst({
    where: { driver_id: employeeId, status: "in_progress" },
    select: { id: true },
  });
  return !!activeTask;
}
