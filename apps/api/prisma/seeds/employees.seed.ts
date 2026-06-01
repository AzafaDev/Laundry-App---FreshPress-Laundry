import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from './helpers.js';
import type { Employee } from '../../generated/prisma/index.js';

export async function seedEmployees(outletId: string): Promise<Employee[]> {
  const defaultPassword = await hashPassword('Password123');

  // ── Admin accounts ───────────────────────────────────────────────────────
  const adminAccountsData = [
    { email: 'superadmin@freshpress.com', full_name: 'Super Admin', role: 'super_admin', outlet_id: null as string | null },
    { email: 'outletadmin@freshpress.com', full_name: 'Outlet Admin Demo', role: 'outlet_admin', outlet_id: outletId },
  ];
  for (const data of adminAccountsData) {
    await prisma.employee.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        full_name: data.full_name,
        phone: null,
        password_hash: defaultPassword,
        role: data.role as any,
        outlet_id: data.outlet_id,
        is_active: true,
        is_occupied: false,
      },
    });
  }
  console.log(`✅ Seeded ${adminAccountsData.length} admin accounts`);

  const coreEmployeesData = [
    { email: 'washing.worker@freshpress.com', full_name: 'Joko Washing', role: 'washing_worker' },
    { email: 'ironing.worker@freshpress.com', full_name: 'Susi Ironing', role: 'ironing_worker' },
    { email: 'packing.worker@freshpress.com', full_name: 'Agus Packing', role: 'packing_worker' },
    { email: 'driver@freshpress.com', full_name: 'Bambang Driver', role: 'driver' },
  ];

  const roles = ['driver', 'washing_worker', 'ironing_worker', 'packing_worker'] as const;
  const shifts = ['Morning', 'Afternoon'] as const;
  const testEmployeesData = [];
  for (const role of roles) {
    for (const shift of shifts) {
      const email = `${role}.${shift.toLowerCase()}@freshpress.com`;
      const fullName = `${role === 'driver' ? 'Driver' : role === 'washing_worker' ? 'Washing Worker' : role === 'ironing_worker' ? 'Ironing Worker' : 'Packing Worker'} (${shift})`;
      testEmployeesData.push({ email, full_name: fullName, role });
    }
  }

  const demoAccountsData = [
    { email: 'driver.morning@freshpress.com', full_name: 'Driver Demo (Morning)', role: 'driver' },
    { email: 'washing_worker.morning@freshpress.com', full_name: 'Washing Worker Demo (Morning)', role: 'washing_worker' },
    { email: 'ironing_worker.morning@freshpress.com', full_name: 'Ironing Worker Demo (Morning)', role: 'ironing_worker' },
    { email: 'packing_worker.morning@freshpress.com', full_name: 'Packing Worker Demo (Morning)', role: 'packing_worker' },
  ];

  const allEmployeesData = [...coreEmployeesData, ...testEmployeesData, ...demoAccountsData];
  const employees: Employee[] = [];

  for (const data of allEmployeesData) {
    const employee = await prisma.employee.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        full_name: data.full_name,
        phone: `08123456789${Math.floor(Math.random() * 100)}`,
        password_hash: defaultPassword,
        role: data.role as any,
        outlet_id: outletId,
        is_active: true,
        is_occupied: false,
      },
    });
    employees.push(employee);
  }

  console.log(`✅ Seeded ${employees.length} employees`);
  return employees;
}