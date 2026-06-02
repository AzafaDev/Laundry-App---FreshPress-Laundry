import { Customer, Employee, Outlet, OrderStatus } from '../../generated/prisma/client.js';
import { prisma } from '../../src/lib/prisma.js';
import { seededCustomerEmails } from './customers.seed.js';

// Seed orders untuk testing Sprint 2:
// - 2 order status waiting_pickup_driver + DriverTask available  → driver claim test
// - 1 order status washing                                        → washing worker test
// - 1 order status ironing                                        → ironing worker test
// - 1 order status packing                                        → packing worker test
// - 1 order status ready_for_delivery + DriverTask available      → driver delivery test

export async function seedOrders(outlet: Outlet, employees: Employee[], customers: Customer[]) {
  const hasDriver = employees.some(e => e.email === 'driver.morning@freshpress.com');
  if (!hasDriver) throw new Error('Driver seed employee not found');

  const customerEmails = customers.length > 0
    ? customers.map(customer => customer.email)
    : [...seededCustomerEmails];

  const existingCustomers = await prisma.customer.findMany({
    where: { email: { in: customerEmails } },
    orderBy: { created_at: 'asc' },
  });

  if (existingCustomers.length === 0) {
    throw new Error('Customer seed data is empty, run customer seed first');
  }

  const customerAddressMap = new Map<string, string>();
  for (const [index, customer] of existingCustomers.entries()) {
    const existingAddress = await prisma.customerAddress.findFirst({
      where: { customer_id: customer.id },
    });

    const address = existingAddress ?? await prisma.customerAddress.create({
      data: {
        customer_id: customer.id,
        label: index === 0 ? 'Rumah' : 'Alamat Utama',
        address: `Jl. Customer ${index + 1} No. ${index + 10}, Jakarta`,
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        latitude: -6.2 + index * 0.005,
        longitude: 106.816666 + index * 0.005,
        is_primary: true,
      },
    });

    customerAddressMap.set(customer.id, address.id);
  }

  // Buat laundry items dummy jika belum ada
  const laundryItems = await Promise.all([
    prisma.laundryItem.upsert({
      where: { name: 'Kaos' },
      update: {},
      create: { name: 'Kaos', unit: 'pcs', base_price: 5000 },
    }),
    prisma.laundryItem.upsert({
      where: { name: 'Celana Panjang' },
      update: {},
      create: { name: 'Celana Panjang', unit: 'pcs', base_price: 8000 },
    }),
    prisma.laundryItem.upsert({
      where: { name: 'Seprei' },
      update: {},
      create: { name: 'Seprei', unit: 'pcs', base_price: 15000 },
    }),
  ]);

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

    const existing = await prisma.order.findFirst({
      where: { invoice_number: invoiceNumber },
      include: { order_items: true },
    });
    if (existing) {
      console.log(`⏭️  Order ${invoiceNumber} sudah ada, skip`);
      // Tambahkan items jika belum ada (untuk order yang sudah di-seed sebelumnya)
      if (existing.order_items.length === 0) {
        await prisma.orderItem.createMany({
          data: laundryItems.map((item, i) => ({
            order_id: existing.id,
            laundry_item_id: item.id,
            quantity: i + 2,
            price_at_order: item.base_price,
          })),
        });
        console.log(`✅ Order items ditambahkan ke ${invoiceNumber}`);
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
        pickup_schedule: new Date(),
        total_weight_kg: 3.5,
        total_price: 35000,
        notes: `Seed order untuk testing ${status}`,
      },
    });

    await prisma.orderItem.createMany({
      data: laundryItems.map((item, i) => ({
        order_id: order.id,
        laundry_item_id: item.id,
        quantity: i + 2,
        price_at_order: item.base_price,
      })),
    });

    if (withPickupTask) {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: order.id, task_type: 'pickup' } },
        update: {},
        create: {
          order_id: order.id,
          task_type: 'pickup',
          status: 'available',
        },
      });
    }

    if (withDeliveryTask) {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: order.id, task_type: 'delivery' } },
        update: {},
        create: {
          order_id: order.id,
          task_type: 'delivery',
          status: 'available',
        },
      });
    }

    console.log(`✅ Order ${invoiceNumber} (${status}) created`);
    return order;
  }

  const orderScenarios: Array<{ suffix: string; status: OrderStatus; pickup?: boolean; delivery?: boolean }> = [
    { suffix: 'PICKUP-1', status: 'waiting_pickup_driver', pickup: true },
    { suffix: 'PICKUP-2', status: 'waiting_pickup_driver', pickup: true },
    { suffix: 'WASHING-1', status: 'washing' },
    { suffix: 'IRONING-1', status: 'ironing' },
    { suffix: 'PACKING-1', status: 'packing' },
    { suffix: 'DELIVERY-1', status: 'ready_for_delivery', delivery: true },
  ];

  for (const [index, scenario] of orderScenarios.entries()) {
    const customer = existingCustomers[index % existingCustomers.length];
    await createOrder(customer.id, scenario.suffix, scenario.status, scenario.pickup, scenario.delivery);
  }

  console.log('✅ Sprint 2 test orders seeded');
}
