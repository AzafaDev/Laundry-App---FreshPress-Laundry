import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser, emitToRole } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  getEmployeeOutlet,
  getEmployeeShiftForDate,
  canCheckIn,
  canCheckOut,
  isLate,
  isWithinRadius,
} from "./attendanceHelper.js";

function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date | null): string | null {
  if (!date) return null;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

interface CheckInBody {
  lat?: number;
  lng?: number;
}

export const attendanceService = {
  async checkIn(employeeId: string, body?: CheckInBody) {
    const now = new Date();
    const today = getTodayUTC();

    const existing = await prisma.attendance.findUnique({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today,
        },
      },
    });

    if (existing) {
      if (existing.check_out_time) {
        throw new AppError("Anda sudah check-out hari ini, tidak dapat check-in lagi.", 400);
      }
      if (existing.check_in_time) {
        throw new AppError("Anda sudah melakukan check-in hari ini.", 400);
      }
    }

    const shift = await getEmployeeShiftForDate(employeeId, today);
    if (!shift) {
      throw new AppError("Anda tidak memiliki shift yang aktif hari ini", 403);
    }

    if (!canCheckIn(now, shift.startTime, shift.endTime, 15)) {
      throw new AppError("Check-in hanya dapat dilakukan maksimal 15 menit sebelum shift dimulai", 403);
    }

    const outletId = await getEmployeeOutlet(employeeId);

    const checkInData: any = {
      check_in_time: now,
      outlet_id: outletId,
    };
    if (body?.lat !== undefined) checkInData.check_in_latitude = body.lat;
    if (body?.lng !== undefined) checkInData.check_in_longitude = body.lng;

    let attendance;
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: checkInData,
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          employee_id: employeeId,
          date: today,
          ...checkInData,
        },
      });
    }

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

    emitToUser(employeeId, "attendance:updated", { type: "checkin", attendanceId: attendance.id });
    emitToRole("super_admin", "attendance:updated", { type: "checkin", attendanceId: attendance.id, outletId: employee?.outlet_id });

    return attendance;
  },

  async checkOut(attendanceId: string, employeeId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });
    if (!attendance) {
      throw new AppError("Record absensi tidak ditemukan", 404);
    }
    if (attendance.employee_id !== employeeId) {
      throw new AppError("Anda tidak memiliki akses ke absensi ini", 403);
    }
    if (attendance.check_out_time) {
      throw new AppError("Anda sudah check-out hari ini", 403);
    }

    const now = new Date();
    const attendanceDate = new Date(attendance.date);
    const shift = await getEmployeeShiftForDate(employeeId, attendanceDate);
    if (!shift) {
      throw new AppError("Tidak ada shift untuk tanggal absensi ini", 403);
    }

    if (!canCheckOut(now, shift.endTime)) {
      throw new AppError("Check-out hanya dapat dilakukan setelah shift berakhir", 403);
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { check_out_time: now },
    });

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { full_name: true, outlet_id: true },
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

    emitToUser(employeeId, "attendance:updated", { type: "checkout", attendanceId });
    emitToRole("super_admin", "attendance:updated", { type: "checkout", attendanceId, outletId: employee?.outlet_id });

    return updated;
  },

  async getMyAttendanceLogs(
    employeeId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { employee_id: employeeId };
    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    const logsWithStatus = await Promise.all(
      logs.map(async (log) => {
        let status = null;
        if (log.check_in_time) {
          const shift = await getEmployeeShiftForDate(employeeId, log.date);
          if (shift) {
            const isLateFlag = isLate(log.check_in_time, shift.startTime);
            status = isLateFlag ? "late" : "on_time";
          }
        }
        return {
          ...log,
          status,
          date: formatLocalDate(log.date),
          check_in_time: formatLocalTime(log.check_in_time),
          check_out_time: formatLocalTime(log.check_out_time),
        };
      }),
    );

    return {
      data: logsWithStatus,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async getAttendanceReport(
    outletId: string | undefined,
    employeeId: string | undefined,
    status: "on_time" | "late" | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    page: number,
    limit: number,
  ) {
    const where: any = {};
    if (employeeId) {
      where.employee_id = employeeId;
    } else if (outletId) {
      where.outlet_id = outletId;
    }
    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
              email: true,
              role: true,
              outlet_id: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    const logsWithStatus = await Promise.all(
      logs.map(async (log) => {
        let statusVal = null;
        if (log.check_in_time && log.employee) {
          const shift = await getEmployeeShiftForDate(log.employee.id, log.date);
          if (shift) {
            const isLateFlag = isLate(log.check_in_time, shift.startTime);
            statusVal = isLateFlag ? "late" : "on_time";
          }
        }
        return {
          ...log,
          status: statusVal,
          user: log.employee,
          user_id: log.employee_id,
          attendance_date: formatLocalDate(log.date),
          date: formatLocalDate(log.date),
          check_in_time: formatLocalTime(log.check_in_time),
          check_out_time: formatLocalTime(log.check_out_time),
        };
      }),
    );

    let filteredLogs = logsWithStatus;
    if (status) {
      filteredLogs = logsWithStatus.filter((log) => log.status === status);
    }

    return {
      data: filteredLogs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async checkTodayAttendance(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await prisma.attendance.findUnique({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today,
        },
      },
    });
    if (attendance) {
      return {
        ...attendance,
        date: formatLocalDate(attendance.date),
        check_in_time: formatLocalTime(attendance.check_in_time),
        check_out_time: formatLocalTime(attendance.check_out_time),
      };
    }
    return null;
  },

  async getCurrentShift(employeeId: string) {
    const now = new Date();
    const dayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay();

    const employeeShift = await prisma.employeeShift.findFirst({
      where: {
        employee_id: employeeId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
      include: {
        shift: true,
        outlet: true,
      },
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

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, startSecond);
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, endSecond);
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const isActive = now >= start && now <= end;
    let progressPercent = 0;
    let remainingSeconds = 0;

    if (isActive) {
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
      remainingSeconds = Math.max(0, (end.getTime() - now.getTime()) / 1000);
    }

    const startTimeStr = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:${String(startSecond).padStart(2, "0")}`;
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:${String(endSecond).padStart(2, "0")}`;

    const canCheckInNow = canCheckIn(now, start, end, 15);
    const canCheckOutNow = canCheckOut(now, end);

    return {
      shiftName: shift.name,
      startTime: startTimeStr,
      endTime: endTimeStr,
      isActive,
      progressPercent: Math.round(progressPercent),
      remainingSeconds,
      outletName: employeeShift.outlet.name,
      outletId: employeeShift.outlet.id,
      canCheckIn: canCheckInNow,
      canCheckOut: canCheckOutNow,
    };
  },
};