import { prisma } from '../../src/lib/prisma.js';

// Seed 3 order dengan status `waiting_payment` (+ Payment pending) untuk customer tertentu.
// Berguna untuk testing halaman pembayaran customer tanpa perlu menjalani seluruh alur order.
const TARGET_CUSTOMER_ID = '00a25ccf-fe05-4c13-814c-082a4434b3b2';

export async function seedWaitingPaymentOrders(customerId: string = TARGET_CUSTOMER_ID) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new Error(`Customer ${customerId} tidak ditemukan`);
  }

  const outlet = await prisma.outlet.findFirst({ orderBy: { created_at: 'asc' } });
  if (!outlet) {
    throw new Error('Outlet belum tersedia, jalankan seed outlet terlebih dahulu');
  }

  const address = await prisma.customerAddress.findFirst({
    where: { customer_id: customerId },
    orderBy: { created_at: 'asc' },
  }) ?? await prisma.customerAddress.create({
    data: {
      customer_id: customerId,
      label: 'Rumah',
      address: 'Jl. Contoh No. 1, Jakarta',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      latitude: -6.2,
      longitude: 106.816666,
      is_primary: true,
    },
  });

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

  const orderScenarios = [
    { suffix: 'WAITPAY-1', weight: 3, totalPrice: 45000 },
    { suffix: 'WAITPAY-2', weight: 4, totalPrice: 60000 },
    { suffix: 'WAITPAY-3', weight: 2.5, totalPrice: 32000 },
  ];

  for (const scenario of orderScenarios) {
    const invoiceNumber = `INV-SEED-${scenario.suffix}`;

    const existing = await prisma.order.findFirst({ where: { invoice_number: invoiceNumber } });
    if (existing) {
      console.log(`⏭️  Order ${invoiceNumber} sudah ada, skip`);
      continue;
    }

    const order = await prisma.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: outlet.id,
        pickup_address_id: address.id,
        status: 'waiting_payment',
        pickup_schedule: new Date(Date.now() - 60 * 60 * 1000),
        total_weight_kg: scenario.weight,
        total_price: scenario.totalPrice,
        payment_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: `Seed order untuk testing pembayaran (${scenario.suffix})`,
      },
    });

    await prisma.orderItem.createMany({
      data: laundryItems.map((item, i) => ({
        order_id: order.id,
        laundry_item_id: item.id,
        quantity: i + 1,
        price_at_order: item.base_price,
      })),
    });

    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: scenario.totalPrice,
        payment_method: 'gateway',
        status: 'pending',
      },
    });

    console.log(`✅ Order ${invoiceNumber} (waiting_payment) created for customer ${customerId}`);
  }

  console.log('✅ Waiting-payment test orders seeded');
}
