import { prisma } from '../../src/lib/prisma.js';
import type { Employee, WorkShift } from '../../generated/prisma/index.js';

export async function seedEmployeeShifts(
  employees: Employee[],
  shifts: WorkShift[],
  outletId: string
) {
  const shiftMap: Record<string, WorkShift> = {};
  for (const s of shifts) shiftMap[s.name] = s;

  const coreEmails = [
    'washing.worker@freshpress.com',
    'ironing.worker@freshpress.com',
    'packing.worker@freshpress.com',
    'driver@freshpress.com',
  ];
  const coreEmployees = employees.filter(e => coreEmails.includes(e.email));
  for (const emp of coreEmployees) {
    for (let day = 1; day <= 5; day++) {
      await prisma.employeeShift.upsert({
        where: {
          employee_id_shift_id_day_of_week: {
            employee_id: emp.id,
            shift_id: shiftMap.Afternoon.id,
            day_of_week: day,
          },
        },
        update: {},
        create: {
          employee_id: emp.id,
          shift_id: shiftMap.Afternoon.id,
          outlet_id: outletId,
          day_of_week: day,
          is_active: true,
        },
      });
    }
  }

  for (const emp of employees) {
    if (coreEmails.includes(emp.email)) continue;
    let shiftName: string;
    if (emp.email.includes('.morning@') || emp.email.includes('driver.morning@')) {
      shiftName = 'Morning';
    } else if (emp.email.includes('.afternoon@')) {
      shiftName = 'Afternoon';
    } else {
      shiftName = 'Morning';
    }
    const shiftId = shiftMap[shiftName].id;
    for (let day = 1; day <= 5; day++) {
      await prisma.employeeShift.upsert({
        where: {
          employee_id_shift_id_day_of_week: {
            employee_id: emp.id,
            shift_id: shiftId,
            day_of_week: day,
          },
        },
        update: {},
        create: {
          employee_id: emp.id,
          shift_id: shiftId,
          outlet_id: outletId,
          day_of_week: day,
          is_active: true,
        },
      });
    }
  }

  console.log(`✅ Seeded employee shifts for ${employees.length} employees`);
}