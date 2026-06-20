import { prisma } from '../../src/lib/prisma.js';

export async function seedTaskHistory() {
  const driver = await prisma.employee.findUnique({ where: { email: 'driver.morning.1@freshpress.com' } });
  const washingWorker = await prisma.employee.findUnique({ where: { email: 'washing_worker.morning.1@freshpress.com' } });
  const ironingWorker = await prisma.employee.findUnique({ where: { email: 'ironing_worker.morning.1@freshpress.com' } });
  const packingWorker = await prisma.employee.findUnique({ where: { email: 'packing_worker.morning.1@freshpress.com' } });

  if (!driver || !washingWorker || !ironingWorker || !packingWorker) {
    throw new Error('Seed employees not found — run full seed first');
  }

  const completedOrders = await prisma.order.findMany({
    where: { invoice_number: { in: ['INV-SEED-COMPLETED-1', 'INV-SEED-COMPLETED-2', 'INV-SEED-RECEIVED-1'] } },
  });

  if (completedOrders.length === 0) {
    throw new Error('Completed seed orders not found — run orders seed first');
  }

  const [order1, order2, order3] = completedOrders;

  // ── Driver task history ────────────────────────────────────────────
  const driverTasks = [
    {
      order_id: order1.id,
      task_type: 'pickup' as const,
      driver_id: driver.id,
      status: 'completed' as const,
      taken_at: new Date(Date.now() - 1000 * 60 * 60 * 3),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
    },
    {
      order_id: order2.id,
      task_type: 'delivery' as const,
      driver_id: driver.id,
      status: 'completed' as const,
      taken_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    ...(order3 ? [{
      order_id: order3.id,
      task_type: 'pickup' as const,
      driver_id: driver.id,
      status: 'completed' as const,
      taken_at: new Date(Date.now() - 1000 * 60 * 60 * 8),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 7),
    }] : []),
  ];

  for (const task of driverTasks) {
    await prisma.driverTask.upsert({
      where: { order_id_task_type: { order_id: task.order_id, task_type: task.task_type } },
      update: { driver_id: task.driver_id, status: task.status, taken_at: task.taken_at, completed_at: task.completed_at },
      create: task,
    });
  }

  console.log(`✅ Seeded ${driverTasks.length} completed driver tasks`);

  // ── Worker ProcessLog history ──────────────────────────────────────
  const processLogs = [
    {
      order_id: order1.id,
      station: 'washing' as const,
      employee_id: washingWorker.id,
      input_items: {},
      started_at: new Date(Date.now() - 1000 * 60 * 60 * 10),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 9.5),
      is_bypassed: false,
    },
    {
      order_id: order1.id,
      station: 'ironing' as const,
      employee_id: ironingWorker.id,
      input_items: {},
      started_at: new Date(Date.now() - 1000 * 60 * 60 * 9),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 8.5),
      is_bypassed: false,
    },
    {
      order_id: order1.id,
      station: 'packing' as const,
      employee_id: packingWorker.id,
      input_items: {},
      started_at: new Date(Date.now() - 1000 * 60 * 60 * 8),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 7.5),
      is_bypassed: false,
    },
    ...(order2 ? [
      {
        order_id: order2.id,
        station: 'washing' as const,
        employee_id: washingWorker.id,
        input_items: {},
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 6),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 5.5),
        is_bypassed: true,
      },
      {
        order_id: order2.id,
        station: 'ironing' as const,
        employee_id: ironingWorker.id,
        input_items: {},
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 4.5),
        is_bypassed: false,
      },
      {
        order_id: order2.id,
        station: 'packing' as const,
        employee_id: packingWorker.id,
        input_items: {},
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 4),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
        is_bypassed: false,
      },
    ] : []),
  ];

  for (const log of processLogs) {
    await prisma.processLog.upsert({
      where: { order_id_station: { order_id: log.order_id, station: log.station } },
      update: { employee_id: log.employee_id, started_at: log.started_at, completed_at: log.completed_at, is_bypassed: log.is_bypassed },
      create: log,
    });
  }

  console.log(`✅ Seeded ${processLogs.length} completed worker process logs`);
}
