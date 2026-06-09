import { AppError } from "../../middlewares/error.middleware.js";
import { getEmployeeOutlet, getShiftForDateTime } from "./attendance.utils.db.js";
import { getNow, getTodayLocalStart } from "./attendance.utils.js";
import { prisma } from "../../lib/prisma.js";
import { attendanceService } from "./attendance.service.js";

export async function getActiveShiftForTask(employeeId: string) {
  const now = getNow();
  const today = getTodayLocalStart();
  const [shiftInfo, todayAttendance] = await Promise.all([
    getShiftForDateTime(employeeId, now),
    prisma.attendance.findUnique({
      where: { employee_id_date: { employee_id: employeeId, date: today } },
      select: { check_in_time: true, check_out_time: true },
    }),
  ]);
  if (!shiftInfo) return null;

  const isEnded = now > shiftInfo.endTime;
  const isActive = !isEnded && now >= shiftInfo.startTime;

  return { ...shiftInfo, isActive, todayAttendance };
}

export async function assertShiftEligibility(employeeId: string): Promise<string> {
  const [currentShift, todayAttendance, outletId] = await Promise.all([
    getActiveShiftForTask(employeeId),
    attendanceService.checkTodayAttendance(employeeId),
    getEmployeeOutlet(employeeId),
  ]);

  if (!currentShift?.isActive) throw new AppError("Shift tidak aktif", 403);
  if (!todayAttendance?.check_in_time) throw new AppError("Anda belum melakukan check-in hari ini", 403);
  if (todayAttendance.check_out_time) throw new AppError("Anda sudah check-out hari ini", 403);

  return outletId;
}
