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

  getShiftForDateTime,
  hasActiveDriverTask,
  getNow,
} from "./attendanceHelper.js";
import { Prisma, OrderStatus } from "../../../generated/prisma/client.js";

const DRIVER_TASK_DETAIL_SELECT = {
  id: true,
  order_id: true,
  driver_id: true,
  task_type: true,
  status: true,
  taken_at: true,
  created_at: true,
  updated_at: true,
  order: {
    select: {
      id: true,
      invoice_number: true,
      outlet_id: true,
      pickup_address: {
        select: {
          address: true,
          latitude: true,
          longitude: true,
        },
      },
      customer: {
        select: {
          full_name: true,
          phone: true,
        },
      },
    },
  },
} satisfies Prisma.DriverTaskSelect;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function toWIB(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

function formatLocalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date | null): string | null {
  if (!date) return null;
  const wib = toWIB(date);
  const hours = String(wib.getUTCHours()).padStart(2, "0");
  const minutes = String(wib.getUTCMinutes()).padStart(2, "0");
  const seconds = String(wib.getUTCSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

interface CheckInBody {
  lat?: number;
  lng?: number;
}

function mapDriverTaskToActivePayload(task: any) {
  return {
    hasActiveTask: !!task,
    task: task
      ? {
          id: task.id,
          order_id: task.order_id,
          driver_id: task.driver_id,
          task_type: task.task_type,
          status: task.status,
          taken_at: task.taken_at,
          created_at: task.created_at,
          updated_at: task.updated_at,
          order: task.order,
        }
      : null,
  };
}

const attendanceService = {
  async checkIn(employeeId: string, body?: CheckInBody) {
    const now = getNow();
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

    const shift = await getEmployeeShiftForDate(employeeId, attendance.date);
    if (!shift) {
      throw new AppError("Data shift tidak ditemukan untuk absensi ini", 400);
    }

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
      if (hasActive) {
        throw new AppError("Selesaikan task aktif sebelum check-out", 403);
      }
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

    const formatTime = (date: Date) => {
      const w = toWIB(date);
      return `${String(w.getUTCHours()).padStart(2, "0")}:${String(w.getUTCMinutes()).padStart(2, "0")}`;
    };

    const alreadyCheckedIn = !!todayAttendance?.check_in_time;
    const alreadyCheckedOut = !!todayAttendance?.check_out_time;
    const canCheckInNow = !alreadyCheckedIn && canCheckIn(now, startTime, endTime, 15);
    const canCheckOutNow = alreadyCheckedIn && !alreadyCheckedOut && now > endTime;

    return {
      shiftName,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      isActive,
      phase,
      progressPercent: Math.round(progressPercent),
      remainingSeconds,
      outletName: outletData?.name ?? "",
      outletId: outlet,
      canCheckIn: canCheckInNow,
      canCheckOut: canCheckOutNow,
      serverNow: now.toISOString(),
    };
  },

  async getCurrentShift(employeeId: string) {
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

    const formatTime = (date: Date) => {
      const w = toWIB(date);
      return `${String(w.getUTCHours()).padStart(2, "0")}:${String(w.getUTCMinutes()).padStart(2, "0")}`;
    };

    const alreadyCheckedIn = !!todayAttendance?.check_in_time;
    const alreadyCheckedOut = !!todayAttendance?.check_out_time;
    const canCheckInNow = !alreadyCheckedIn && canCheckIn(now, startTime, endTime, 15);
    const canCheckOutNow = alreadyCheckedIn && !alreadyCheckedOut && now > endTime;

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
      serverNow: now.toISOString(),
    };
  },
};

const driverService = {
  async getAvailablePickupOrders(employeeId: string) {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift || !currentShift.isActive) {
      throw new AppError("Anda tidak berada dalam shift aktif", 403);
    }

    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance || !todayAttendance.check_in_time) {
      throw new AppError("Anda belum melakukan check-in hari ini", 403);
    }
    if (todayAttendance.check_out_time) {
      throw new AppError("Anda sudah check-out hari ini, tidak dapat mengambil order baru", 403);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee?.outlet_id) throw new AppError("Outlet tidak ditemukan", 400);

    const tasks = await prisma.driverTask.findMany({
      where: {
        task_type: "pickup",
        status: "available",
        driver_id: null,
        order: { outlet_id: employee.outlet_id },
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
    if (todayAttendance.check_out_time) {
      throw new AppError("Anda sudah check-out hari ini, tidak dapat mengambil order baru", 403);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee?.outlet_id) throw new AppError("Outlet tidak ditemukan", 400);

    const tasks = await prisma.driverTask.findMany({
      where: {
        task_type: "delivery",
        status: "available",
        driver_id: null,
        order: { status: "ready_for_delivery", outlet_id: employee.outlet_id },
      },
      include: { order: { include: { customer: true, pickup_address: true } } },
    });
    return tasks;
  },

  async getActiveTask(employeeId: string) {
    const task = await prisma.driverTask.findFirst({
      where: {
        driver_id: employeeId,
        status: "in_progress",
      },
      select: DRIVER_TASK_DETAIL_SELECT,
    });
    return task;
  },

  async assertDriverEligibility(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee) {
      throw new AppError("Employee tidak ditemukan", 404);
    }
    if (!employee.outlet_id) {
      throw new AppError("Employee tidak memiliki outlet terdaftar", 400);
    }

    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift || !currentShift.isActive) {
      throw new AppError("Anda tidak berada dalam shift aktif", 403);
    }

    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance || !todayAttendance.check_in_time) {
      throw new AppError("Anda belum melakukan check-in hari ini", 403);
    }
    if (todayAttendance.check_out_time) {
      throw new AppError("Anda sudah check-out hari ini, tidak dapat mengklaim task baru", 403);
    }

    const hasActive = await hasActiveDriverTask(employeeId);
    if (hasActive) {
      throw new AppError("Anda sudah memiliki task aktif", 403);
    }

    return {
      employeeOutletId: employee.outlet_id,
      currentShift,
    };
  },

  async claimTask(employeeId: string, taskId: string) {
    const { employeeOutletId } = await this.assertDriverEligibility(employeeId);

    return await prisma.$transaction(async (tx) => {
      const task = await tx.driverTask.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          order_id: true,
          status: true,
          driver_id: true,
          order: {
            select: { outlet_id: true },
          },
        },
      });

      if (!task) {
        throw new AppError("Task tidak ditemukan", 404);
      }
      if (task.status !== "available") {
        throw new AppError("Task tidak tersedia untuk diklaim", 409);
      }
      if (task.driver_id !== null) {
        throw new AppError("Task sudah diambil driver lain", 409);
      }

      if (task.order.outlet_id !== employeeOutletId) {
        throw new AppError("Task bukan dari outlet Anda", 403);
      }

      const now = new Date();
      const updateResult = await tx.driverTask.updateMany({
        where: {
          id: taskId,
          status: "available",
          driver_id: null,
        },
        data: {
          driver_id: employeeId,
          status: "in_progress",
          taken_at: now,
        },
      });

      if (updateResult.count === 0) {
        throw new AppError("Task sudah diambil driver lain", 409);
      }

      const claimedTask = await tx.driverTask.findUnique({
        where: { id: taskId },
        select: DRIVER_TASK_DETAIL_SELECT,
      });

      if (claimedTask && claimedTask.order.outlet_id) {
        emitToRoom(`outlet:${claimedTask.order.outlet_id}`, "driver:task-claimed", {
          taskId,
          driverId: employeeId,
          order_id: claimedTask.order_id,
        });
      }

      return claimedTask;
    });
  },

  async createDeliveryTask(orderId: string) {
    const existing = await prisma.driverTask.findUnique({
      where: {
        order_id_task_type: {
          order_id: orderId,
          task_type: "delivery",
        },
      },
    });
    if (existing) return existing;

    const task = await prisma.driverTask.create({
      data: {
        order_id: orderId,
        task_type: "delivery",
        status: "available",
      },
    });
    return task;
  },

  async completeTask(employeeId: string, taskId: string) {
    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) throw new AppError("Belum check-in", 403);
    if (todayAttendance.check_out_time) throw new AppError("Sudah check-out", 403);

    const task = await prisma.driverTask.findUnique({
      where: { id: taskId },
      include: { order: { select: { id: true, outlet_id: true, customer_id: true } } },
    });

    if (!task) throw new AppError("Task tidak ditemukan", 404);
    if (task.status !== "in_progress") throw new AppError("Task tidak sedang berlangsung", 400);
    if (task.driver_id !== employeeId) throw new AppError("Anda tidak terassign ke task ini", 403);

    const updatedTask = await prisma.driverTask.update({
      where: { id: taskId },
      data: { status: "completed", completed_at: new Date() },
    });

    const orderStatusMap: Record<string, OrderStatus> = {
      pickup: "laundry_to_outlet",
      delivery: "received_by_customer",
    };
    const newOrderStatus = orderStatusMap[task.task_type];
    if (!newOrderStatus) throw new AppError("Invalid task type", 400);

    const oldOrderStatus = task.task_type === "pickup" ? "waiting_pickup_driver" : "delivery_to_customer";

    await prisma.order.update({
      where: { id: task.order_id },
      data: { status: newOrderStatus },
    });

    await prisma.orderStatusHistory.create({
      data: {
        order_id: task.order_id,
        old_status: oldOrderStatus,
        new_status: newOrderStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Driver completed ${task.task_type} task`,
      },
    });

    if (task.order.outlet_id) {
      emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-completed", {
        taskId: task.id,
        taskType: task.task_type,
        orderId: task.order_id,
        driverId: employeeId,
        completedAt: new Date(),
      });
    }
    if (task.order.customer_id) {
      emitToUser(task.order.customer_id, "order:status-updated", {
        orderId: task.order_id,
        status: newOrderStatus,
      });
    }

    return updatedTask;
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
    if (todayAttendance.check_out_time) {
      throw new AppError("Sudah check-out, tidak dapat memproses order", 403);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee?.outlet_id) throw new AppError("Outlet tidak ditemukan", 400);

    let orderStatus: string;
    switch (stationType) {
      case "washing": orderStatus = "washing"; break;
      case "ironing": orderStatus = "ironing"; break;
      case "packing": orderStatus = "packing"; break;
      default: throw new AppError("Station tidak valid", 400);
    }

    const orders = await prisma.order.findMany({
      where: { status: orderStatus as any, outlet_id: employee.outlet_id },
      include: {
        customer: true,
        order_items: { include: { laundry_item: true } },
        bypass_requests: {
          where: { station: stationType as any, status: "pending" },
          select: { id: true },
        },
      },
      orderBy: { created_at: "asc" },
    });
    return orders.map((o) => ({
      ...o,
      hasPendingBypass: o.bypass_requests.length > 0,
      bypass_requests: undefined,
    }));
  },

  async completeStation(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems?: { laundry_item_id: string; actual_quantity: number }[],
  ) {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift?.isActive) throw new AppError("Shift tidak aktif", 403);

    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) throw new AppError("Belum check-in", 403);
    if (todayAttendance.check_out_time) throw new AppError("Sudah check-out", 403);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee?.outlet_id) throw new AppError("Outlet tidak ditemukan", 400);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        customer: { select: { id: true, full_name: true } },
      },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== employee.outlet_id) throw new AppError("Order bukan dari outlet Anda", 403);

    const validStatus: Record<string, OrderStatus> = {
      washing: "washing",
      ironing: "ironing",
      packing: "packing",
    };
    if (order.status !== validStatus[station]) {
      throw new AppError(
        `Order sedang dalam status ${order.status}, tidak dapat diproses di station ${station}`,
        400,
      );
    }

    let finalStatus: OrderStatus;
    let shouldCreateDeliveryTask = false;

    if (station === "packing") {
      const isPaid = order.payment?.status === "paid";
      finalStatus = isPaid ? "ready_for_delivery" : "waiting_payment";
      shouldCreateDeliveryTask = isPaid;
    } else {
      const nextStatus: Record<string, OrderStatus> = {
        washing: "ironing",
        ironing: "packing",
      };
      finalStatus = nextStatus[station];
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: finalStatus },
    });

    await prisma.orderStatusHistory.create({
      data: {
        order_id: orderId,
        old_status: order.status,
        new_status: finalStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Station ${station} completed by worker`,
      },
    });

    await prisma.processLog.create({
      data: {
        order_id: orderId,
        station: station as any,
        employee_id: employeeId,
        input_items: actualItems ?? [],
        completed_at: new Date(),
      },
    });

    if (shouldCreateDeliveryTask) {
      await driverService.createDeliveryTask(orderId);
    }

    if (order.outlet_id) {
      emitToRoom(`outlet:${order.outlet_id}`, "station:order-completed", {
        orderId,
        station,
        newStatus: finalStatus,
        workerId: employeeId,
        outletId: order.outlet_id,
        timestamp: new Date(),
      });
    }
    if (order.customer?.id) {
      emitToUser(order.customer.id, "order:status-updated", {
        orderId,
        newStatus: finalStatus,
        stationName: station,
      });
    }

    return updatedOrder;
  },

  async createBypassRequest(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    discrepancyDescription: string,
    actualItemsRaw: { laundry_item_id: string; actual_quantity: number }[],
    photoUrls: string[],
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { outlet_id: true },
    });
    if (!employee?.outlet_id) throw new AppError("Outlet tidak ditemukan", 400);

    const statusForStation: Record<string, string> = {
      washing: "washing",
      ironing: "ironing",
      packing: "packing",
    };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { order_items: { include: { laundry_item: true } } },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== employee.outlet_id) throw new AppError("Order bukan dari outlet Anda", 403);
    if (order.status !== statusForStation[station]) {
      throw new AppError(`Order tidak sedang di station ${station}`, 400);
    }

    const existing = await prisma.bypassRequest.findFirst({
      where: { order_id: orderId, station: station as any, status: "pending" },
    });
    if (existing) throw new AppError("Sudah ada bypass request pending untuk order ini, tunggu review admin", 409);

    const expectedItems = order.order_items.map((item) => ({
      laundry_item_id: item.laundry_item_id,
      name: item.laundry_item.name,
      quantity: Number(item.quantity),
      unit: item.laundry_item.unit,
    }));

    const laundryItemMap = new Map(
      order.order_items.map((i) => [i.laundry_item_id, i.laundry_item]),
    );
    const actualItems = actualItemsRaw.map((a) => ({
      laundry_item_id: a.laundry_item_id,
      name: laundryItemMap.get(a.laundry_item_id)?.name ?? "",
      actual_quantity: a.actual_quantity,
      unit: laundryItemMap.get(a.laundry_item_id)?.unit ?? "",
    }));

    const bypass = await prisma.bypassRequest.create({
      data: {
        order_id: orderId,
        station: station as any,
        requested_by: employeeId,
        expected_items: expectedItems,
        actual_items: actualItems,
        discrepancy_description: discrepancyDescription,
        photo_evidence: photoUrls,
      },
    });

    emitToRoom(`outlet:${employee.outlet_id}`, "bypass:created", {
      bypassId: bypass.id,
      orderId,
      station,
      workerId: employeeId,
    });
    emitToUser(employeeId, "bypass:created", { bypassId: bypass.id, status: "pending" });

    return bypass;
  },

  async getOrderItemsForStation(orderId: string) {
    const items = await prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: { laundry_item: true },
    });

    const kiloan = items.filter((i) => i.laundry_item.unit === "kg");
    const satuan = items.filter((i) => i.laundry_item.unit !== "kg");

    return { kiloan, satuan };
  },

  async validateActualItems(
    orderId: string,
    actualItems: { laundry_item_id: string; actual_quantity: number }[],
  ) {
    const { satuan } = await this.getOrderItemsForStation(orderId);

    const discrepancies: {
      laundry_item_id: string;
      name: string;
      expected: number;
      actual: number;
    }[] = [];

    for (const item of satuan) {
      const submitted = actualItems.find((a) => a.laundry_item_id === item.laundry_item_id);
      const actual = submitted?.actual_quantity ?? 0;
      const expected = Number(item.quantity);
      if (actual !== expected) {
        discrepancies.push({
          laundry_item_id: item.laundry_item_id,
          name: item.laundry_item.name,
          expected,
          actual,
        });
      }
    }

    return { isMatch: discrepancies.length === 0, discrepancies };
  },

  async submitItems(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems: { laundry_item_id: string; actual_quantity: number }[],
  ) {
    const currentShift = await attendanceService.getCurrentShift(employeeId);
    if (!currentShift?.isActive) throw new AppError("Shift tidak aktif", 403);

    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) throw new AppError("Belum check-in", 403);
    if (todayAttendance.check_out_time) throw new AppError("Sudah check-out", 403);

    const { isMatch, discrepancies } = await this.validateActualItems(orderId, actualItems);

    if (!isMatch) {
      return { success: false as const, requiresBypass: true, discrepancies };
    }

    await prisma.$transaction(async (tx) => {
      const pendingBypass = await tx.bypassRequest.findFirst({
        where: { order_id: orderId, station: station as any, status: "pending" },
      });
      if (pendingBypass) {
        throw new AppError("Terdapat BypassRequest pending untuk order ini, tunggu review admin", 409);
      }
    });

    return await this.completeStation(employeeId, station, orderId, actualItems);
  },
};

export { attendanceService, driverService, mapDriverTaskToActivePayload };

