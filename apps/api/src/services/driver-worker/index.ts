import { AttendanceStatus } from '../../../generated/prisma/enums.js';
import { prisma } from '../../lib/prisma.js';
import { differenceInMinutes, setHours, setMinutes, isBefore } from 'date-fns';
import { AppError } from '../../middlewares/error.middleware.js';
import { SHIFT_START_HOUR, SHIFT_START_MINUTE, LATE_THRESHOLD_MINUTES, DEFAULT_TIMEZONE } from '../../config/constants.js';

export const attendanceService = {
  /**
   * Check-in user for today.
   * - Only one check-in per day.
   * - Status 'on_time' if before 08:30, else 'late'.
   */
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
      throw new AppError('Anda sudah melakukan check-in hari ini', 400);
    }

    const now = new Date();
    const checkInTimeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Determine if late
    const shiftStart = setHours(setMinutes(now, SHIFT_START_MINUTE), SHIFT_START_HOUR);
    const lateThreshold = setHours(setMinutes(now, SHIFT_START_MINUTE + LATE_THRESHOLD_MINUTES), SHIFT_START_HOUR);
    const isLate = isBefore(lateThreshold, now); // if now > 08:30

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

  /**
   * Check-out for a given attendance record.
   * - Must exist and belong to user.
   * - Calculate total hours based on check-in and check-out.
   */
  async checkOut(attendanceId: string, userId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new AppError('Record absensi tidak ditemukan', 404);
    }
    if (attendance.user_id !== userId) {
      throw new AppError('Anda tidak memiliki akses ke absensi ini', 403);
    }
    if (attendance.check_out_time) {
      throw new AppError('Anda sudah check-out hari ini', 400);
    }

    const now = new Date();
    const checkOutTimeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let totalHours = null;
    if (attendance.check_in_time) {
      const [inHour, inMinute] = attendance.check_in_time.split(':').map(Number);
      const [outHour, outMinute] = checkOutTimeString.split(':').map(Number);

      const checkInDate = new Date(now);
      checkInDate.setHours(inHour, inMinute, 0);
      const checkOutDate = new Date(now);
      checkOutDate.setHours(outHour, outMinute, 0);

      const minutesDiff = differenceInMinutes(checkOutDate, checkInDate);
      totalHours = parseFloat((minutesDiff / 60).toFixed(2));
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

  /**
   * Get attendance logs for the authenticated user (driver/worker).
   * Supports pagination and date range filter.
   */
  async getMyAttendanceLogs(
    userId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { user_id: userId };
    if (startDate) where.attendance_date = { gte: startDate };
    if (endDate) where.attendance_date = { ...where.attendance_date, lte: endDate };

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { attendance_date: 'desc' },
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

  /**
   * Get attendance report for admin (filter by outlet, user, date range).
   */
  async getAttendanceReport(
    outletId: string | undefined,
    userId: string | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    page: number,
    limit: number,
  ) {
    const where: any = {};

    // If userId provided, filter directly
    if (userId) {
      where.user_id = userId;
    } 
    // Else if outletId provided, get all users assigned to that outlet (via UserShift, active shift)
    else if (outletId) {
      const userShifts = await prisma.userShift.findMany({
        where: {
          shift: { outlet_id: outletId },
          is_active: true,
        },
        select: { user_id: true },
        distinct: ['user_id'],
      });
      const userIds = userShifts.map(us => us.user_id);
      where.user_id = { in: userIds };
    }

    if (startDate) where.attendance_date = { gte: startDate };
    if (endDate) where.attendance_date = { ...where.attendance_date, lte: endDate };

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
              user_shifts: {
                where: { is_active: true },
                include: {
                  shift: {
                    select: {
                      name: true,
                      outlet: { select: { name: true, id: true } }
                    }
                  }
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { attendance_date: 'desc' },
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

  /**
   * Check today's attendance for a user (returns null if not yet checked in).
   */
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

  /**
   * Get current shift for user (useful for frontend to know shift time).
   * Returns shift info based on current time and user's assigned shifts.
   */
  async getCurrentShift(userId: string) {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const userShift = await prisma.userShift.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        shift_date: {
          gte: new Date(now.setHours(0,0,0,0)),
          lt: new Date(now.setHours(23,59,59,999))
        }
      },
      include: {
        shift: true,
      },
    });

    if (!userShift) return null;

    // Check if current time is within shift start/end
    const { start_time, end_time } = userShift.shift;
    const isWithinShift = currentTime >= start_time && currentTime <= end_time;

    return {
      shiftName: userShift.shift.name,
      startTime: start_time,
      endTime: end_time,
      isActive: isWithinShift,
    };
  },
};