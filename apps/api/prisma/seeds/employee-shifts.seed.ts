import { prisma } from '../../src/lib/prisma.js';
import type { Employee, WorkShift } from '../../generated/prisma/index.js';

export async function seedEmployeeShifts(
  employees: Employee[],
  shifts: WorkShift[],
) {
  const shiftMap: Record<string, WorkShift> = {};
  for (const s of shifts) shiftMap[s.name] = s;

  for (const emp of employees) {
    if (!emp.outlet_id) continue;
    if (emp.role === 'super_admin' || emp.role === 'outlet_admin') continue;

    const shiftName = emp.email.includes('.morning.')
      ? 'Morning'
      : emp.email.includes('.afternoon.')
        ? 'Afternoon'
        : null;
    if (!shiftName) continue;

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
          outlet_id: emp.outlet_id,
          day_of_week: day,
          is_active: true,
        },
      });
    }
  }

  console.log(`✅ Seeded employee shifts for ${employees.length} employees`);
}
