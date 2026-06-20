import { prisma } from '../../src/lib/prisma.js';
import { seedOutlets } from './outlets.seed.js';
import { seedShifts } from './shifts.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedCustomers, seededCustomerEmails } from './customers.seed.js';
import { seedEmployeeShifts } from './employee-shifts.seed.js';
import { seedAttendances } from './attendances.seed.js';
import { seedOrders } from './orders.seed.js';
import { seedWaitingPaymentOrders } from './waitingPayment.seed.js';
import { seedLaundryItems } from './laundryItems.seed.js';
import { seedBypassRequests } from './bypassRequests.seed.js';
import { seedDriverNotifications } from './driverNotifications.seed.js';
import { seedTaskHistory } from './taskHistory.seed.js';

export async function runAllSeeds() {
  console.log('🌱 Starting database seeding...\n');

  console.log('🗑️ Cleaning up existing data...');
  // Delete leaf-level records first (no outgoing FKs to core tables)
  await prisma.notification.deleteMany({});
  await prisma.driverTask.deleteMany({});
  await prisma.orderItemBreakdown.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.processLog.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.bypassRequest.deleteMany({});
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
  await prisma.refreshToken.deleteMany({});
  await prisma.emailToken.deleteMany({});
  await prisma.socialAccount.deleteMany({});
  console.log('✅ Data cleaned.\n');

  const outlets = await seedOutlets();
  const mainOutlet = outlets[0];

  const shifts = await seedShifts();

  const customers = await seedCustomers();

  const employees = await seedEmployees(outlets.map((o) => o.id));

  await seedEmployeeShifts(employees, shifts);

  await seedAttendances(employees, shifts);

  await seedLaundryItems();

  await seedOrders(mainOutlet, employees, customers);

  await seedBypassRequests();

  await seedTaskHistory();

  await seedDriverNotifications();

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
      await seedEmployees(outlets.map((o) => o.id));
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
      await seedBypassRequests();
      break;
    }
    case 'waiting-payment':
      await seedWaitingPaymentOrders();
      break;
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
    case 'bypass-requests':
      await seedBypassRequests();
      break;
    case 'driver-notifications':
      await seedDriverNotifications();
      break;
    case 'task-history':
      await seedTaskHistory();
      break;
    default:
      console.log(`Module ${moduleName} not recognized`);
  }
}