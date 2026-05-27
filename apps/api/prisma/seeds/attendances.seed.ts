import { prisma } from '../../src/lib/prisma.js';
import { getRandomDateInRange } from './helpers.js';
import type { Employee, WorkShift } from '@prisma/client';

function generateAttendanceTimes(
  shift: WorkShift,
  date: Date,
  status: 'on_time' | 'late' | 'absent'
) {
  if (status === 'absent') return { check_in_time: null, check_out_time: null };

  const startTime = shift.start_time;
  const endTime = shift.end_time;
  const isOvernight = endTime.getHours() < startTime.getHours();

  const checkIn = new Date(date);
  checkIn.setUTCHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0);

  const checkOut = new Date(date);
  if (isOvernight) {
    checkOut.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);
    checkOut.setUTCDate(checkOut.getUTCDate() + 1);
  } else {
    checkOut.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);
  }

  if (status === 'late') {
    const lateMinutes = Math.floor(Math.random() * 25) + 5;
    checkIn.setUTCMinutes(checkIn.getUTCMinutes() + lateMinutes);
  }

  return { check_in_time: checkIn, check_out_time: checkOut };
}

export async function seedAttendances(employees: Employee[], shifts: WorkShift[]) {
  const shiftMap: Record<string, WorkShift> = {};
  for (const s of shifts) shiftMap[s.name] = s;

  for (const emp of employees) {
    let shiftName = 'Morning';
    if (emp.email.includes('afternoon') || 
        emp.email === 'washing.worker@freshpress.com' ||
        emp.email === 'ironing.worker@freshpress.com' ||
        emp.email === 'packing.worker@freshpress.com' ||
        emp.email === 'driver@freshpress.com') {
      shiftName = 'Afternoon';
    }
    const shift = shiftMap[shiftName];

    const totalRecords = Math.floor(Math.random() * 15) + 12;
    let created = 0;
    for (let i = 0; i < totalRecords; i++) {
      const randomDate = getRandomDateInRange(90, 0);
      const dayOfWeek = randomDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const statusRand = Math.random();
      let status: 'on_time' | 'late' | 'absent';
      if (statusRand < 0.7) status = 'on_time';
      else if (statusRand < 0.9) status = 'late';
      else status = 'absent';

      if (status === 'absent') continue;

      const { check_in_time, check_out_time } = generateAttendanceTimes(shift, randomDate, status);
      await prisma.attendance.upsert({
        where: {
          employee_id_date: {
            employee_id: emp.id,
            date: randomDate,
          },
        },
        update: {},
        create: {
          employee_id: emp.id,
          outlet_id: emp.outlet_id!,
          date: randomDate,
          check_in_time,
          check_out_time,
          check_in_latitude: -6.2,
          check_in_longitude: 106.816666,
          status: status === 'on_time' ? 'on_time' : status === 'late' ? 'late' : 'absent',
          is_late: status === 'late',
        },
      });
      created++;
    }
    console.log(`✅ ${emp.full_name} - ${created} attendance records`);
  }
}