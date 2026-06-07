import { prisma } from '../../src/lib/prisma.js';
import { seedOutlets } from './outlets.seed.js';
import { seedShifts } from './shifts.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedCustomers, seededCustomerEmails } from './customers.seed.js';
import { seedEmployeeShifts } from './employee-shifts.seed.js';
import { seedAttendances } from './attendances.seed.js';
import { seedOrders } from './orders.seed.js';
import { seedLaundryItems } from './laundryItems.seed.js';

export async function runAllSeeds() {
  console.log('🌱 Starting database seeding...\n');

  console.log('🗑️ Cleaning up existing data...');
  // Delete leaf-level records first (no outgoing FKs to core tables)
  await prisma.notification.deleteMany({});
  await prisma.driverTask.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.processLog.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customerAddress.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employeeShift.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.workShift.deleteMany({});
  await prisma.laundryItem.deleteMany({});
  await prisma.outlet.deleteMany({});
  await prisma.$transaction(async tx => {
    // Order-related child tables first
    await tx.notification.deleteMany({});
    await tx.activityLog.deleteMany({});
    await tx.complaint.deleteMany({});
    await tx.payment.deleteMany({});
    await tx.driverTask.deleteMany({});
    await tx.processLog.deleteMany({});
    await tx.bypassRequest.deleteMany({});
    await tx.orderStatusHistory.deleteMany({});
    await tx.orderItemBreakdown.deleteMany({});
    await tx.orderItem.deleteMany({});
    await tx.order.deleteMany({});

    // Employee/customer auth dependencies
    await tx.attendance.deleteMany({});
    await tx.employeeShift.deleteMany({});
    await tx.passwordResetToken.deleteMany({});
    await tx.refreshToken.deleteMany({});
    await tx.emailToken.deleteMany({});
    await tx.socialAccount.deleteMany({});

    // Parent tables
    await tx.customerAddress.deleteMany({});
    await tx.customer.deleteMany({});
    await tx.employee.deleteMany({});
    await tx.workShift.deleteMany({});
    await tx.outlet.deleteMany({});
  });
  console.log('✅ Data cleaned.\n');

  const outlets = await seedOutlets();
  const mainOutlet = outlets[0];

  const shifts = await seedShifts();

  const customers = await seedCustomers();

  const employees = await seedEmployees(mainOutlet.id);

  await seedEmployeeShifts(employees, shifts, mainOutlet.id);

  await seedAttendances(employees, shifts);

  await seedLaundryItems();

  await seedOrders(mainOutlet, employees, customers);

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
      const outletList = await prisma.outlet.findMany({ take: 1, orderBy: { created_at: 'asc' } });
      const empList = await prisma.employee.findMany();
      let customerList = await prisma.customer.findMany({
        where: { email: { in: [...seededCustomerEmails] } },
      });

      if (customerList.length === 0) {
        customerList = await seedCustomers();
      }

      if (!outletList[0]) { console.log('Run full seed first'); break; }

      await prisma.$transaction(async (tx) => {
        console.log('🗑️ Cleaning up existing order & bypass data...');
        await tx.bypassRequest.deleteMany({});
        await tx.driverTask.deleteMany({});
        await tx.processLog.deleteMany({});
        await tx.orderStatusHistory.deleteMany({});
        await tx.orderItemBreakdown.deleteMany({});
        await tx.orderItem.deleteMany({});
        await tx.order.deleteMany({});
        console.log('✅ Order & bypass data cleaned.\n');
      });

      await seedOrders(outletList[0], empList, customerList);
      break;
    }
    case 'attendances': {
      const employees = await prisma.employee.findMany();
      const shifts = await prisma.workShift.findMany();
      if (employees.length === 0) throw new Error('No employees found — run full seed first');
      if (shifts.length === 0) throw new Error('No shifts found — run full seed first');
      await prisma.$transaction(async (tx) => {
        console.log('🗑️ Cleaning up existing attendance data...');
        await tx.attendance.deleteMany({});
        console.log('✅ Attendance data cleaned.\n');
        await seedAttendances(employees, shifts, tx as any);
      });
      break;
    }
    case 'laundry-items':
      await seedLaundryItems();
      break;
    default:
      console.log(`Module ${moduleName} not recognized`);
  }
}