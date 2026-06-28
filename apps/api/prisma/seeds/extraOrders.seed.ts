// apps/api/prisma/seeds/extraOrders.seed.ts
// 10 order tambahan dengan status history, process logs, dan driver tasks sesuai status.

import { OrderStatus } from '../../generated/prisma/client.js';
import { prisma } from '../../src/lib/prisma.js';

export async function seedExtraOrders() {
  // ── Referensi data ────────────────────────────────────────────────────────

  const outlet = await prisma.outlet.findFirst({ orderBy: { created_at: 'asc' } });
  if (!outlet) throw new Error('No outlet found — run full seed first');

  const outletAdmin   = await prisma.employee.findUnique({ where: { email: 'outletadmin.1@freshpress.com' } });
  const driver        = await prisma.employee.findUnique({ where: { email: 'driver.morning.1@freshpress.com' } });
  const washingWorker = await prisma.employee.findUnique({ where: { email: 'washing_worker.morning.1@freshpress.com' } });
  const ironingWorker = await prisma.employee.findUnique({ where: { email: 'ironing_worker.morning.1@freshpress.com' } });
  const packingWorker = await prisma.employee.findUnique({ where: { email: 'packing_worker.morning.1@freshpress.com' } });

  if (!outletAdmin || !driver || !washingWorker || !ironingWorker || !packingWorker) {
    throw new Error('Seed employees not found — run full seed first');
  }

  const customer = await prisma.customer.findFirst({ orderBy: { created_at: 'asc' } });
  if (!customer) throw new Error('No customer found — run full seed first');

  const primaryAddress = await prisma.customerAddress.findFirst({
    where: { customer_id: customer.id, is_primary: true },
  });
  if (!primaryAddress) throw new Error('Customer primary address not found');

  // ── Clothing types ────────────────────────────────────────────────────────

  const clothingTypes = await Promise.all([
    prisma.clothingType.upsert({ where: { name: 'Atasan/Baju' },   update: {}, create: { name: 'Atasan/Baju' } }),
    prisma.clothingType.upsert({ where: { name: 'Celana' },        update: {}, create: { name: 'Celana' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos' },          update: {}, create: { name: 'Kaos' } }),
    prisma.clothingType.upsert({ where: { name: 'Pakaian Dalam' }, update: {}, create: { name: 'Pakaian Dalam' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos Kaki' },     update: {}, create: { name: 'Kaos Kaki' } }),
  ]);

  // ── Laundry items ─────────────────────────────────────────────────────────

  const laundryItemNames = ['Cuci Kiloan', 'Sprei Single', 'Sarung Bantal', 'Jaket Kulit / Tebal', 'Bantal / Guling'];
  const laundryItemsRaw = await prisma.laundryItem.findMany({ where: { name: { in: laundryItemNames } } });
  const laundryItemMap  = new Map(laundryItemsRaw.map((i) => [i.name, i]));

  const kiloanItem  = laundryItemMap.get('Cuci Kiloan');
  const satuanItems = [
    laundryItemMap.get('Sprei Single'),
    laundryItemMap.get('Sarung Bantal'),
    laundryItemMap.get('Jaket Kulit / Tebal'),
    laundryItemMap.get('Bantal / Guling'),
  ].filter((i): i is NonNullable<typeof i> => !!i);

  if (!kiloanItem) throw new Error('"Cuci Kiloan" tidak ditemukan — jalankan seedLaundryItems dulu.');
  if (satuanItems.length === 0) throw new Error('Satuan items tidak ditemukan — jalankan seedLaundryItems dulu.');

  // ── Helper offset waktu ───────────────────────────────────────────────────

  const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  // ── Status history builder ────────────────────────────────────────────────

  function buildStatusHistory(status: OrderStatus) {
    const all = [
      { old: null,                     new: 'waiting_pickup_driver',  byType: 'customer',  by: customer.id,       note: 'Order dibuat oleh customer',             hoursAgo: 48 },
      { old: 'waiting_pickup_driver',  new: 'laundry_to_outlet',      byType: 'driver',    by: driver!.id,        note: 'Driver mengambil laundry dari customer',  hoursAgo: 44 },
      { old: 'laundry_to_outlet',      new: 'laundry_arrived_outlet', byType: 'driver',    by: driver!.id,        note: 'Laundry tiba di outlet',                  hoursAgo: 40 },
      { old: 'laundry_arrived_outlet', new: 'washing',                byType: 'employee',  by: outletAdmin!.id,   note: 'Outlet admin memproses order',            hoursAgo: 36 },
      { old: 'washing',                new: 'ironing',                byType: 'employee',  by: washingWorker!.id, note: 'Washing selesai',                         hoursAgo: 30 },
      { old: 'ironing',                new: 'packing',                byType: 'employee',  by: ironingWorker!.id, note: 'Ironing selesai',                         hoursAgo: 24 },
      { old: 'packing',                new: 'waiting_payment',        byType: 'employee',  by: packingWorker!.id, note: 'Packing selesai',                         hoursAgo: 18 },
      { old: 'waiting_payment',        new: 'ready_for_delivery',     byType: 'customer',  by: customer.id,       note: 'Pembayaran berhasil via payment gateway', hoursAgo: 12 },
      { old: 'ready_for_delivery',     new: 'delivery_to_customer',   byType: 'driver',    by: driver!.id,        note: 'Driver berangkat mengantar laundry',      hoursAgo: 6  },
      { old: 'delivery_to_customer',   new: 'received_by_customer',   byType: 'driver',    by: driver!.id,        note: 'Laundry diterima customer',               hoursAgo: 3  },
      { old: 'received_by_customer',   new: 'completed',              byType: 'system',    by: null,              note: 'Auto-confirmed setelah 24 jam',           hoursAgo: 1  },
    ];
    const ORDER: OrderStatus[] = [
      'waiting_pickup_driver', 'laundry_to_outlet', 'laundry_arrived_outlet',
      'washing', 'ironing', 'packing', 'waiting_payment',
      'ready_for_delivery', 'delivery_to_customer', 'received_by_customer', 'completed',
    ];
    return all.slice(0, ORDER.indexOf(status) + 1);
  }

  // ── Process log builder ───────────────────────────────────────────────────

  function buildProcessLogs(status: OrderStatus, orderId: string) {
    const logs = [
      { station: 'washing' as const, worker: washingWorker!, startedHoursAgo: 36, completedHoursAgo: 30 },
      { station: 'ironing' as const, worker: ironingWorker!, startedHoursAgo: 30, completedHoursAgo: 24 },
      { station: 'packing' as const, worker: packingWorker!, startedHoursAgo: 24, completedHoursAgo: 18 },
    ];
    const completedStations: Record<string, number> = {
      ironing: 1, packing: 2, waiting_payment: 3, ready_for_delivery: 3,
      delivery_to_customer: 3, received_by_customer: 3, completed: 3,
    };
    const count = completedStations[status] ?? 0;
    return logs.slice(0, count).map((l) => ({
      order_id: orderId,
      station: l.station,
      employee_id: l.worker.id,
      input_items: {},
      is_bypassed: false,
      started_at: h(l.startedHoursAgo),
      completed_at: h(l.completedHoursAgo),
      notes: null,
    }));
  }

  // ── Driver task builder ───────────────────────────────────────────────────
  // Setiap order punya pickup task; delivery task mulai dari ready_for_delivery.
  // Status task mengikuti progress order.

  async function seedDriverTasks(orderId: string, status: OrderStatus) {
    // Pickup task
    const pickupStatus =
      status === 'waiting_pickup_driver' ? 'available'
      : status === 'laundry_to_outlet'   ? 'in_progress'
      : 'completed';

    await prisma.driverTask.upsert({
      where: { order_id_task_type: { order_id: orderId, task_type: 'pickup' } },
      update: {},
      create: {
        order_id:     orderId,
        task_type:    'pickup',
        status:       pickupStatus,
        driver_id:    pickupStatus === 'available' ? null : driver!.id,
        taken_at:     pickupStatus !== 'available' ? h(44) : null,
        completed_at: pickupStatus === 'completed' ? h(40) : null,
      },
    });

    // Delivery task — muncul mulai dari ready_for_delivery ke atas
    const deliveryStatuses: OrderStatus[] = [
      'ready_for_delivery', 'delivery_to_customer', 'received_by_customer', 'completed',
    ];
    if (!deliveryStatuses.includes(status)) return;

    const deliveryStatus =
      status === 'ready_for_delivery'   ? 'available'
      : status === 'delivery_to_customer' ? 'in_progress'
      : 'completed';

    await prisma.driverTask.upsert({
      where: { order_id_task_type: { order_id: orderId, task_type: 'delivery' } },
      update: {},
      create: {
        order_id:     orderId,
        task_type:    'delivery',
        status:       deliveryStatus,
        driver_id:    deliveryStatus === 'available' ? null : driver!.id,
        taken_at:     deliveryStatus !== 'available' ? h(6) : null,
        completed_at: deliveryStatus === 'completed' ? h(3) : null,
      },
    });
  }

  // ── Helper createOrder ────────────────────────────────────────────────────

  async function createOrder(customerId: string, suffix: string, status: OrderStatus, weightKg: number) {
    const invoiceNumber = `INV-SEED-${suffix}`;

    const existing = await prisma.order.findFirst({
      where: { invoice_number: invoiceNumber },
      include: { order_items: true },
    });
    if (existing) {
      console.log(`⏭️  Order ${invoiceNumber} sudah ada, skip`);
      return existing;
    }

    const orderItemsData = [
      { item: kiloanItem!, quantity: weightKg },
      ...satuanItems.map((item, i) => ({ item, quantity: [3, 2, 2, 1][i] ?? 1 })),
    ];
    const itemsTotalPrice = orderItemsData.reduce(
      (sum, { item, quantity }) => sum + Number(item.base_price) * quantity, 0,
    );
    const deliveryFee = ['waiting_payment', 'ready_for_delivery', 'delivery_to_customer',
      'received_by_customer', 'completed'].includes(status) ? 10000 : 0;
    const totalPrice = itemsTotalPrice + deliveryFee;

    const order = await prisma.order.create({
      data: {
        invoice_number:  invoiceNumber,
        customer_id:     customerId,
        outlet_id:       outlet.id,
        pickup_address_id: primaryAddress.id,
        status,
        pickup_schedule: null,
        total_weight_kg: weightKg,
        delivery_fee:    deliveryFee,
        total_price:     totalPrice,
        notes:           `Seed order untuk testing ${status}`,
      },
    });

    // Order items
    await prisma.orderItem.createMany({
      data: orderItemsData.map(({ item, quantity }) => ({
        order_id:        order.id,
        laundry_item_id: item.id,
        quantity,
        price_at_order:  item.base_price,
      })),
    });

    // Status history
    const historyRows = buildStatusHistory(status);
    await prisma.orderStatusHistory.createMany({
      data: historyRows.map((row) => ({
        order_id:        order.id,
        old_status:      row.old as any,
        new_status:      row.new as any,
        changed_by_type: row.byType,
        changed_by_id:   row.by,
        note:            row.note,
        created_at:      h(row.hoursAgo),
      })),
    });

    // Process logs
    const processLogRows = buildProcessLogs(status, order.id);
    if (processLogRows.length > 0) {
      await prisma.processLog.createMany({ data: processLogRows });
    }

    // Driver tasks
    await seedDriverTasks(order.id, status);

    // Payment
    if (['waiting_payment', 'ready_for_delivery', 'delivery_to_customer',
         'received_by_customer', 'completed'].includes(status)) {
      await prisma.payment.upsert({
        where: { order_id: order.id },
        update: {},
        create: {
          order_id:       order.id,
          amount:         totalPrice,
          payment_method: 'gateway',
          status:         status === 'waiting_payment' ? 'pending' : 'paid',
          paid_at:        status !== 'waiting_payment' ? h(12) : null,
          expired_at:     status === 'waiting_payment'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : null,
        },
      });
    }

    console.log(`✅ Order ${invoiceNumber} (${status}) created`);
    return order;
  }

  // ── Helper seedBreakdown ──────────────────────────────────────────────────

  async function seedBreakdown(orderId: string) {
    const existing = await prisma.orderItemBreakdown.findFirst({ where: { order_id: orderId } });
    if (existing) return;
    await prisma.orderItemBreakdown.createMany({
      data: clothingTypes.map((ct, i) => ({
        order_id:         orderId,
        clothing_type_id: ct.id,
        quantity:         (i % 3) + 2,
        created_by:       outletAdmin!.id,
      })),
    });
  }

  // ── 10 skenario ───────────────────────────────────────────────────────────

  const statusesWithBreakdown = [
    'washing', 'ironing', 'packing', 'waiting_payment',
    'ready_for_delivery', 'delivery_to_customer', 'received_by_customer', 'completed',
  ];

  const orderScenarios: Array<{ suffix: string; status: OrderStatus; weightKg: number }> = [
    { suffix: 'EXTRA-PICKUP-1',  status: 'waiting_pickup_driver',  weightKg: 2  },
    { suffix: 'EXTRA-PICKUP-2',  status: 'waiting_pickup_driver',  weightKg: 5  },
    { suffix: 'EXTRA-TO-OUTLET', status: 'laundry_to_outlet',      weightKg: 3  },
    { suffix: 'EXTRA-ARRIVED',   status: 'laundry_arrived_outlet', weightKg: 7  },
    { suffix: 'EXTRA-WASHING',   status: 'washing',                weightKg: 4  },
    { suffix: 'EXTRA-IRONING',   status: 'ironing',                weightKg: 6  },
    { suffix: 'EXTRA-PACKING',   status: 'packing',                weightKg: 3  },
    { suffix: 'EXTRA-PAYMENT',   status: 'waiting_payment',        weightKg: 8  },
    { suffix: 'EXTRA-DELIVERY',  status: 'ready_for_delivery',     weightKg: 5  },
    { suffix: 'EXTRA-COMPLETED', status: 'completed',              weightKg: 10 },
  ];

  for (const scenario of orderScenarios) {
    const order = await createOrder(customer.id, scenario.suffix, scenario.status, scenario.weightKg);
    if (statusesWithBreakdown.includes(scenario.status)) {
      await seedBreakdown(order.id);
    }
  }

  console.log('✅ 10 extra orders seeded');
}
