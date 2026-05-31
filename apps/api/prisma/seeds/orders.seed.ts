import { Employee, Outlet } from '../../generated/prisma/client.js';
import { prisma } from '../../src/lib/prisma.js';

// Seed orders untuk testing Sprint 2:
// - 2 order status waiting_pickup_driver + DriverTask available  → driver claim test
// - 1 order status washing                                        → washing worker test
// - 1 order status ironing                                        → ironing worker test
// - 1 order status packing                                        → packing worker test
// - 1 order status ready_for_delivery + DriverTask available      → driver delivery test

export async function seedOrders(outlet: Outlet, employees: Employee[]) {
  const driver = employees.find(e => e.email === 'driver.morning@freshpress.com');
  if (!driver) throw new Error('Driver seed employee not found');

  // Buat customer dummy jika belum ada
  const customer = await prisma.customer.upsert({
    where: { email: 'testcustomer@freshpress.com' },
    update: {},
    create: {
      email: 'testcustomer@freshpress.com',
      full_name: 'Test Customer',
      phone: '08111222333',
      password_hash: 'dummy',
      is_verified: true,
    },
  });

  // Buat address dummy
  const existingAddress = await prisma.customerAddress.findFirst({
    where: { customer_id: customer.id },
  });
  const address = existingAddress ?? await prisma.customerAddress.create({
    data: {
      customer_id: customer.id,
      label: 'Rumah',
      address: 'Jl. Test No. 1, Jakarta',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      latitude: -6.2,
      longitude: 106.816666,
      is_primary: true,
    },
  });

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
    suffix: string,
    status: string,
    withPickupTask = false,
    withDeliveryTask = false,
  ) {
    const invoiceNumber = `INV-SEED-${suffix}`;
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
        customer_id: customer.id,
        outlet_id: outlet.id,
        pickup_address_id: address.id,
        status: status as any,
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

  await createOrder('PICKUP-1', 'waiting_pickup_driver', true);
  await createOrder('PICKUP-2', 'waiting_pickup_driver', true);
  await createOrder('WASHING-1', 'washing');
  await createOrder('IRONING-1', 'ironing');
  await createOrder('PACKING-1', 'packing');
  await createOrder('DELIVERY-1', 'ready_for_delivery', false, true);

  console.log('✅ Sprint 2 test orders seeded');
}
