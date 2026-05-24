import { prisma } from "../../lib/prisma.js";
import { emitToRole } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  getEmployeeOutlet,
  getEmployeeShiftForToday,
  isLate,
  isWithinRadius,
} from "./attendanceHelper.js";

export const attendanceService = {
  async checkIn(employeeId: string, body?: { lat?: number; lng?: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today,
        },
      },
    });

    if (existing && existing.check_in_time) {
      throw new AppError("Anda sudah melakukan check-in hari ini", 400);
    }

    const outletId = await getEmployeeOutlet(employeeId);

    if (body?.lat !== undefined && body.lng !== undefined) {
      const within = await isWithinRadius(outletId, body.lat, body.lng);
      // if (!within) {
      //   throw new AppError(
      //     "Anda harus berada di sekitar outlet untuk check-in",
      //     403,
      //   );
      // }
    } else {
      throw new AppError(
        "Lokasi tidak tersedia. Aktifkan GPS untuk check-in",
        400,
      );
    }

    const shift = await getEmployeeShiftForToday(employeeId, new Date());
    if (!shift) {
      throw new AppError("Anda tidak memiliki shift yang aktif hari ini", 403);
    }

    const now = new Date();
    const checkInTime = now;

    const checkInData: any = {
      check_in_time: checkInTime,
      outlet_id: outletId,
    };
    if (body?.lat !== undefined) checkInData.check_in_latitude = body.lat;
    if (body?.lng !== undefined) checkInData.check_in_longitude = body.lng;

    const attendance = await prisma.attendance.upsert({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today,
        },
      },
      update: checkInData,
      create: {
        employee_id: employeeId,
        date: today,
        ...checkInData,
      },
    });

    // Socket emit dengan employee name
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { full_name: true },
    });

    emitToRole("outlet_admin", "attendance:checkin", {
      employeeId,
      employeeName: employee?.full_name,
      outletId,
      checkInTime: now.toLocaleTimeString("id-ID"),
      attendanceId: attendance.id,
    });

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
    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        check_out_time: now,
      },
    });

    // Get employee name for socket emit
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { full_name: true },
    });

    emitToRole("outlet_admin", "attendance:checkout", {
      employeeId,
      employeeName: employee?.full_name,
      outletId: attendance.outlet_id,
      checkOutTime: now.toLocaleTimeString("id-ID"),
      attendanceId,
    });

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
        let status: "on_time" | "late" | null = null;
        if (log.check_in_time) {
          const shift = await getEmployeeShiftForToday(employeeId, log.date);
          if (shift) {
            const isLateFlag = isLate(log.check_in_time, shift.startTime);
            status = isLateFlag ? "late" : "on_time";
          }
        }
        return { ...log, status };
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
        let status: "on_time" | "late" | null = null;
        if (log.check_in_time && log.employee) {
          const shift = await getEmployeeShiftForToday(
            log.employee.id,
            log.date,
          );
          if (shift) {
            const isLateFlag = isLate(log.check_in_time, shift.startTime);
            status = isLateFlag ? "late" : "on_time";
          }
        }
        // Map employee to user for frontend compatibility
        return {
          ...log,
          status,
          user: log.employee,
          user_id: log.employee_id,
          attendance_date: log.date.toISOString(),
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
    return prisma.attendance.findUnique({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today,
        },
      },
    });
  },

  async getCurrentShift(employeeId: string) {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

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

    const { shift, outlet } = employeeShift;
    const startTime = shift.start_time;
    const endTime = shift.end_time;

    const currentTime = now.toLocaleTimeString("id-ID", { hour12: false });
    const startTimeStr = startTime.toLocaleTimeString("id-ID", {
      hour12: false,
    });
    const endTimeStr = endTime.toLocaleTimeString("id-ID", { hour12: false });

    const isWithinShift =
      currentTime >= startTimeStr && currentTime <= endTimeStr;

    return {
      shiftName: shift.name,
      startTime,
      endTime,
      outletName: outlet.name,
      outletId: outlet.id,
      isActive: isWithinShift,
    };
  },
};
