import { prisma } from '../../src/lib/prisma.js';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function getTodayWIB(): Date {
  const now = new Date();
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
}

export async function seedTodayAbsent() {
  const today = getTodayWIB();

  const employees = await prisma.employee.findMany({
    where: {
      role: { in: ['driver', 'washing_worker', 'ironing_worker', 'packing_worker'] },
      outlet_id: { not: null },
      deleted_at: null,
      is_active: true,
    },
    select: { id: true, outlet_id: true, full_name: true },
  });

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    if (!emp.outlet_id) continue;

    const existing = await prisma.attendance.findUnique({
      where: { employee_id_date: { employee_id: emp.id, date: today } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.attendance.create({
      data: {
        employee_id: emp.id,
        outlet_id: emp.outlet_id,
        date: today,
        status: 'absent',
        is_late: false,
        late_minutes: 0,
        check_in_time: null,
        check_out_time: null,
      },
    });
    created++;
    console.log(`✅ absent — ${emp.full_name}`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (already has record today)`);
}
