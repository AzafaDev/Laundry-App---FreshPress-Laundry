import { prisma } from '../../src/lib/prisma.js';

// Seed 3 order dengan status `waiting_payment` (+ Payment pending) untuk customer tertentu.
// Berguna untuk testing halaman pembayaran customer tanpa perlu menjalani seluruh alur order.
const TARGET_CUSTOMER_EMAIL = 'testcustomer@freshpress.com';

export async function seedWaitingPaymentOrders(customerEmail: string = TARGET_CUSTOMER_EMAIL) {
  const customer = await prisma.customer.findUnique({ where: { email: customerEmail } });
  if (!customer) {
    throw new Error(`Customer ${customerEmail} tidak ditemukan`);
  }
  const customerId = customer.id;

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
      address: 'Jl. Tataka Indah, Kadu, Kec. Curug, Kabupaten Tangerang',
      province: 'Banten',
      city: 'Kabupaten Tangerang',
      district: 'Curug',
      latitude: -6.229383828043414,
      longitude: 106.56748566704175,
      is_primary: true,
    },
  });

  const laundryItems = await Promise.all([
    prisma.laundryItem.upsert({
      where: { name: 'Sprei Single' },
      update: {},
      create: { name: 'Sprei Single', unit: 'pcs', base_price: 15000 },
    }),
    prisma.laundryItem.upsert({
      where: { name: 'Sarung Bantal' },
      update: {},
      create: { name: 'Sarung Bantal', unit: 'pcs', base_price: 5000 },
    }),
    prisma.laundryItem.upsert({
      where: { name: 'Bantal / Guling' },
      update: {},
      create: { name: 'Bantal / Guling', unit: 'pcs', base_price: 20000 },
    }),
  ]);

  const orderScenarios = [
    { suffix: 'WAITPAY-1', weight: 3 },
    { suffix: 'WAITPAY-2', weight: 4 },
    { suffix: 'WAITPAY-3', weight: 2.5 },
  ];

  const itemsTotalPrice = laundryItems.reduce(
    (sum, item, i) => sum + Number(item.base_price) * (i + 1),
    0,
  );

  for (const scenario of orderScenarios) {
    const invoiceNumber = `INV-SEED-${scenario.suffix}`;

    const existing = await prisma.order.findFirst({ where: { invoice_number: invoiceNumber } });
    if (existing) {
      console.log(`⏭️  Order ${invoiceNumber} sudah ada, skip`);
      continue;
    }

    const deliveryFee = 10000;
    const totalPrice = itemsTotalPrice + deliveryFee;

    const order = await prisma.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: outlet.id,
        pickup_address_id: address.id,
        status: 'waiting_payment',
        pickup_schedule: new Date(Date.now() - 60 * 60 * 1000),
        total_weight_kg: scenario.weight,
        delivery_fee: deliveryFee,
        total_price: totalPrice,
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
        amount: totalPrice,
        payment_method: 'gateway',
        status: 'pending',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Order ${invoiceNumber} (waiting_payment) created for customer ${customerId}`);
  }

  console.log('✅ Waiting-payment test orders seeded');
}
