import { prisma as defaultPrisma } from '../../src/lib/prisma.js';
import { getRandomDateInRange } from './helpers.js';
import type { EmployeeModel, WorkShiftModel } from '../../generated/prisma/models.js';
import type { PrismaClient } from '../../generated/prisma/client.js';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function generateAttendanceTimes(
  shift: WorkShiftModel,
  date: Date,
  status: 'on_time' | 'late' | 'absent'
) {
  if (status === 'absent') return { check_in_time: null, check_out_time: null };

  const startTime = shift.start_time;
  const endTime = shift.end_time;
  const isOvernight = endTime.getUTCHours() < startTime.getUTCHours();

  // shift times use convention: UTC hour = WIB wall-clock hour, so subtract 7h for real UTC
  const checkIn = new Date(date);
  checkIn.setUTCHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0);
  const checkInUTC = new Date(checkIn.getTime() - WIB_OFFSET_MS);

  const checkOut = new Date(date);
  if (isOvernight) {
    checkOut.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);
    checkOut.setUTCDate(checkOut.getUTCDate() + 1);
  } else {
    checkOut.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);
  }
  const checkOutUTC = new Date(checkOut.getTime() - WIB_OFFSET_MS);

  if (status === 'late') {
    const lateMinutes = Math.floor(Math.random() * 25) + 5;
    checkInUTC.setUTCMinutes(checkInUTC.getUTCMinutes() + lateMinutes);
    return { check_in_time: checkInUTC, check_out_time: checkOutUTC, late_minutes: lateMinutes };
  }

  return { check_in_time: checkInUTC, check_out_time: checkOutUTC, late_minutes: 0 };
}

export async function seedAttendances(
  employees: EmployeeModel[],
  shifts: WorkShiftModel[],
  db: PrismaClient = defaultPrisma
) {
  const shiftMap: Record<string, WorkShiftModel> = {};
  for (const s of shifts) shiftMap[s.name] = s;

  for (const emp of employees) {
    if (!emp.outlet_id) continue;

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
    const records = [];
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

      const { check_in_time, check_out_time, late_minutes } = generateAttendanceTimes(shift, randomDate, status);
      records.push({
        employee_id: emp.id,
        outlet_id: emp.outlet_id,
        date: randomDate,
        check_in_time,
        check_out_time,
        check_in_latitude: -6.2,
        check_in_longitude: 106.816666,
        status: status === 'on_time' ? 'on_time' : 'late',
        is_late: status === 'late',
        late_minutes,
      });
    }

    await db.attendance.createMany({ data: records, skipDuplicates: true });
    console.log(`✅ ${emp.full_name} - ${records.length} attendance records`);
  }
}
