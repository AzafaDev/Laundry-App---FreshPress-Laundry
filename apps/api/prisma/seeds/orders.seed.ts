import { Customer, Employee, Outlet, OrderStatus } from '../../generated/prisma/client.js';
import { prisma } from '../../src/lib/prisma.js';
import { seededCustomerEmails } from './customers.seed.js';

// Seed orders untuk testing Sprint 2 & 3:
// - 2 order status waiting_pickup_driver + DriverTask available  → driver claim test
// - 2 order status washing   (WASHING-1: happy path, WASHING-2: bypass path)
// - 2 order status ironing   (IRONING-1: happy path, IRONING-2: bypass path)
// - 2 order status packing   (PACKING-1: happy path, PACKING-2: bypass path)
// - 1 order status ready_for_delivery + DriverTask available      → driver delivery test

export async function seedOrders(outlet: Outlet, employees: Employee[], customers: Customer[]) {
  const hasDriver = employees.some(e => e.email === 'driver.morning.1@freshpress.com');
  if (!hasDriver) throw new Error('Driver seed employee not found');

  const outletAdmin = await prisma.employee.findFirst({ where: { email: 'outletadmin.1@freshpress.com' } });
  if (!outletAdmin) throw new Error('Outlet admin seed employee not found');

  const customerEmail = customers[0]?.email ?? seededCustomerEmails[0];
  const customer = await prisma.customer.findUnique({ where: { email: customerEmail } });
  if (!customer) throw new Error('Customer seed data is empty, run customer seed first');

  const primaryAddress = await prisma.customerAddress.findFirst({
    where: { customer_id: customer.id, is_primary: true },
  });
  if (!primaryAddress) throw new Error('Primary customer address not found — run customer seed first');

  // Buat clothing types jika belum ada — kategori isi 1 bundel kiloan
  const clothingTypes = await Promise.all([
    prisma.clothingType.upsert({ where: { name: 'Atasan/Baju' }, update: {}, create: { name: 'Atasan/Baju' } }),
    prisma.clothingType.upsert({ where: { name: 'Celana' }, update: {}, create: { name: 'Celana' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos' }, update: {}, create: { name: 'Kaos' } }),
    prisma.clothingType.upsert({ where: { name: 'Pakaian Dalam' }, update: {}, create: { name: 'Pakaian Dalam' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos Kaki' }, update: {}, create: { name: 'Kaos Kaki' } }),
  ]);

  // Ambil laundry items dari DB (sudah di-seed oleh seedLaundryItems)
  const laundryItemNames = ['Cuci Kiloan', 'Sprei Single', 'Sarung Bantal', 'Jaket Kulit / Tebal', 'Bantal / Guling'];
  const laundryItemsRaw = await prisma.laundryItem.findMany({
    where: { name: { in: laundryItemNames } },
  });
  const laundryItemMap = new Map(laundryItemsRaw.map((i) => [i.name, i]));

  const kiloanItem = laundryItemMap.get('Cuci Kiloan');
  const satuanItems = [
    laundryItemMap.get('Sprei Single'),
    laundryItemMap.get('Sarung Bantal'),
    laundryItemMap.get('Jaket Kulit / Tebal'),
    laundryItemMap.get('Bantal / Guling'),
  ].filter((i): i is NonNullable<typeof i> => !!i);

  if (!kiloanItem) throw new Error('Laundry item "Cuci Kiloan" tidak ditemukan — jalankan seedLaundryItems dulu.');
  if (satuanItems.length === 0) throw new Error('Satuan laundry items tidak ditemukan — jalankan seedLaundryItems dulu.');

  // Helper buat order
  async function createOrder(
    customerId: string,
    suffix: string,
    status: OrderStatus,
    withPickupTask = false,
    withDeliveryTask = false,
  ) {
    const invoiceNumber = `INV-SEED-${suffix}`;
    const pickupAddressId = primaryAddress.id;

    // order_items: 1 kiloan service + 4 satuan pcs items
    const orderItemsData = [
      { item: kiloanItem, quantity: 3.5 },
      ...satuanItems.map((item, i) => ({ item, quantity: [3, 2, 2, 1][i] ?? 1 })),
    ];
    const itemsTotalPrice = orderItemsData.reduce(
      (sum, { item, quantity }) => sum + Number(item.base_price) * quantity,
      0,
    );

    const existing = await prisma.order.findFirst({
      where: { invoice_number: invoiceNumber },
      include: { order_items: true },
    });
    if (existing) {
      console.log(`⏭️  Order ${invoiceNumber} sudah ada, skip`);
      if (existing.order_items.length === 0) {
        await prisma.orderItem.createMany({
          data: orderItemsData.map(({ item, quantity }) => ({
            order_id: existing.id,
            laundry_item_id: item.id,
            quantity,
            price_at_order: item.base_price,
          })),
        });
        console.log(`✅ Order items ditambahkan ke ${invoiceNumber}`);
      }
      if (Number(existing.total_price) !== itemsTotalPrice) {
        await prisma.order.update({
          where: { id: existing.id },
          data: { total_price: itemsTotalPrice },
        });
        console.log(`✅ total_price ${invoiceNumber} disesuaikan ke ${itemsTotalPrice}`);
      }
      return existing;
    }

    const deliveryFee = ['waiting_payment', 'ready_for_delivery', 'delivery_to_customer',
      'received_by_customer', 'completed'].includes(status) ? 10000 : 0;

    const order = await prisma.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: outlet.id,
        pickup_address_id: pickupAddressId,
        status,
        pickup_schedule: null,
        total_weight_kg: 3.5,
        delivery_fee: deliveryFee,
        total_price: itemsTotalPrice + deliveryFee,
        notes: `Seed order untuk testing ${status}`,
      },
    });

    await prisma.orderItem.createMany({
      data: orderItemsData.map(({ item, quantity }) => ({
        order_id: order.id,
        laundry_item_id: item.id,
        quantity,
        price_at_order: item.base_price,
      })),
    });

    // Buat Payment record untuk semua order yang sudah melewati tahap packing
    if (['waiting_payment', 'ready_for_delivery', 'delivery_to_customer',
         'received_by_customer', 'completed'].includes(status)) {
      await prisma.payment.upsert({
        where: { order_id: order.id },
        update: {},
        create: {
          order_id: order.id,
          amount: itemsTotalPrice + deliveryFee,
          payment_method: 'gateway',
          status: status === 'waiting_payment' ? 'pending' : 'paid',
          paid_at: status !== 'waiting_payment' ? new Date() : null,
          expired_at: status === 'waiting_payment'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : null,
        },
      });
    }

    if (withPickupTask) {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: order.id, task_type: 'pickup' } },
        update: { status: 'available', driver_id: null, taken_at: null },
        create: { order_id: order.id, task_type: 'pickup', status: 'available' },
      });
    }

    if (withDeliveryTask) {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: order.id, task_type: 'delivery' } },
        update: { status: 'available', driver_id: null, taken_at: null },
        create: { order_id: order.id, task_type: 'delivery', status: 'available' },
      });
    }

    console.log(`✅ Order ${invoiceNumber} (${status}) created`);
    return order;
  }

  async function seedBreakdown(orderId: string) {
    const existing = await prisma.orderItemBreakdown.findFirst({ where: { order_id: orderId } });
    if (existing) return;

    await prisma.orderItemBreakdown.createMany({
      data: clothingTypes.map((ct, i) => ({
        order_id: orderId,
        clothing_type_id: ct.id,
        quantity: (i % 3) + 2,
        created_by: outletAdmin!.id,
      })),
    });
  }

  const stationStatuses = ['washing', 'ironing', 'packing'];

  const orderScenarios: Array<{ suffix: string; status: OrderStatus; pickup?: boolean; delivery?: boolean }> = [
    // --- waiting_pickup_driver ---
    { suffix: 'PICKUP-1', status: 'waiting_pickup_driver', pickup: true },
    { suffix: 'PICKUP-2', status: 'waiting_pickup_driver', pickup: true },
    { suffix: 'PICKUP-3', status: 'waiting_pickup_driver', pickup: true },

    // --- laundry_to_outlet ---
    { suffix: 'TO-OUTLET-1', status: 'laundry_to_outlet' },

    // --- laundry_arrived_outlet (penting: trigger ProcessOrderModal) ---
    { suffix: 'ARRIVED-1', status: 'laundry_arrived_outlet' },
    { suffix: 'ARRIVED-2', status: 'laundry_arrived_outlet' },

    // --- station processing ---
    { suffix: 'WASHING-1', status: 'washing' },   // happy path (submit sesuai)
    { suffix: 'WASHING-2', status: 'washing' },   // bypass path (submit berbeda)
    { suffix: 'IRONING-1', status: 'ironing' },   // happy path
    { suffix: 'IRONING-2', status: 'ironing' },   // bypass path
    { suffix: 'PACKING-1', status: 'packing' },   // happy path
    { suffix: 'PACKING-2', status: 'packing' },   // bypass path

    // --- waiting_payment ---
    { suffix: 'PAYMENT-1', status: 'waiting_payment' },

    // --- ready_for_delivery ---
    { suffix: 'DELIVERY-1', status: 'ready_for_delivery', delivery: true },

    // --- delivery_to_customer ---
    { suffix: 'DELIVERING-1', status: 'delivery_to_customer' },

    // --- received_by_customer ---
    { suffix: 'RECEIVED-1', status: 'received_by_customer' },

    // --- completed ---
    { suffix: 'COMPLETED-1', status: 'completed' },
    { suffix: 'COMPLETED-2', status: 'completed' },

  ];

  for (const scenario of orderScenarios) {
    const order = await createOrder(customer.id, scenario.suffix, scenario.status, scenario.pickup, scenario.delivery);
    if (stationStatuses.includes(scenario.status)) {
      await seedBreakdown(order.id);
    }
  }

  console.log('✅ Sprint 2 test orders seeded');
}
