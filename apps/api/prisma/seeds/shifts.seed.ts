import { prisma } from '../../src/lib/prisma.js';
import type { WorkShift } from '../../generated/prisma/index.js';

export async function seedShifts(): Promise<WorkShift[]> {
  const shiftsData = [
    { name: 'Morning', start_time: new Date(Date.UTC(1970, 0, 1, 8, 0, 0)), end_time: new Date(Date.UTC(1970, 0, 1, 16, 0, 0)), description: 'Shift pagi 08:00 - 16:00' },
    { name: 'Afternoon', start_time: new Date(Date.UTC(1970, 0, 1, 13, 0, 0)), end_time: new Date(Date.UTC(1970, 0, 1, 21, 0, 0)), description: 'Shift siang 13:00 - 21:00' },
  ];

  const shifts: WorkShift[] = [];
  for (const data of shiftsData) {
    const shift = await prisma.workShift.create({ data });
    shifts.push(shift);
  }
  console.log(`✅ Seeded ${shifts.length} shifts`);
  return shifts;
}