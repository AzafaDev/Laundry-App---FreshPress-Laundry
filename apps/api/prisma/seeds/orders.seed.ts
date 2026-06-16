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
  const hasDriver = employees.some(e => e.email === 'driver.morning@freshpress.com');
  if (!hasDriver) throw new Error('Driver seed employee not found');

  const outletAdmin = await prisma.employee.findFirst({ where: { email: 'outletadmin@freshpress.com' } });
  if (!outletAdmin) throw new Error('Outlet admin seed employee not found');

  const customerEmails = customers.length > 0
    ? customers.map(customer => customer.email)
    : [...seededCustomerEmails];

  const existingCustomersRaw = await prisma.customer.findMany({
    where: { email: { in: customerEmails } },
  });
  // Sort by seed order (customerEmails array), not created_at — upsert doesn't guarantee created_at order
  const existingCustomers = customerEmails
    .map(email => existingCustomersRaw.find(c => c.email === email))
    .filter((c): c is NonNullable<typeof c> => !!c);

  if (existingCustomers.length === 0) {
    throw new Error('Customer seed data is empty, run customer seed first');
  }

  const customerAddressMap = new Map<string, string>();
  for (const [index, customer] of existingCustomers.entries()) {
    const existingAddress = await prisma.customerAddress.findFirst({
      where: { customer_id: customer.id },
    });

    const addressData = {
      label: index === 0 ? 'Rumah' : 'Alamat Utama',
      address: `Jl. Customer ${index + 1} No. ${index + 10}, Jakarta`,
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      latitude: [-6.255, -6.230, -6.180, -6.210][index % 4],
      longitude: [106.850, 106.780, 106.830, 106.860][index % 4],
      is_primary: true,
    };
    const address = existingAddress
      ? await prisma.customerAddress.update({ where: { id: existingAddress.id }, data: addressData })
      : await prisma.customerAddress.create({ data: { customer_id: customer.id, ...addressData } });

    customerAddressMap.set(customer.id, address.id);
  }

  // Buat clothing types jika belum ada
  const clothingTypes = await Promise.all([
    prisma.clothingType.upsert({ where: { name: 'Baju' }, update: {}, create: { name: 'Baju' } }),
    prisma.clothingType.upsert({ where: { name: 'Celana' }, update: {}, create: { name: 'Celana' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos' }, update: {}, create: { name: 'Kaos' } }),
    prisma.clothingType.upsert({ where: { name: 'Jaket' }, update: {}, create: { name: 'Jaket' } }),
    prisma.clothingType.upsert({ where: { name: 'Selimut' }, update: {}, create: { name: 'Selimut' } }),
    prisma.clothingType.upsert({ where: { name: 'Seprei' }, update: {}, create: { name: 'Seprei' } }),
  ]);

  // Ambil laundry items dari DB (sudah di-seed oleh seedLaundryItems)
  const laundryItemNames = ['Laundry Kiloan', 'Kaos', 'Kemeja', 'Celana Panjang', 'Jaket Biasa'];
  const laundryItemsRaw = await prisma.laundryItem.findMany({
    where: { name: { in: laundryItemNames } },
  });
  const laundryItemMap = new Map(laundryItemsRaw.map((i) => [i.name, i]));

  const kiloanItem = laundryItemMap.get('Laundry Kiloan');
  const satuanItems = [
    laundryItemMap.get('Kaos'),
    laundryItemMap.get('Kemeja'),
    laundryItemMap.get('Celana Panjang'),
    laundryItemMap.get('Jaket Biasa'),
  ].filter((i): i is NonNullable<typeof i> => !!i);

  if (!kiloanItem) throw new Error('Laundry item "Laundry Kiloan" tidak ditemukan — jalankan seedLaundryItems dulu.');
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
    const pickupAddressId = customerAddressMap.get(customerId);
    if (!pickupAddressId) {
      throw new Error(`Primary address for customer ${customerId} not found`);
    }

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

    const order = await prisma.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: outlet.id,
        pickup_address_id: pickupAddressId,
        status,
        pickup_schedule: null,
        total_weight_kg: 3.5,
        total_price: itemsTotalPrice,
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

  for (const [index, scenario] of orderScenarios.entries()) {
    const customer = existingCustomers[index % existingCustomers.length];
    const order = await createOrder(customer.id, scenario.suffix, scenario.status, scenario.pickup, scenario.delivery);
    if (stationStatuses.includes(scenario.status)) {
      await seedBreakdown(order.id);
    }
  }

  console.log('✅ Sprint 2 test orders seeded');
}
