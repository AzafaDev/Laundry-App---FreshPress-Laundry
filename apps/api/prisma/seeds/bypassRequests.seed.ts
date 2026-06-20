import { prisma } from '../../src/lib/prisma.js';

// Seeder ini membuat 3 bypass request untuk testing:
//   1. WASHING-2  → pending   (worker baru request, belum di-review)
//   2. IRONING-2  → approved  (outlet admin sudah setujui)
//   3. PACKING-2  → rejected  (outlet admin tolak, worker harus isi ulang)
//
// Setiap bypass request memiliki expected_items & actual_items yang mencerminkan
// data order sesungguhnya: breakdown kiloan (order_item_breakdowns) + satuan (order_items pcs).

export async function seedBypassRequests(): Promise<void> {
  const outletAdmin = await prisma.employee.findFirst({
    where: { email: 'outletadmin@freshpress.com' },
  });
  if (!outletAdmin) throw new Error('Outlet admin tidak ditemukan — jalankan seed employees dulu.');

  const washingWorker = await prisma.employee.findFirst({
    where: { email: 'washing_worker.morning.1@freshpress.com' },
  });
  const ironingWorker = await prisma.employee.findFirst({
    where: { email: 'ironing_worker.morning.1@freshpress.com' },
  });
  const packingWorker = await prisma.employee.findFirst({
    where: { email: 'packing_worker.morning.1@freshpress.com' },
  });

  if (!washingWorker || !ironingWorker || !packingWorker) {
    throw new Error('Worker tidak ditemukan — jalankan seed employees dulu.');
  }

  const scenarios = [
    {
      invoice: 'INV-SEED-WASHING-2',
      station: 'washing' as const,
      workerId: washingWorker.id,
      discrepancy: '1 kaos tidak ditemukan saat sortir di mesin cuci. Kemungkinan tertinggal di tas pickup.',
      status: 'pending' as const,
      reviewerId: null,
      adminNotes: null,
    },
    {
      invoice: 'INV-SEED-IRONING-2',
      station: 'ironing' as const,
      workerId: ironingWorker.id,
      discrepancy: '1 celana panjang robek saat proses pencucian, tidak dapat disetrika. Sudah difoto dan disimpan.',
      status: 'approved' as const,
      reviewerId: outletAdmin.id,
      adminNotes: 'Disetujui. Celana sudah dikonfirmasi rusak saat cuci, bukan kesalahan setrika. Lanjutkan proses.',
    },
    {
      invoice: 'INV-SEED-PACKING-2',
      station: 'packing' as const,
      workerId: packingWorker.id,
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
      include: {
        order_item_breakdowns: { include: { clothing_type: true } },
        order_items: { include: { laundry_item: true } },
      },
    });

    if (!order) {
      console.log(`⚠️  Order ${s.invoice} tidak ditemukan, skip bypass seed ini.`);
      skipped++;
      continue;
    }

    const existing = await prisma.bypassRequest.findFirst({
      where: { order_id: order.id, station: s.station },
    });

    if (existing) {
      console.log(`⏭️  Bypass request untuk ${s.invoice} (${s.station}) sudah ada, skip`);
      skipped++;
      continue;
    }

    // Build expected_items dari data order sesungguhnya
    const breakdownExpected = order.order_item_breakdowns.map((b) => ({
      item_type: 'breakdown' as const,
      item_id: b.clothing_type_id,
      name: b.clothing_type.name,
      quantity: Number(b.quantity),
    }));

    const satuanItems = order.order_items.filter((i) => i.laundry_item.unit !== 'kg');
    const satuanExpected = satuanItems.map((i) => ({
      item_type: 'satuan' as const,
      item_id: i.laundry_item_id,
      name: i.laundry_item.name,
      quantity: Number(i.quantity),
    }));

    const expectedItems = [...breakdownExpected, ...satuanExpected];

    // Actual items: kurangi 1 pada item pertama breakdown & item pertama satuan untuk simulasi discrepancy
    const actualBreakdown = breakdownExpected.map((item, idx) => ({
      ...item,
      quantity: idx === 0 ? Math.max(0, item.quantity - 1) : item.quantity,
    }));
    const actualSatuan = satuanExpected.map((item, idx) => ({
      ...item,
      quantity: idx === 0 ? Math.max(0, item.quantity - 1) : item.quantity,
    }));
    const actualItems = [...actualBreakdown, ...actualSatuan];

    await prisma.bypassRequest.create({
      data: {
        order_id: order.id,
        station: s.station,
        requested_by: s.workerId,
        expected_items: expectedItems,
        actual_items: actualItems,
        discrepancy_description: s.discrepancy,
        photo_evidence: [],
        status: s.status,
        reviewed_by: s.reviewerId,
        admin_notes: s.adminNotes,
        resolved_at: s.status !== 'pending' ? new Date() : null,
      },
    });

    console.log(`✅ Bypass request ${s.invoice} (${s.station}) [${s.status}] created (${expectedItems.length} items: ${breakdownExpected.length} breakdown + ${satuanExpected.length} satuan)`);
    created++;
  }

  console.log(`✅ Bypass requests seeded: ${created} created, ${skipped} skipped`);
}
