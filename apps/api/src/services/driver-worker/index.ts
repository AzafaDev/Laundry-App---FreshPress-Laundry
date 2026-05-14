// Driver/Worker services

import { AttendanceStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { differenceInMinutes } from "date-fns";

export const attendanceService = {
  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        user_id_attendance_date: {
          user_id: userId,
          attendance_date: today,
        },
      },
    });

    if (existing && existing.check_in_time) {
      throw new Error("Sudah check-in hari ini");
    }

    const now = new Date();
    const checkInTimeString = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isLate =
      now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    const status = isLate ? AttendanceStatus.late : AttendanceStatus.on_time;

    const attendance = await prisma.attendance.upsert({
      where: {
        user_id_attendance_date: {
          user_id: userId,
          attendance_date: today,
        },
      },
      update: {
        check_in_time: checkInTimeString,
        status,
      },
      create: {
        user_id: userId,
        attendance_date: today,
        check_in_time: checkInTimeString,
        status,
      },
    });

    return attendance;
  },

  async checkOut(attendanceId: string, userId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) throw new Error("attendance record not found");
    if (attendance.user_id !== userId) throw new Error("Unauthorized");
    if (attendance.check_out_time) throw new Error("Already checked out");

    const now = new Date();
    const checkOutTimeString = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let totalHours = null;
    if (attendance.check_in_time) {
      const [inHour, inMinute] = attendance.check_in_time
        .split(":")
        .map(Number);
      const [outHour, outMinute] = checkOutTimeString.split(":").map(Number);
      const checkInDate = new Date(now);
      checkInDate.setHours(inHour, inMinute, 0);
      const checkOutData = new Date(now);
      checkOutData.setHours(outHour, outMinute, 0);
      const minutes = differenceInMinutes(checkOutData, checkInDate);
      totalHours = parseFloat((minutes / 60).toFixed());
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        check_out_time: checkOutTimeString,
        total_hours: totalHours,
      },
    });

    return updated;
  },

  async getMyattendanceLogs(
    userId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { user_id: userId };
    if (startDate) where.attendance_date = { gte: startDate };
    if (endDate)
      where.attendance_date = { ...where.attendance_date, lte: endDate };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { attendance_date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  },

  async getAttendanceReport(
    outletId: string | undefined,
    userId: string | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    page: number,
    limit: number,
  ) {
    const where: any = {};

    if (userId) {
      where.user_id = userId;
    } else if (outletId) {
      const userInOutlet = await prisma.userShift.findMany({
        where: {
          shift: { outlet_id: outletId },
          is_active: true,
        },
        select: { user_id: true },
        distinct: ["user_id"],
      });
      const userIds = userInOutlet.map((u) => u.user_id);
      where.user_id = { in: userIds };
    }

    if (startDate) where.attendance_date = { gte: startDate };
    if (endDate)
      where.attendance_date = { ...where.attendance_date, lte: endDate };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { attendance_date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async checkTodayAttendance(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.attendance.findUnique({
      where: {
        user_id_attendance_date: {
          user_id: userId,
          attendance_date: today,
        },
      },
    });
  },
};
