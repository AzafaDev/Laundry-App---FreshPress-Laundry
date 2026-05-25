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

export async function getEmployeeShiftForToday(
  employeeId: string,
  now: Date,
): Promise<{ shiftName: string; startTime: Date; endTime: Date } | null> {
  const jsDay = now.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeeShift = await prisma.employeeShift.findFirst({
    where: {
      employee_id: employeeId,
      day_of_week: dbDay,
      is_active: true,
    },
    include: {
      shift: true, // work_shifts
    },
  });

  if (!employeeShift || !employeeShift.shift) {
    return null;
  }

  const shift = employeeShift.shift;

  const startUTCHours = shift.start_time.getUTCHours();
  const startUTCMinutes = shift.start_time.getUTCMinutes();
  const startUTCSeconds = shift.start_time.getUTCSeconds();

  const endUTCHours = shift.end_time.getUTCHours();
  const endUTCMinutes = shift.end_time.getUTCMinutes();
  const endUTCSeconds = shift.end_time.getUTCSeconds();

  const startTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startUTCHours,
    startUTCMinutes,
    startUTCSeconds,
  );

  const endTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endUTCHours,
    endUTCMinutes,
    endUTCSeconds,
  );

  return { shiftName: shift.name, startTime, endTime };
}

export function isLate(
  checkInTime: Date,
  shiftStartTime: Date,
  lateThresholMinutes: number = 30,
): boolean {
  const diffMinutes =
    (checkInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60);
  return diffMinutes > lateThresholMinutes;
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
