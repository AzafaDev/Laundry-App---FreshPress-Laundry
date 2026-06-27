// apps/api/prisma/seeds/orderDetail.seed.ts
// Seed satu order lengkap dengan semua data detail untuk testing outlet admin order detail page:
// status history, process logs (washing → ironing → packing), driver tasks (pickup + delivery),
// order items + breakdown pakaian, dan payment.

import { prisma } from '../../src/lib/prisma.js';

export async function seedOrderDetail() {
  // ── Ambil data yang sudah di-seed ─────────────────────────────────────────

  const outlet = await prisma.outlet.findFirst({ orderBy: { created_at: 'asc' } });
  if (!outlet) throw new Error('No outlet found — run full seed first');

  const outletAdmin = await prisma.employee.findUnique({ where: { email: 'outletadmin.1@freshpress.com' } });
  const driver = await prisma.employee.findUnique({ where: { email: 'driver.morning.1@freshpress.com' } });
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
  if (!primaryAddress) throw new Error('Customer primary address not found — run full seed first');

  // ── Clothing types ─────────────────────────────────────────────────────────

  const clothingTypes = await Promise.all([
    prisma.clothingType.upsert({ where: { name: 'Atasan/Baju' }, update: {}, create: { name: 'Atasan/Baju' } }),
    prisma.clothingType.upsert({ where: { name: 'Celana' }, update: {}, create: { name: 'Celana' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos' }, update: {}, create: { name: 'Kaos' } }),
    prisma.clothingType.upsert({ where: { name: 'Pakaian Dalam' }, update: {}, create: { name: 'Pakaian Dalam' } }),
    prisma.clothingType.upsert({ where: { name: 'Kaos Kaki' }, update: {}, create: { name: 'Kaos Kaki' } }),
  ]);

  // ── Laundry items ──────────────────────────────────────────────────────────

  const kiloanItem = await prisma.laundryItem.findUnique({ where: { name: 'Cuci Kiloan' } });
  const spreiBesar = await prisma.laundryItem.findUnique({ where: { name: 'Sprei Single' } });
  const sarungBantal = await prisma.laundryItem.findUnique({ where: { name: 'Sarung Bantal' } });

  if (!kiloanItem || !spreiBesar || !sarungBantal) {
    throw new Error('Laundry items not found — run seedLaundryItems first');
  }

  // ── Timestamps untuk simulasi perjalanan order ─────────────────────────────

  const now = new Date();
  const t = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

  // ── Order ──────────────────────────────────────────────────────────────────

  const INVOICE = 'INV-DETAIL-DEMO-1';

  const kiloanQty = 4.5;
  const spreiBesarQty = 2;
  const sarungBantalQty = 4;
  const deliveryFee = 10000;

  const itemsTotal =
    Number(kiloanItem.base_price) * kiloanQty +
    Number(spreiBesar.base_price) * spreiBesarQty +
    Number(sarungBantal.base_price) * sarungBantalQty;

  const totalPrice = itemsTotal + deliveryFee;

  const existingOrder = await prisma.order.findFirst({ where: { invoice_number: INVOICE } });
  if (existingOrder) {
    console.log(`⏭️  Order ${INVOICE} sudah ada, skip`);
    return existingOrder;
  }

  const order = await prisma.order.create({
    data: {
      invoice_number: INVOICE,
      customer_id: customer.id,
      outlet_id: outlet.id,
      pickup_address_id: primaryAddress.id,
      created_by_outlet_admin_id: outletAdmin.id,
      status: 'completed',
      pickup_schedule: t(22),
      total_weight_kg: kiloanQty,
      delivery_fee: deliveryFee,
      total_price: totalPrice,
      notes: 'Tolong dipisahkan pakaian putih dan berwarna',
      created_at: t(24),
    },
  });

  // ── Order items ────────────────────────────────────────────────────────────

  await prisma.orderItem.createMany({
    data: [
      {
        order_id: order.id,
        laundry_item_id: kiloanItem.id,
        quantity: kiloanQty,
        price_at_order: kiloanItem.base_price,
      },
      {
        order_id: order.id,
        laundry_item_id: spreiBesar.id,
        quantity: spreiBesarQty,
        price_at_order: spreiBesar.base_price,
      },
      {
        order_id: order.id,
        laundry_item_id: sarungBantal.id,
        quantity: sarungBantalQty,
        price_at_order: sarungBantal.base_price,
      },
    ],
  });

  // ── Order item breakdowns (rincian jenis pakaian kiloan) ───────────────────

  const breakdownData = [
    { clothing_type: clothingTypes[0], quantity: 6 },  // Atasan/Baju
    { clothing_type: clothingTypes[1], quantity: 4 },  // Celana
    { clothing_type: clothingTypes[2], quantity: 5 },  // Kaos
    { clothing_type: clothingTypes[3], quantity: 6 },  // Pakaian Dalam
    { clothing_type: clothingTypes[4], quantity: 8 },  // Kaos Kaki
  ];

  await prisma.orderItemBreakdown.createMany({
    data: breakdownData.map(({ clothing_type, quantity }) => ({
      order_id: order.id,
      clothing_type_id: clothing_type.id,
      quantity,
      created_by: outletAdmin.id,
    })),
  });

  // ── Status history (full journey) ─────────────────────────────────────────

  const statusHistory: Array<{
    old_status: string | null;
    new_status: string;
    changed_by_type: string;
    changed_by_id: string | null;
    note: string;
    created_at: Date;
  }> = [
    {
      old_status: null,
      new_status: 'waiting_pickup_driver',
      changed_by_type: 'customer',
      changed_by_id: customer.id,
      note: 'Order dibuat oleh customer',
      created_at: t(24),
    },
    {
      old_status: 'waiting_pickup_driver',
      new_status: 'laundry_to_outlet',
      changed_by_type: 'driver',
      changed_by_id: driver.id,
      note: 'Driver mengambil laundry dari customer',
      created_at: t(22),
    },
    {
      old_status: 'laundry_to_outlet',
      new_status: 'laundry_arrived_outlet',
      changed_by_type: 'driver',
      changed_by_id: driver.id,
      note: 'Laundry tiba di outlet',
      created_at: t(20),
    },
    {
      old_status: 'laundry_arrived_outlet',
      new_status: 'washing',
      changed_by_type: 'employee',
      changed_by_id: outletAdmin.id,
      note: 'Outlet admin memproses order — berat 4.5 kg, 5 jenis pakaian',
      created_at: t(19),
    },
    {
      old_status: 'washing',
      new_status: 'ironing',
      changed_by_type: 'employee',
      changed_by_id: washingWorker.id,
      note: 'Washing selesai',
      created_at: t(16),
    },
    {
      old_status: 'ironing',
      new_status: 'packing',
      changed_by_type: 'employee',
      changed_by_id: ironingWorker.id,
      note: 'Ironing selesai',
      created_at: t(12),
    },
    {
      old_status: 'packing',
      new_status: 'waiting_payment',
      changed_by_type: 'employee',
      changed_by_id: packingWorker.id,
      note: 'Packing selesai',
      created_at: t(9),
    },
    {
      old_status: 'waiting_payment',
      new_status: 'ready_for_delivery',
      changed_by_type: 'customer',
      changed_by_id: customer.id,
      note: 'Pembayaran berhasil via payment gateway',
      created_at: t(7),
    },
    {
      old_status: 'ready_for_delivery',
      new_status: 'delivery_to_customer',
      changed_by_type: 'driver',
      changed_by_id: driver.id,
      note: 'Driver berangkat mengantar laundry',
      created_at: t(4),
    },
    {
      old_status: 'delivery_to_customer',
      new_status: 'received_by_customer',
      changed_by_type: 'driver',
      changed_by_id: driver.id,
      note: 'Laundry diterima customer',
      created_at: t(2),
    },
    {
      old_status: 'received_by_customer',
      new_status: 'completed',
      changed_by_type: 'system',
      changed_by_id: null,
      note: 'Auto-confirmed setelah 24 jam',
      created_at: t(0.5),
    },
  ];

  await prisma.orderStatusHistory.createMany({
    data: statusHistory.map((h) => ({
      order_id: order.id,
      old_status: h.old_status as any,
      new_status: h.new_status as any,
      changed_by_type: h.changed_by_type,
      changed_by_id: h.changed_by_id,
      note: h.note,
      created_at: h.created_at,
    })),
  });

  // ── Driver tasks ──────────────────────────────────────────────────────────

  await prisma.driverTask.createMany({
    data: [
      {
        order_id: order.id,
        driver_id: driver.id,
        task_type: 'pickup',
        status: 'completed',
        taken_at: t(22.5),
        completed_at: t(20),
      },
      {
        order_id: order.id,
        driver_id: driver.id,
        task_type: 'delivery',
        status: 'completed',
        taken_at: t(4.5),
        completed_at: t(2),
      },
    ],
  });

  // ── Process logs (washing → ironing → packing) ────────────────────────────

  await prisma.processLog.createMany({
    data: [
      {
        order_id: order.id,
        station: 'washing',
        employee_id: washingWorker.id,
        input_items: {
          kiloan: { quantity: 4.5, unit: 'kg' },
          breakdown: breakdownData.map((b) => ({ name: b.clothing_type.name, quantity: b.quantity })),
        },
        is_bypassed: false,
        started_at: t(19),
        completed_at: t(16),
        notes: null,
      },
      {
        order_id: order.id,
        station: 'ironing',
        employee_id: ironingWorker.id,
        input_items: {
          kiloan: { quantity: 4.5, unit: 'kg' },
          breakdown: breakdownData.map((b) => ({ name: b.clothing_type.name, quantity: b.quantity })),
        },
        is_bypassed: false,
        started_at: t(15.5),
        completed_at: t(12),
        notes: null,
      },
      {
        order_id: order.id,
        station: 'packing',
        employee_id: packingWorker.id,
        input_items: {
          kiloan: { quantity: 4.5, unit: 'kg' },
          breakdown: breakdownData.map((b) => ({ name: b.clothing_type.name, quantity: b.quantity })),
        },
        is_bypassed: false,
        started_at: t(11.5),
        completed_at: t(9),
        notes: 'Dikemas dalam 2 plastik terpisah (putih & berwarna)',
      },
    ],
  });

  // ── Payment ───────────────────────────────────────────────────────────────

  await prisma.payment.create({
    data: {
      order_id: order.id,
      amount: totalPrice,
      payment_method: 'gateway',
      status: 'paid',
      paid_at: t(7),
    },
  });

  console.log(`✅ Order detail demo (${INVOICE}) seeded — total Rp ${totalPrice.toLocaleString('id-ID')}`);
  return order;
}
