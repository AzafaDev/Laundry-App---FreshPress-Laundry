import { prisma } from '../../src/lib/prisma.js';
import { seedOutlets } from './outlets.seed.js';
import { seedShifts } from './shifts.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedEmployeeShifts } from './employee-shifts.seed.js';
import { seedAttendances } from './attendances.seed.js';

export async function runAllSeeds() {
  console.log('🌱 Starting database seeding...\n');

  console.log('🗑️ Cleaning up existing data...');
  try {
    await prisma.attendance.deleteMany({});
    await prisma.employeeShift.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.workShift.deleteMany({});
    await prisma.outlet.deleteMany({});
    console.log('✅ Data cleaned.\n');
  } catch (e) {
    console.log('⚠️ Cleanup skipped or partial.\n');
  }

  const outlets = await seedOutlets();
  const mainOutlet = outlets[0];

  const shifts = await seedShifts();

  const employees = await seedEmployees(mainOutlet.id);

  await seedEmployeeShifts(employees, shifts, mainOutlet.id);

  await seedAttendances(employees, shifts);

  console.log('\n✅ All seeds completed successfully');
}

export async function runModuleSeed(moduleName: string) {
  switch (moduleName) {
    case 'outlets':
      await seedOutlets();
      break;
    case 'shifts':
      await seedShifts();
      break;
    case 'employees':
      const outlets = await seedOutlets();
      await seedEmployees(outlets[0].id);
      break;
    default:
      console.log(`Module ${moduleName} not recognized`);
  }
}