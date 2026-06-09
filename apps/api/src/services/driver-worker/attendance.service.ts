import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToRole } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  canCheckIn,
  canCheckOut,
  isLate,
  calcLateMinutes,
  determineAttendanceStatus,
  getTodayLocalStart,
  getNow,
  formatLocalDate,
  formatLocalTime,
  formatShiftHHMM,
} from "./attendance.utils.js";
import {
  getEmployeeOutlet,
  getEmployeeShiftForDate,
  hasActiveDriverTask,
} from "./attendance.utils.db.js";

interface CheckInBody {
  lat?: number;
  lng?: number;
}

interface CheckInData {
  check_in_time: Date;
  outlet_id: string;
  is_late: boolean;
  late_minutes: number;
  status: "on_time" | "late" | "absent";
  check_in_latitude?: number;
  check_in_longitude?: number;
}

async function buildShiftPayload(
  employeeId: string,
  shiftInfo: { shiftName: string; startTime: Date; endTime: Date },
  now: Date,
  todayAttendance: { check_in_time: Date | null; check_out_time: Date | null } | null,
) {
  const { shiftName, startTime, endTime } = shiftInfo;
  const outlet = await getEmployeeOutlet(employeeId);
  const outletData = await prisma.outlet.findUnique({ where: { id: outlet } });

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
    outletName: outletData?.name ?? "",
    outletId: outlet,
    canCheckIn: !alreadyCheckedIn && canCheckIn(now, startTime, endTime, 15),
    canCheckOut: alreadyCheckedIn && !alreadyCheckedOut && now > endTime,
    serverNow: now.toISOString(),
  };
}

export const attendanceService = {
  async checkIn(employeeId: string, body?: CheckInBody) {
    const now = getNow();
    const today = getTodayLocalStart();

    const existing = await prisma.attendance.findUnique({
      where: { employee_id_date: { employee_id: employeeId, date: today } },
    });

    if (existing) {
      if (existing.check_out_time) throw new AppError("Anda sudah check-out hari ini, tidak dapat check-in lagi.", 400);
      if (existing.check_in_time) throw new AppError("Anda sudah melakukan check-in hari ini.", 400);
    }

    const shift = await getEmployeeShiftForDate(employeeId, today);
    if (!shift) throw new AppError("Anda tidak memiliki shift yang aktif hari ini", 403);
    if (!canCheckIn(now, shift.startTime, shift.endTime, 15)) {
      throw new AppError("Check-in hanya dapat dilakukan maksimal 15 menit sebelum shift dimulai", 403);
    }

    const outletId = await getEmployeeOutlet(employeeId);
    const checkInData: CheckInData = {
      check_in_time: now,
      outlet_id: outletId,
      is_late: isLate(now, shift.startTime),
      late_minutes: calcLateMinutes(now, shift.startTime),
      status: determineAttendanceStatus(now, shift.startTime),
      ...(body?.lat !== undefined && { check_in_latitude: body.lat }),
      ...(body?.lng !== undefined && { check_in_longitude: body.lng }),
    };

    const attendance = await prisma.attendance.create({
      data: { employee_id: employeeId, date: today, ...checkInData },
    });

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { full_name: true, outlet_id: true },
    });

    if (employee?.outlet_id) {
      emitToRoom(`outlet:${employee.outlet_id}`, "attendance:checkin", {
        employeeId,
        employeeName: employee.full_name,
        outletId: employee.outlet_id,
        checkInTime: formatLocalTime(now),
        attendanceId: attendance.id,
      });
    }
    emitToRole("super_admin", "attendance:updated", { type: "checkin", attendanceId: attendance.id, outletId: employee?.outlet_id });

    return attendance;
  },

  async checkOut(attendanceId: string, employeeId: string) {
    const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!attendance) throw new AppError("Record absensi tidak ditemukan", 404);
    if (attendance.employee_id !== employeeId) throw new AppError("Anda tidak memiliki akses ke absensi ini", 403);
    if (attendance.check_out_time) throw new AppError("Anda sudah check-out hari ini", 403);

    const shift = await getEmployeeShiftForDate(employeeId, attendance.date);
    if (!shift) throw new AppError("Data shift tidak ditemukan untuk absensi ini", 400);

    const now = getNow();
    if (!canCheckOut(now, shift.endTime)) {
      throw new AppError("Check-out hanya dapat dilakukan setelah shift selesai", 403);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { role: true, full_name: true, outlet_id: true },
    });
    if (employee?.role === "driver") {
      const hasActive = await hasActiveDriverTask(employeeId);
      if (hasActive) throw new AppError("Selesaikan task aktif sebelum check-out", 403);
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { check_out_time: now },
    });

    if (employee?.outlet_id) {
      emitToRoom(`outlet:${employee.outlet_id}`, "attendance:checkout", {
        employeeId,
        employeeName: employee.full_name,
        outletId: attendance.outlet_id,
        checkOutTime: formatLocalTime(now),
        attendanceId,
      });
    }
    emitToRole("super_admin", "attendance:updated", { type: "checkout", attendanceId, outletId: employee?.outlet_id });

    return updated;
  },

  async getMyAttendanceLogs(employeeId: string, page: number, limit: number, startDate?: Date, endDate?: Date) {
    const where = {
      employee_id: employeeId,
      ...(startDate || endDate ? { date: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
    };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({ where, orderBy: { date: "desc" }, skip, take: limit }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        ...log,
        date: formatLocalDate(log.date),
        check_in_time: formatLocalTime(log.check_in_time),
        check_out_time: formatLocalTime(log.check_out_time),
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  },

  async getAttendanceReport(
    outletId: string | undefined,
    employeeId: string | undefined,
    status: "on_time" | "late" | "absent" | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    page: number,
    limit: number,
  ) {
    const where = {
      ...(employeeId ? { employee_id: employeeId } : outletId ? { outlet_id: outletId } : {}),
      ...(startDate || endDate ? { date: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
      ...(status && { status }),
    };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: { select: { id: true, full_name: true, email: true, role: true, outlet_id: true } },
          outlet: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        ...log,
        user: log.employee,
        user_id: log.employee_id,
        attendance_date: formatLocalDate(log.date),
        date: formatLocalDate(log.date),
        check_in_time: formatLocalTime(log.check_in_time),
        check_out_time: formatLocalTime(log.check_out_time),
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  },

  async checkTodayAttendance(employeeId: string) {
    const today = getTodayLocalStart();
    const attendance = await prisma.attendance.findUnique({
      where: { employee_id_date: { employee_id: employeeId, date: today } },
    });
    if (!attendance) return null;
    return {
      ...attendance,
      date: formatLocalDate(attendance.date),
      check_in_time: formatLocalTime(attendance.check_in_time),
      check_out_time: formatLocalTime(attendance.check_out_time),
    };
  },

  async getUpcomingOrActiveShift(employeeId: string) {
    const now = getNow();
    const today = getTodayLocalStart();
    const [shiftInfo, todayAttendance] = await Promise.all([
      getEmployeeShiftForDate(employeeId, today),
      prisma.attendance.findUnique({
        where: { employee_id_date: { employee_id: employeeId, date: today } },
        select: { check_in_time: true, check_out_time: true },
      }),
    ]);
    if (!shiftInfo) return null;
    return buildShiftPayload(employeeId, shiftInfo, now, todayAttendance);
  },

};
