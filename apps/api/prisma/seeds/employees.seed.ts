import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from './helpers.js';
import type { Employee } from '../../generated/prisma/index.js';

const ROLE_LABELS: Record<string, string> = {
  driver: 'Driver',
  washing_worker: 'Washing Worker',
  ironing_worker: 'Ironing Worker',
  packing_worker: 'Packing Worker',
};

export async function seedEmployees(outletIds: string[]): Promise<Employee[]> {
  const defaultPassword = await hashPassword('Password123');

  // ── Admin accounts ───────────────────────────────────────────────────────
  const adminAccountsData = [
    { email: 'superadmin@freshpress.com', full_name: 'Super Admin', role: 'super_admin', outlet_id: null as string | null },
    ...outletIds.map((outletId, index) => ({
      email: `outletadmin.${index + 1}@freshpress.com`,
      full_name: `Outlet Admin - Outlet ${index + 1}`,
      role: 'outlet_admin',
      outlet_id: outletId as string | null,
    })),
  ];
  for (const data of adminAccountsData) {
    await prisma.employee.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        full_name: data.full_name,
        phone: `08100000${String(adminAccountsData.indexOf(data) + 1).padStart(3, '0')}`,
        password_hash: defaultPassword,
        role: data.role as any,
        outlet_id: data.outlet_id,
        is_active: true,
        is_occupied: false,
      },
    });
  }
  console.log(`✅ Seeded ${adminAccountsData.length} admin accounts`);

  // ── Worker/driver accounts — per outlet, per role, per shift ──────────────
  const roles = ['driver', 'washing_worker', 'ironing_worker', 'packing_worker'] as const;
  const shifts = ['Morning', 'Afternoon'] as const;

  const workersData: { email: string; full_name: string; role: string; outlet_id: string }[] = [];
  outletIds.forEach((outletId, outletIndex) => {
    const outletNumber = outletIndex + 1;
    for (const role of roles) {
      for (const shift of shifts) {
        const email = `${role}.${shift.toLowerCase()}.${outletNumber}@freshpress.com`;
        const fullName = `${ROLE_LABELS[role]} (${shift}) - Outlet ${outletNumber}`;
        workersData.push({ email, full_name: fullName, role, outlet_id: outletId });
      }
    }
  });

  const employees: Employee[] = [];
  for (const data of workersData) {
    const employee = await prisma.employee.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        full_name: data.full_name,
        phone: `08123456789${Math.floor(Math.random() * 100)}`,
        password_hash: defaultPassword,
        role: data.role as any,
        outlet_id: data.outlet_id,
        is_active: true,
        is_occupied: false,
      },
    });
    employees.push(employee);
  }

  console.log(`✅ Seeded ${employees.length} employees`);
  return employees;
}
