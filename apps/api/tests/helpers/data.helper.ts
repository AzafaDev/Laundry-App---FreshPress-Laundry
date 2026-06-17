import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
export const testPrisma = new PrismaClient({ adapter } as any);

// ── Customer ────────────────────────────────────────────────────────────────

export async function createTestCustomer(overrides?: {
  email?: string;
  full_name?: string;
  is_verified?: boolean;
}) {
  const email = overrides?.email ?? `test-customer-${Date.now()}@freshpress-test.com`;
  return testPrisma.customer.create({
    data: {
      email,
      full_name: overrides?.full_name ?? "Test Customer",
      password_hash: await bcrypt.hash("Password123", 10),
      is_verified: overrides?.is_verified ?? true,
      is_active: true,
      phone: "08999000111",
    },
  });
}

export async function deleteTestCustomerByEmail(email: string) {
  const customer = await testPrisma.customer.findUnique({ where: { email } });
  if (!customer) return;

  await testPrisma.notification.deleteMany({ where: { user_id: customer.id, user_type: "customer" } });

  const orders = await testPrisma.order.findMany({ where: { customer_id: customer.id } });
  for (const order of orders) {
    await testPrisma.complaint.deleteMany({ where: { order_id: order.id } });
    await testPrisma.driverTask.deleteMany({ where: { order_id: order.id } });
    await testPrisma.orderStatusHistory.deleteMany({ where: { order_id: order.id } });
    await testPrisma.processLog.deleteMany({ where: { order_id: order.id } });
    await testPrisma.orderItemBreakdown.deleteMany({ where: { order_id: order.id } });
    await testPrisma.orderItem.deleteMany({ where: { order_id: order.id } });
    await testPrisma.payment.deleteMany({ where: { order_id: order.id } });
  }
  await testPrisma.order.deleteMany({ where: { customer_id: customer.id } });
  await testPrisma.customerAddress.deleteMany({ where: { customer_id: customer.id } });
  await testPrisma.customer.delete({ where: { id: customer.id } });
}

// ── Address ──────────────────────────────────────────────────────────────────

export async function createTestAddress(customerId: string, overrides?: {
  label?: string;
  is_primary?: boolean;
  latitude?: number;
  longitude?: number;
}) {
  return testPrisma.customerAddress.create({
    data: {
      customer_id: customerId,
      label: overrides?.label ?? "Rumah Test",
      address: "Jl. Merdeka No. 1, Jakarta Pusat",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Menteng",
      postal_code: "10110",
      latitude: overrides?.latitude ?? -6.2,
      longitude: overrides?.longitude ?? 106.8167,
      is_primary: overrides?.is_primary ?? false,
    },
  });
}

// ── Outlet ───────────────────────────────────────────────────────────────────

export async function createTestOutlet(overrides?: { name?: string }) {
  const name = overrides?.name ?? `Test Outlet ${Date.now()}`;
  return testPrisma.outlet.create({
    data: {
      name,
      address: "Jl. Test Outlet No. 1, Jakarta",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Menteng",
      latitude: -6.2,
      longitude: 106.8167,
      service_radius_km: 10,
      is_active: true,
    },
  });
}

export async function deleteTestOutletByName(name: string) {
  const outlet = await testPrisma.outlet.findFirst({ where: { name } });
  if (!outlet) return;
  await testPrisma.employee.updateMany({
    where: { outlet_id: outlet.id },
    data: { outlet_id: null },
  });
  await testPrisma.outlet.delete({ where: { id: outlet.id } });
}

// ── Shift ────────────────────────────────────────────────────────────────────

export async function createTestShift(overrides?: { name?: string }) {
  const name = overrides?.name ?? `Test Shift ${Date.now()}`;
  return testPrisma.workShift.create({
    data: {
      name,
      start_time: new Date("1970-01-01T08:00:00Z"),
      end_time: new Date("1970-01-01T16:00:00Z"),
      is_active: true,
    },
  });
}

export async function deleteTestShiftByName(name: string) {
  const shift = await testPrisma.workShift.findFirst({ where: { name } });
  if (!shift) return;
  await testPrisma.employeeShift.deleteMany({ where: { shift_id: shift.id } });
  await testPrisma.workShift.delete({ where: { id: shift.id } });
}

// ── LaundryItem ───────────────────────────────────────────────────────────────

export async function createTestLaundryItem(name?: string) {
  const itemName = name ?? `Test Item ${Date.now()}`;
  return testPrisma.laundryItem.create({
    data: {
      name: itemName,
      unit: "pcs",
      base_price: 5000,
      is_active: true,
    },
  });
}

export async function deleteTestLaundryItemByName(name: string) {
  const item = await testPrisma.laundryItem.findFirst({ where: { name } });
  if (item) await testPrisma.laundryItem.delete({ where: { id: item.id } });
}

// ── Employee ──────────────────────────────────────────────────────────────────

export async function createTestEmployee(overrides?: {
  email?: string;
  full_name?: string;
  role?: string;
}) {
  const email = overrides?.email ?? `test-emp-${Date.now()}@freshpress-test.com`;
  const outlet = await testPrisma.outlet.findFirst({ where: { is_active: true } });
  return testPrisma.employee.create({
    data: {
      email,
      full_name: overrides?.full_name ?? "Test Employee",
      password_hash: await bcrypt.hash("Password123", 10),
      role: (overrides?.role ?? "washing_worker") as any,
      outlet_id: outlet?.id ?? null,
      is_active: true,
      is_occupied: false,
    },
  });
}

export async function deleteTestEmployeeByEmail(email: string) {
  const employee = await testPrisma.employee.findUnique({ where: { email } });
  if (!employee) return;
  await testPrisma.attendance.deleteMany({ where: { employee_id: employee.id } });
  await testPrisma.employeeShift.deleteMany({ where: { employee_id: employee.id } });
  await testPrisma.employee.delete({ where: { id: employee.id } });
}
