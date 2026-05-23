import * as bcrypt from 'bcrypt'; // atau gunakan library hash lain
import {prisma} from '../src/lib/prisma.js'

async function main() {
  console.log('🌱 Seeding database...');

  // ================================
  // 1. ENUMS (tidak perlu di-seed, sudah ada di schema)
  // ================================

  // ================================
  // 2. SUPER ADMIN (Employee)
  // ================================
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const superAdmin = await prisma.employee.upsert({
    where: { email: 'superadmin@laundry.com' },
    update: {},
    create: {
      full_name: 'Super Admin',
      email: 'superadmin@laundry.com',
      password_hash: hashedPassword,
      phone: '081234567890',
      role: 'super_admin',
      outlet_id: null, // super admin tidak terikat outlet
      is_active: true,
      is_occupied: false,
    },
  });
  console.log('✅ Super admin created:', superAdmin.email);

  // ================================
  // 3. OUTLETS
  // ================================
  const outlet1 = await prisma.outlet.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Laundry Pusat Kota',
      address: 'Jl. Merdeka No. 10',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postal_code: '10310',
      latitude: -6.194344,
      longitude: 106.822146,
      service_radius_km: 10.0,
      phone: '021-1234567',
      opening_time: new Date('1970-01-01T08:00:00Z'),
      closing_time: new Date('1970-01-01T20:00:00Z'),
      is_active: true,
    },
  });

  const outlet2 = await prisma.outlet.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Laundry Cabang Selatan',
      address: 'Jl. Raya Ragunan No. 45',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Pasar Minggu',
      postal_code: '12520',
      latitude: -6.294344,
      longitude: 106.832146,
      service_radius_km: 8.0,
      phone: '021-7654321',
      opening_time: new Date('1970-01-01T09:00:00Z'),
      closing_time: new Date('1970-01-01T21:00:00Z'),
      is_active: true,
    },
  });
  console.log('✅ Outlets created');

  // ================================
  // 4. EMPLOYEES (outlet admin, worker, driver)
  // ================================
  const outletAdmin1 = await prisma.employee.upsert({
    where: { email: 'outletadmin1@laundry.com' },
    update: {},
    create: {
      full_name: 'Budi Outlet',
      email: 'outletadmin1@laundry.com',
      password_hash: await bcrypt.hash('Outlet123!', 10),
      phone: '081298765432',
      role: 'outlet_admin',
      outlet_id: outlet1.id,
      is_active: true,
    },
  });

  const washingWorker1 = await prisma.employee.upsert({
    where: { email: 'washing@laundry.com' },
    update: {},
    create: {
      full_name: 'Siti Cuci',
      email: 'washing@laundry.com',
      password_hash: await bcrypt.hash('Worker123!', 10),
      phone: '081312345678',
      role: 'washing_worker',
      outlet_id: outlet1.id,
      is_active: true,
    },
  });

  const ironingWorker1 = await prisma.employee.upsert({
    where: { email: 'ironing@laundry.com' },
    update: {},
    create: {
      full_name: 'Joko Setrika',
      email: 'ironing@laundry.com',
      password_hash: await bcrypt.hash('Worker123!', 10),
      phone: '081398765432',
      role: 'ironing_worker',
      outlet_id: outlet1.id,
      is_active: true,
    },
  });

  const packingWorker1 = await prisma.employee.upsert({
    where: { email: 'packing@laundry.com' },
    update: {},
    create: {
      full_name: 'Dewi Packing',
      email: 'packing@laundry.com',
      password_hash: await bcrypt.hash('Worker123!', 10),
      phone: '081377788899',
      role: 'packing_worker',
      outlet_id: outlet1.id,
      is_active: true,
    },
  });

  const driver1 = await prisma.employee.upsert({
    where: { email: 'driver@laundry.com' },
    update: {},
    create: {
      full_name: 'Agus Supir',
      email: 'driver@laundry.com',
      password_hash: await bcrypt.hash('Driver123!', 10),
      phone: '081355566677',
      role: 'driver',
      outlet_id: outlet1.id,
      is_active: true,
      is_occupied: false,
    },
  });

  console.log('✅ Employees created');

  // ================================
  // 5. WORK SHIFTS
  // ================================
  const shiftMorning = await prisma.workShift.upsert({
    where: { name: 'Morning Shift' },
    update: {},
    create: {
      name: 'Morning Shift',
      start_time: new Date('1970-01-01T08:00:00Z'),
      end_time: new Date('1970-01-01T16:00:00Z'),
      description: 'Shift pagi',
      is_active: true,
    },
  });

  const shiftAfternoon = await prisma.workShift.upsert({
    where: { name: 'Afternoon Shift' },
    update: {},
    create: {
      name: 'Afternoon Shift',
      start_time: new Date('1970-01-01T14:00:00Z'),
      end_time: new Date('1970-01-01T22:00:00Z'),
      description: 'Shift sore',
      is_active: true,
    },
  });
  console.log('✅ Work shifts created');

  // ================================
  // 6. EMPLOYEE SHIFTS (assign shift ke employee)
  // ================================
  // Senin (1) - Morning shift untuk washing worker
  await prisma.employeeShift.upsert({
    where: {
      employee_id_shift_id_day_of_week: {
        employee_id: washingWorker1.id,
        shift_id: shiftMorning.id,
        day_of_week: 1,
      },
    },
    update: {},
    create: {
      employee_id: washingWorker1.id,
      shift_id: shiftMorning.id,
      outlet_id: outlet1.id,
      day_of_week: 1,
      is_active: true,
    },
  });

  // Selasa (2) - Morning untuk ironing
  await prisma.employeeShift.upsert({
    where: {
      employee_id_shift_id_day_of_week: {
        employee_id: ironingWorker1.id,
        shift_id: shiftMorning.id,
        day_of_week: 2,
      },
    },
    update: {},
    create: {
      employee_id: ironingWorker1.id,
      shift_id: shiftMorning.id,
      outlet_id: outlet1.id,
      day_of_week: 2,
      is_active: true,
    },
  });
  console.log('✅ Employee shifts assigned');

  // ================================
  // 7. LAUNDRY ITEMS
  // ================================
  const items = [
    { name: 'Kaos', base_price: 5000 },
    { name: 'Celana Panjang', base_price: 7000 },
    { name: 'Celana Pendek', base_price: 6000 },
    { name: 'Celana Dalam', base_price: 3000 },
    { name: 'Kemeja', base_price: 8000 },
  ];

  for (const item of items) {
    await prisma.laundryItem.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        unit: 'pcs',
        base_price: item.base_price,
        is_active: true,
      },
    });
  }
  console.log('✅ Laundry items created');

  // ================================
  // 8. CUSTOMER (contoh)
  // ================================
  const customer = await prisma.customer.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      full_name: 'John Doe',
      email: 'customer@example.com',
      password_hash: await bcrypt.hash('Customer123!', 10),
      phone: '081577788899',
      is_verified: true,
      is_active: true,
    },
  });
  console.log('✅ Customer created:', customer.email);

  // ================================
  // 9. CUSTOMER ADDRESS
  // ================================
  const customerAddress = await prisma.customerAddress.create({
    data: {
      customer_id: customer.id,
      label: 'Rumah',
      address: 'Jl. Mawar No. 5, Menteng',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postal_code: '10310',
      latitude: -6.194000,
      longitude: 106.822500,
      is_primary: true,
    },
  });
  console.log('✅ Customer address added');

  // ================================
  // 10. ORDER (contoh - status waiting_pickup_driver)
  // ================================
  const order = await prisma.order.create({
    data: {
      invoice_number: `INV-${Date.now()}`,
      customer_id: customer.id,
      outlet_id: outlet1.id,
      pickup_address_id: customerAddress.id,
      status: 'waiting_pickup_driver',
      pickup_schedule: new Date(Date.now() + 24 * 60 * 60 * 1000), // besok
      total_weight_kg: 2.5,
      total_price: 50000,
      notes: 'Pakaian biasa, tidak ada yang delicate',
      created_by_outlet_admin_id: outletAdmin1.id,
    },
  });

  // tambahkan order items
  const kaos = await prisma.laundryItem.findUnique({ where: { name: 'Kaos' } });
  const celanaPendek = await prisma.laundryItem.findUnique({ where: { name: 'Celana Pendek' } });

  if (kaos && celanaPendek) {
    await prisma.orderItem.createMany({
      data: [
        { order_id: order.id, laundry_item_id: kaos.id, quantity: 3, price_at_order: kaos.base_price },
        { order_id: order.id, laundry_item_id: celanaPendek.id, quantity: 2, price_at_order: celanaPendek.base_price },
      ],
    });
  }
  console.log('✅ Example order created with invoice:', order.invoice_number);

  // ================================
  // 11. PAYMENT RECORD (pending) - optional
  // ================================
  await prisma.payment.create({
    data: {
      order_id: order.id,
      amount: order.total_price!,
      payment_method: 'gateway',
      status: 'pending',
      expired_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Payment record attached to order');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });