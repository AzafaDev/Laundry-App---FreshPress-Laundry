import { prisma } from '../../src/lib/prisma.js';

export async function seedDriverNotifications(): Promise<void> {
  const driver = await prisma.employee.findFirst({ where: { email: 'driver.morning.1@freshpress.com' } });
  if (!driver) throw new Error('Driver tidak ditemukan — jalankan seed employees dulu.');

  const existing = await prisma.notification.count({ where: { user_id: driver.id, user_type: 'employee' } });
  if (existing > 0) {
    console.log('⏭️  Driver notifications sudah ada, skip');
    return;
  }

  await prisma.notification.createMany({
    data: [
      {
        user_type: 'employee',
        user_id: driver.id,
        title: 'Pickup Baru Tersedia',
        body: 'Ada permintaan pickup baru dari customer di area Anda.',
        type: 'order_update',
        is_read: false,
      },
      {
        user_type: 'employee',
        user_id: driver.id,
        title: 'Pembayaran Dikonfirmasi',
        body: 'Pembayaran untuk order #INV-SEED-WASHING-1 telah dikonfirmasi.',
        type: 'order_update',
        is_read: false,
      },
      {
        user_type: 'employee',
        user_id: driver.id,
        title: 'Pickup Baru Tersedia',
        body: 'Ada permintaan pickup baru dari customer Budi Santoso.',
        type: 'order_update',
        is_read: true,
      },
    ],
  });

  console.log('✅ Driver notifications seeded');
}
