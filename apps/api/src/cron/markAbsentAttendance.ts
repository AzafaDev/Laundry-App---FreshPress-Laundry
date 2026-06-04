import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { subDays } from 'date-fns';
import { getNow, getEmployeeShiftForDate, getTodayLocalStart } from '../services/driver-worker/attendanceHelper.js';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

async function processEndOfDay(targetDate: Date) {
  // targetDate is a WIB midnight timestamp — use UTC fields for WIB date math
  const wib = new Date(targetDate.getTime() + WIB_OFFSET_MS);
  const start = targetDate; // WIB midnight = start of WIB day
  const end = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000 - 1);

  const jsDay = wib.getUTCDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeesWithShift = await prisma.employeeShift.findMany({
    where: {
      day_of_week: dbDay,
      is_active: true,
    },
    select: { employee_id: true, outlet_id: true },
    distinct: ['employee_id'],
  });

  if (employeesWithShift.length === 0) return;

  const employeeIds = employeesWithShift.map(e => e.employee_id);

  const attendances = await prisma.attendance.findMany({
    where: {
      employee_id: { in: employeeIds },
      date: { gte: start, lte: end },
    },
    select: { id: true, employee_id: true, check_in_time: true, check_out_time: true },
  });

  const attendanceMap = new Map(attendances.map(a => [a.employee_id, a]));

  for (const emp of employeesWithShift) {
    const attendance = attendanceMap.get(emp.employee_id);

    if (!attendance) {
      // No check-in at all — mark absent
      await prisma.attendance.upsert({
        where: { employee_id_date: { employee_id: emp.employee_id, date: targetDate } },
        update: { status: 'absent', is_late: null, notes: 'Auto-marked absent' },
        create: {
          employee_id: emp.employee_id,
          outlet_id: emp.outlet_id,
          date: targetDate,
          status: 'absent',
          notes: 'Auto-marked absent (no check-in)',
        },
      });
    } else if (attendance.check_in_time && !attendance.check_out_time) {
      // Checked in but forgot to check out — auto-checkout at shift end time
      const shift = await getEmployeeShiftForDate(emp.employee_id, targetDate);
      if (shift) {
        await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            check_out_time: shift.endTime,
            notes: 'Auto-checkout (forgot to check out)',
          },
        });
      }
    }
  }
}

// 16:55 UTC = 23:55 WIB — process previous WIB day
cron.schedule('55 16 * * *', async () => {
  const yesterday = subDays(getTodayLocalStart(), 1);
  await processEndOfDay(yesterday);
  console.log(`[Cron] Processed end-of-day for ${yesterday.toISOString()}`);
});
