import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

async function markAbsentForDate(targetDate: Date) {
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const jsDay = targetDate.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;

  const employeesWithShift = await prisma.employeeShift.findMany({
    where: {
      day_of_week: dbDay,
      is_active: true,
    },
    select: { employee_id: true, outlet_id: true },
    distinct: ['employee_id'],
  });

  const employeeIds = employeesWithShift.map(e => e.employee_id);
  if (employeeIds.length === 0) return;

  const existingAttendances = await prisma.attendance.findMany({
    where: {
      employee_id: { in: employeeIds },
      date: { gte: start, lte: end },
    },
    select: { employee_id: true },
  });
  const existingEmployeeIds = new Set(existingAttendances.map(a => a.employee_id));

  const absentEmployees = employeesWithShift.filter(
    e => !existingEmployeeIds.has(e.employee_id)
  );

  for (const emp of absentEmployees) {
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
  }
}

cron.schedule('55 23 * * *', async () => {
  const yesterday = subDays(new Date(), 1);
  await markAbsentForDate(yesterday);
  console.log(`[Cron] Marked absent for ${yesterday.toISOString()}`);
});