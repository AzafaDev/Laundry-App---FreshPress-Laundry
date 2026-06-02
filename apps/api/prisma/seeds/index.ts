import { prisma } from '../../src/lib/prisma.js';
import { seedOutlets } from './outlets.seed.js';
import { seedShifts } from './shifts.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedCustomers, seededCustomerEmails } from './customers.seed.js';
import { seedEmployeeShifts } from './employee-shifts.seed.js';
import { seedAttendances } from './attendances.seed.js';
import { seedOrders } from './orders.seed.js';

export async function runAllSeeds() {
  console.log('🌱 Starting database seeding...\n');

  console.log('🗑️ Cleaning up existing data...');
  await prisma.driverTask.deleteMany({ where: { order: { invoice_number: { startsWith: 'INV-SEED-' } } } });
  await prisma.orderItem.deleteMany({ where: { order: { invoice_number: { startsWith: 'INV-SEED-' } } } });
  await prisma.orderStatusHistory.deleteMany({ where: { order: { invoice_number: { startsWith: 'INV-SEED-' } } } });
  await prisma.order.deleteMany({ where: { invoice_number: { startsWith: 'INV-SEED-' } } });
  await prisma.customerAddress.deleteMany({ where: { customer: { email: { in: [...seededCustomerEmails] } } } });
  await prisma.customer.deleteMany({ where: { email: { in: [...seededCustomerEmails] } } });
  await prisma.attendance.deleteMany({});
  await prisma.employeeShift.deleteMany({});
  await prisma.processLog.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.workShift.deleteMany({});
  await prisma.outlet.deleteMany({});
  console.log('✅ Data cleaned.\n');

  const outlets = await seedOutlets();
  const mainOutlet = outlets[0];

  const shifts = await seedShifts();

  const customers = await seedCustomers();

  const employees = await seedEmployees(mainOutlet.id);

  await seedEmployeeShifts(employees, shifts, mainOutlet.id);

  await seedAttendances(employees, shifts);

  await seedOrders(mainOutlet, employees);

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
    case 'customers':
      await seedCustomers();
      break;
    case 'orders': {
      const outletList = await prisma.outlet.findMany({ take: 1 });
      const empList = await prisma.employee.findMany();
      if (!outletList[0]) { console.log('Run full seed first'); break; }
      await seedOrders(outletList[0], empList);
      break;
    }
    default:
      console.log(`Module ${moduleName} not recognized`);
  }
}