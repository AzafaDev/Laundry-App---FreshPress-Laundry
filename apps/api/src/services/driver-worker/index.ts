import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser, emitToRole } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  getEmployeeOutlet,
  getEmployeeShiftForDate,
  canCheckIn,
  canCheckOut,
  isLate,
  determineAttendanceStatus,
  isWithinRadius,
  getTodayLocalStart,
  toLocalMidnight,
  getShiftForDateTime,
} from "./attendanceHelper.js";

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
    const today = getTodayLocalStart();

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

    const lateStatus = isLate(now, shift.startTime);
    const attendanceStatus = determineAttendanceStatus(now, shift.startTime);

    const checkInData: any = {
      check_in_time: now,
      outlet_id: outletId,
      is_late: lateStatus,
      status: attendanceStatus,
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
    const attendanceLocalMidnight = toLocalMidnight(attendance.date);
    const shift = await getEmployeeShiftForDate(employeeId, attendanceLocalMidnight);
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

    const logsWithFormattedFields = logs.map((log) => ({
      ...log,
      date: formatLocalDate(log.date),
      check_in_time: formatLocalTime(log.check_in_time),
      check_out_time: formatLocalTime(log.check_out_time),
    }));

    return {
      data: logsWithFormattedFields,
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
    status: "on_time" | "late" | "absent" | undefined,
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
    if (status) where.status = status;

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

    const logsWithFormattedFields = logs.map((log) => ({
      ...log,
      user: log.employee,
      user_id: log.employee_id,
      attendance_date: formatLocalDate(log.date),
      date: formatLocalDate(log.date),
      check_in_time: formatLocalTime(log.check_in_time),
      check_out_time: formatLocalTime(log.check_out_time),
    }));

    return {
      data: logsWithFormattedFields,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async checkTodayAttendance(employeeId: string) {
    const today = getTodayLocalStart();
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
    const shiftInfo = await getShiftForDateTime(employeeId, now);
    if (!shiftInfo) return null;

    const { shiftName, startTime, endTime } = shiftInfo;
    const outlet = await getEmployeeOutlet(employeeId);
    const outletData = await prisma.outlet.findUnique({ where: { id: outlet } });

    const isActive = now >= startTime && now <= endTime;
    let progressPercent = 0;
    let remainingSeconds = 0;

    if (isActive) {
      const total = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
      remainingSeconds = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
    }

    const formatTime = (date: Date) =>
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    const canCheckInNow = canCheckIn(now, startTime, endTime, 15);
    const canCheckOutNow = canCheckOut(now, endTime);

    return {
      shiftName,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      isActive,
      progressPercent: Math.round(progressPercent),
      remainingSeconds,
      outletName: outletData?.name ?? "",
      outletId: outlet,
      canCheckIn: canCheckInNow,
      canCheckOut: canCheckOutNow,
    };
  },
};

export const driverService = {
  async getAvailablePickupOrders(employeeId: string) {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift || !currentShift.isActive) {
      throw new AppError("Anda tidak berada dalam shift aktif", 403);
    }

    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance || !todayAttendance.check_in_time) {
      throw new AppError("Anda belum melakukan check-in hari ini", 403);
    }

    const tasks = await prisma.driverTask.findMany({
      where: {
        status: "available",
        driver_id: null,
      },
      include: {
        order: {
          include: {
            customer: true,
            pickup_address: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return tasks;
  },

  async getAvailableDeliveryOrders(employeeId: string) {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift || !currentShift.isActive) {
      throw new AppError("Shift tidak aktif", 403);
    }
    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) {
      throw new AppError("Belum check-in", 403);
    }

    const tasks = await prisma.driverTask.findMany({
      where: {
        task_type: "delivery",
        status: "available",
        driver_id: null,
        order: { status: "ready_for_delivery" },
      },
      include: { order: { include: { customer: true, pickup_address: true } } },
    });
    return tasks;
  },
};

export const workerService = {
  async getStationOrders(employeeId: string, stationType: "washing" | "ironing" | "packing") {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift || !currentShift.isActive) {
      throw new AppError("Shift tidak aktif", 403);
    }
    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) {
      throw new AppError("Belum check-in", 403);
    }

    let orderStatus: string;
    switch (stationType) {
      case "washing": orderStatus = "washing"; break;
      case "ironing": orderStatus = "ironing"; break;
      case "packing": orderStatus = "packing"; break;
      default: throw new AppError("Station tidak valid", 400);
    }

    const orders = await prisma.order.findMany({
      where: { status: orderStatus as any },
      include: {
        customer: true,
        order_items: { include: { laundry_item: true } },
      },
      orderBy: { created_at: "asc" },
    });
    return orders;
  },
};