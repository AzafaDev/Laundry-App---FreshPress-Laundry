import { CHECKIN_RADIUS_METERS } from "../../config/constants.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { getDistance } from "geolib";

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
  date: Date,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const jsDay = date.getDay();
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
  const startHour = shift.start_time.getHours();
  const startMinute = shift.start_time.getMinutes();
  const startSecond = shift.start_time.getSeconds();
  const endHour = shift.end_time.getHours();
  const endMinute = shift.end_time.getMinutes();
  const endSecond = shift.end_time.getSeconds();

  let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute, startSecond);
  let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute, endSecond);

  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return { shiftName: shift.name, startTime, endTime };
}

export function canCheckIn(now: Date, shiftStart: Date, shiftEnd: Date, toleranceMinutes = 15): boolean {
  const allowedStart = new Date(shiftStart.getTime() - toleranceMinutes * 60000);
  return now >= allowedStart && now <= shiftEnd;
}

export function canCheckOut(now: Date, shiftEnd: Date): boolean {
  return now >= shiftEnd;
}

export function isLate(
  checkInTime: Date,
  shiftStartTime: Date,
  lateThresholdMinutes: number = 30,
): boolean {
  const diffMinutes =
    (checkInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60);
  return diffMinutes > lateThresholdMinutes;
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