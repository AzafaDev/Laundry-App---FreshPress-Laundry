import { prisma } from '../../src/lib/prisma.js';

// Seeder ini membuat 3 bypass request untuk testing:
//   1. WASHING-2  → pending   (worker baru request, belum di-review)
//   2. IRONING-2  → approved  (outlet admin sudah setujui)
//   3. PACKING-2  → rejected  (outlet admin tolak, worker harus isi ulang)

export async function seedBypassRequests(): Promise<void> {
  const outletAdmin = await prisma.employee.findFirst({
    where: { email: 'outletadmin@freshpress.com' },
  });
  if (!outletAdmin) throw new Error('Outlet admin tidak ditemukan — jalankan seed employees dulu.');

  const washingWorker = await prisma.employee.findFirst({
    where: { email: 'washing.worker@freshpress.com' },
  });
  const ironingWorker = await prisma.employee.findFirst({
    where: { email: 'ironing.worker@freshpress.com' },
  });
  const packingWorker = await prisma.employee.findFirst({
    where: { email: 'packing.worker@freshpress.com' },
  });

  if (!washingWorker || !ironingWorker || !packingWorker) {
    throw new Error('Worker tidak ditemukan — jalankan seed employees dulu.');
  }

  const scenarios = [
    {
      invoice: 'INV-SEED-WASHING-2',
      station: 'washing' as const,
      workerId: washingWorker.id,
      expected: [
        { name: 'Kaos', quantity: 5 },
        { name: 'Celana Panjang', quantity: 3 },
        { name: 'Seprei', quantity: 2 },
      ],
      actual: [
        { name: 'Kaos', quantity: 4 },
        { name: 'Celana Panjang', quantity: 3 },
        { name: 'Seprei', quantity: 2 },
      ],
      discrepancy: '1 kaos tidak ditemukan saat sortir di mesin cuci. Kemungkinan tertinggal di tas pickup.',
      status: 'pending' as const,
      reviewerId: null,
      adminNotes: null,
    },
    {
      invoice: 'INV-SEED-IRONING-2',
      station: 'ironing' as const,
      workerId: ironingWorker.id,
      expected: [
        { name: 'Kaos', quantity: 5 },
        { name: 'Celana Panjang', quantity: 3 },
        { name: 'Seprei', quantity: 2 },
      ],
      actual: [
        { name: 'Kaos', quantity: 5 },
        { name: 'Celana Panjang', quantity: 2 },
        { name: 'Seprei', quantity: 2 },
      ],
      discrepancy: '1 celana panjang robek saat proses pencucian, tidak dapat disetrika. Sudah difoto dan disimpan.',
      status: 'approved' as const,
      reviewerId: outletAdmin.id,
      adminNotes: 'Disetujui. Celana sudah dikonfirmasi rusak saat cuci, bukan kesalahan setrika. Lanjutkan proses.',
    },
    {
      invoice: 'INV-SEED-PACKING-2',
      station: 'packing' as const,
      workerId: packingWorker.id,
      expected: [
        { name: 'Kaos', quantity: 5 },
        { name: 'Celana Panjang', quantity: 3 },
        { name: 'Seprei', quantity: 2 },
      ],
      actual: [
        { name: 'Kaos', quantity: 3 },
        { name: 'Celana Panjang', quantity: 3 },
        { name: 'Seprei', quantity: 2 },
      ],
      discrepancy: '2 kaos tidak ada di rak packing. Belum diperiksa apakah tertinggal di station setrika.',
      status: 'rejected' as const,
      reviewerId: outletAdmin.id,
      adminNotes: 'Ditolak. Harap cek kembali rak setrika dan area packing. Pastikan semua item terhitung sebelum submit ulang.',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const s of scenarios) {
    const order = await prisma.order.findFirst({
      where: { invoice_number: s.invoice },
    });

    if (!order) {
      console.log(`⚠️  Order ${s.invoice} tidak ditemukan, skip bypass seed ini.`);
      skipped++;
      continue;
    }

    // Cek apakah bypass request untuk order + station ini sudah ada
    const existing = await prisma.bypassRequest.findFirst({
      where: { order_id: order.id, station: s.station },
    });

    if (existing) {
      console.log(`⏭️  Bypass request untuk ${s.invoice} (${s.station}) sudah ada, skip`);
      skipped++;
      continue;
    }

    await prisma.bypassRequest.create({
      data: {
        order_id: order.id,
        station: s.station,
        requested_by: s.workerId,
        expected_items: s.expected,
        actual_items: s.actual,
        discrepancy_description: s.discrepancy,
        photo_evidence: [],
        status: s.status,
        reviewed_by: s.reviewerId,
        admin_notes: s.adminNotes,
        resolved_at: s.status !== 'pending' ? new Date() : null,
      },
    });

    console.log(`✅ Bypass request ${s.invoice} (${s.station}) [${s.status}] created`);
    created++;
  }

  console.log(`✅ Bypass requests seeded: ${created} created, ${skipped} skipped`);
}
