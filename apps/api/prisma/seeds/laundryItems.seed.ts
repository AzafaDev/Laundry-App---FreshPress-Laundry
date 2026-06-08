import { prisma } from '../../src/lib/prisma.js';
import type { LaundryItem } from '../../generated/prisma/index.js';

const LAUNDRY_ITEMS = [
  // ── Per kilogram ────────────────────────────────────────────────────────────
  { name: 'Laundry Kiloan', description: 'Cuci + setrika pakaian per kilogram', unit: 'kg', base_price: 7000 },
 
  // ── Per piece ───────────────────────────────────────────────────────────────
  { name: 'Kaos', description: 'Kaos / t-shirt', unit: 'pcs', base_price: 5000 },
  { name: 'Kemeja', description: 'Kemeja lengan pendek / panjang', unit: 'pcs', base_price: 7000 },
  { name: 'Celana Panjang', description: 'Celana panjang / jeans', unit: 'pcs', base_price: 8000 },
  { name: 'Celana Pendek', description: 'Celana pendek / shorts', unit: 'pcs', base_price: 5000 },
  { name: 'Celana Dalam', description: 'Pakaian dalam', unit: 'pcs', base_price: 3000 },
  { name: 'Bra / Pakaian Dalam Wanita', description: 'Bra dan pakaian dalam wanita', unit: 'pcs', base_price: 5000 },
  { name: 'Jaket Biasa', description: 'Jaket ringan / hoodie', unit: 'pcs', base_price: 12000 },
  { name: 'Jaket Kulit / Tebal', description: 'Jaket kulit atau jaket tebal', unit: 'pcs', base_price: 25000 },
  { name: 'Jas / Blazer', description: 'Jas formal atau blazer', unit: 'pcs', base_price: 30000 },
  { name: 'Gaun / Dress', description: 'Gaun panjang atau pendek', unit: 'pcs', base_price: 15000 },
  { name: 'Rok', description: 'Rok panjang atau pendek', unit: 'pcs', base_price: 7000 },
  { name: 'Sarung', description: 'Sarung', unit: 'pcs', base_price: 8000 },
  { name: 'Kaos Kaki', description: 'Kaos kaki sepasang', unit: 'pcs', base_price: 3000 },
  { name: 'Dasi', description: 'Dasi', unit: 'pcs', base_price: 5000 },

  // ── Bedding ─────────────────────────────────────────────────────────────────
  { name: 'Seprei Single', description: 'Seprei ukuran single (single bed)', unit: 'pcs', base_price: 15000 },
  { name: 'Seprei Double / Queen / King', description: 'Seprei ukuran double, queen, atau king', unit: 'pcs', base_price: 25000 },
  { name: 'Sarung Bantal', description: 'Sarung bantal (per pcs)', unit: 'pcs', base_price: 5000 },
  { name: 'Sarung Guling', description: 'Sarung guling (per pcs)', unit: 'pcs', base_price: 5000 },
  { name: 'Selimut Tipis', description: 'Selimut tipis / bed cover tipis', unit: 'pcs', base_price: 20000 },
  { name: 'Selimut Tebal / Duvet', description: 'Selimut tebal atau duvet', unit: 'pcs', base_price: 35000 },
  { name: 'Bantal / Guling', description: 'Bantal atau guling (per pcs)', unit: 'pcs', base_price: 20000 },

  // ── Linen & Home ────────────────────────────────────────────────────────────
  { name: 'Handuk Kecil', description: 'Handuk tangan atau muka', unit: 'pcs', base_price: 8000 },
  { name: 'Handuk Besar / Mandi', description: 'Handuk badan / mandi', unit: 'pcs', base_price: 12000 },
  { name: 'Taplak Meja', description: 'Taplak meja (per pcs)', unit: 'pcs', base_price: 12000 },
  { name: 'Gordyn / Tirai', description: 'Gordyn atau tirai per panel', unit: 'pcs', base_price: 25000 },
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
