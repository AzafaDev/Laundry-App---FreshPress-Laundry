import { prisma } from '../../src/lib/prisma.js';
import type { LaundryItem } from '../../generated/prisma/index.js';

const LAUNDRY_ITEMS = [
  // ── Kiloan (pakaian harian campur) ───────────────────────────────────────────
  { name: 'Cuci Kiloan', description: 'Cuci + setrika pakaian harian campur per kilogram (2 hari)', unit: 'kg', base_price: 7000 },

  // ── Satuan (item besar/khusus yang tidak masuk kiloan) ──────────────────────
  { name: 'Selimut Tebal / Bed Cover', description: 'Selimut tebal atau bed cover', unit: 'pcs', base_price: 25000 },
  { name: 'Sprei Single', description: 'Sprei ukuran single (single bed)', unit: 'pcs', base_price: 15000 },
  { name: 'Sprei Double / Queen / King', description: 'Sprei ukuran double, queen, atau king', unit: 'pcs', base_price: 25000 },
  { name: 'Sarung Bantal', description: 'Sarung bantal (per pcs)', unit: 'pcs', base_price: 5000 },
  { name: 'Gordyn / Tirai', description: 'Gordyn atau tirai per panel', unit: 'pcs', base_price: 25000 },
  { name: 'Jas / Blazer (Dry Clean)', description: 'Jas formal atau blazer, proses dry clean', unit: 'pcs', base_price: 35000 },
  { name: 'Jaket Kulit / Tebal', description: 'Jaket kulit atau jaket tebal', unit: 'pcs', base_price: 25000 },
  { name: 'Bantal / Guling', description: 'Bantal atau guling (per pcs)', unit: 'pcs', base_price: 20000 },
];

export async function seedLaundryItems(): Promise<LaundryItem[]> {
  // Hard-remove items that are explicitly retired
  const RETIRED_ITEMS = ['Cuci Kering (Dry Clean)'];
  await prisma.laundryItem.updateMany({
    where: { name: { in: RETIRED_ITEMS } },
    data: { is_active: false },
  });

  const items: LaundryItem[] = [];

  for (const item of LAUNDRY_ITEMS) {
    const upserted = await prisma.laundryItem.upsert({
      where: { name: item.name },
      update: {
        description: item.description,
        unit: item.unit,
        base_price: item.base_price,
        is_active: true,
      },
      create: {
        name: item.name,
        description: item.description,
        unit: item.unit,
        base_price: item.base_price,
        is_active: true,
      },
    });
    items.push(upserted);
  }

  console.log(`✅ Seeded ${items.length} laundry items`);
  return items;
}
