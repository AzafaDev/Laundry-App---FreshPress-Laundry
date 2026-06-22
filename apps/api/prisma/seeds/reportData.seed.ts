import { Customer, Employee, Outlet } from '../../generated/prisma/client.js';
import { prisma } from '../../src/lib/prisma.js';
import { getRandomDateInAbsoluteRange } from './helpers.js';

const REPORT_RANGE_START = new Date('2025-01-01T00:00:00.000Z');
const reportTodayStart = new Date();
reportTodayStart.setUTCHours(0, 0, 0, 0);
const REPORT_RANGE_END = new Date(Math.min(
  new Date('2026-06-30T23:59:59.999Z').getTime(),
  reportTodayStart.getTime() - 1, // akhir hari kemarin — hari ini sengaja dikosongkan buat manual test
));

const STATIONS = ['washing', 'ironing', 'packing'] as const;
const STATION_ROLE: Record<(typeof STATIONS)[number], string> = {
  washing: 'washing_worker',
  ironing: 'ironing_worker',
  packing: 'packing_worker',
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function startOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export async function seedReportData(outlet: Outlet, employees: Employee[], customer: Customer) {
  const primaryAddress = await prisma.customerAddress.findFirst({
    where: { customer_id: customer.id, is_primary: true },
  });
  if (!primaryAddress) throw new Error('Primary customer address not found — run customer seed first');

  const kiloanItem = await prisma.laundryItem.findFirst({ where: { name: 'Cuci Kiloan' } });
  if (!kiloanItem) throw new Error('Laundry item "Cuci Kiloan" tidak ditemukan — jalankan seedLaundryItems dulu.');

  const outletEmployees = employees.filter((e) => e.outlet_id === outlet.id);
  const driversAtOutlet = outletEmployees.filter((e) => e.role === 'driver');
  const workersByStation: Record<(typeof STATIONS)[number], Employee[]> = {
    washing: outletEmployees.filter((e) => e.role === STATION_ROLE.washing),
    ironing: outletEmployees.filter((e) => e.role === STATION_ROLE.ironing),
    packing: outletEmployees.filter((e) => e.role === STATION_ROLE.packing),
  };

  if (driversAtOutlet.length === 0 || STATIONS.some((s) => workersByStation[s].length === 0)) {
    throw new Error('Worker/driver seed employees not found for outlet — run employees seed first');
  }

  const processLogsData: {
    order_id: string;
    station: (typeof STATIONS)[number];
    employee_id: string;
    input_items: object;
    started_at: Date;
    completed_at: Date;
    is_bypassed: boolean;
  }[] = [];
  const driverTasksData: {
    order_id: string;
    task_type: 'pickup' | 'delivery';
    driver_id: string;
    status: 'completed';
    taken_at: Date;
    completed_at: Date;
  }[] = [];
  const orderItemsData: { order_id: string; laundry_item_id: string; quantity: number; price_at_order: number }[] = [];
  const paymentsData: { order_id: string; amount: number; payment_method: 'gateway'; status: 'paid'; paid_at: Date }[] = [];

  let orderCount = 0;
  for (
    let day = startOfDayUTC(REPORT_RANGE_START);
    day <= REPORT_RANGE_END;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const dayStart = startOfDayUTC(day);
    const dayEnd = endOfDayUTC(day);
    const ordersToday = randomInt(1, 6);

    for (let i = 0; i < ordersToday; i++) {
      const createdAt = getRandomDateInAbsoluteRange(dayStart, dayEnd);
      const updatedAt = new Date(createdAt.getTime() + randomInt(2, 6) * 60 * 60 * 1000);
      const totalPrice = randomInt(25, 150) * 1000;

      const order = await prisma.order.create({
        data: {
          invoice_number: `INV-RPT-${outlet.id.slice(0, 8)}-${day.toISOString().slice(0, 10)}-${i + 1}`,
          customer_id: customer.id,
          outlet_id: outlet.id,
          pickup_address_id: primaryAddress.id,
          status: 'completed',
          total_weight_kg: 3.5,
          delivery_fee: 10000,
          total_price: totalPrice,
          notes: 'Seed data report',
          created_at: createdAt,
          updated_at: updatedAt,
        },
      });
      orderCount++;

      orderItemsData.push({
        order_id: order.id,
        laundry_item_id: kiloanItem.id,
        quantity: 3.5,
        price_at_order: Number(kiloanItem.base_price),
      });

      paymentsData.push({
        order_id: order.id,
        amount: totalPrice,
        payment_method: 'gateway',
        status: 'paid',
        paid_at: updatedAt,
      });

      for (const station of STATIONS) {
        const worker = pickRandom(workersByStation[station]);
        if (!worker) continue;
        const completedAt = new Date(createdAt.getTime() + randomInt(1, 5) * 60 * 60 * 1000);
        processLogsData.push({
          order_id: order.id,
          station,
          employee_id: worker.id,
          input_items: {},
          started_at: new Date(completedAt.getTime() - 30 * 60 * 1000),
          completed_at: completedAt,
          is_bypassed: false,
        });
      }

      const driver1 = pickRandom(driversAtOutlet);
      const driver2 = pickRandom(driversAtOutlet);
      if (driver1) {
        driverTasksData.push({
          order_id: order.id,
          task_type: 'pickup',
          driver_id: driver1.id,
          status: 'completed',
          taken_at: createdAt,
          completed_at: new Date(createdAt.getTime() + 30 * 60 * 1000),
        });
      }
      if (driver2) {
        driverTasksData.push({
          order_id: order.id,
          task_type: 'delivery',
          driver_id: driver2.id,
          status: 'completed',
          taken_at: updatedAt,
          completed_at: new Date(updatedAt.getTime() + 30 * 60 * 1000),
        });
      }
    }
  }

  await prisma.orderItem.createMany({ data: orderItemsData });
  await prisma.payment.createMany({ data: paymentsData });
  await prisma.processLog.createMany({ data: processLogsData });
  await prisma.driverTask.createMany({ data: driverTasksData });

  console.log(`✅ Seeded ${orderCount} report orders (Jan 2025 - Jun 2026) with payments, process logs, and driver tasks`);
}
