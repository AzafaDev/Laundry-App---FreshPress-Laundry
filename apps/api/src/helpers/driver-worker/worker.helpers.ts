import { OrderStatus, Prisma } from "../../../generated/prisma/client.js";

export type NormalizedItem = {
  item_type: "breakdown" | "satuan";
  item_id: string;
  name: string;
  quantity: number;
};

export type Discrepancy = {
  item_type: "breakdown" | "satuan";
  item_id: string;
  name: string;
  expected: number;
  actual: number;
};

export function resolveNextStatus(station: "washing" | "ironing" | "packing"): OrderStatus {
  const map: Record<string, OrderStatus> = { washing: "ironing", ironing: "packing", packing: "waiting_payment" };
  return map[station];
}

export function buildExpectedItems(
  breakdownItems: { clothing_type_id: string; clothing_type: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  satuanOrderItems: { laundry_item_id: string; laundry_item: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
): NormalizedItem[] {
  return [
    ...breakdownItems.map((item) => ({
      item_type: "breakdown" as const,
      item_id: item.clothing_type_id,
      name: item.clothing_type.name,
      quantity: Number(item.quantity),
    })),
    ...satuanOrderItems.map((item) => ({
      item_type: "satuan" as const,
      item_id: item.laundry_item_id,
      name: item.laundry_item.name,
      quantity: Number(item.quantity),
    })),
  ];
}

export function buildActualItems(
  actualItemsRaw: { clothing_type_id: string; actual_quantity: number }[],
  actualSatuanItemsRaw: { laundry_item_id: string; actual_quantity: number }[],
  clothingTypeMap: Map<string, { name: string }>,
  satuanMap: Map<string, { name: string }>,
): NormalizedItem[] {
  return [
    ...actualItemsRaw.map((a) => ({
      item_type: "breakdown" as const,
      item_id: a.clothing_type_id,
      name: clothingTypeMap.get(a.clothing_type_id)?.name ?? "",
      quantity: a.actual_quantity,
    })),
    ...actualSatuanItemsRaw.map((a) => ({
      item_type: "satuan" as const,
      item_id: a.laundry_item_id,
      name: satuanMap.get(a.laundry_item_id)?.name ?? "",
      quantity: a.actual_quantity,
    })),
  ];
}

export function compareItems(
  breakdownItems: { clothing_type_id: string; clothing_type: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  satuanOrderItems: { laundry_item_id: string; laundry_item: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  actualItems: { clothing_type_id: string; actual_quantity: number }[],
  actualSatuanItems: { laundry_item_id: string; actual_quantity: number }[],
): { isMatch: boolean; discrepancies: Discrepancy[] } {
  const discrepancies: Discrepancy[] = [];

  for (const item of breakdownItems) {
    const submitted = actualItems.find((a) => a.clothing_type_id === item.clothing_type_id);
    const actual = submitted?.actual_quantity ?? 0;
    if (actual !== Number(item.quantity)) {
      discrepancies.push({ item_type: "breakdown", item_id: item.clothing_type_id, name: item.clothing_type.name, expected: Number(item.quantity), actual });
    }
  }

  for (const item of satuanOrderItems) {
    const submitted = actualSatuanItems.find((a) => a.laundry_item_id === item.laundry_item_id);
    const actual = submitted?.actual_quantity ?? 0;
    if (actual !== Number(item.quantity)) {
      discrepancies.push({ item_type: "satuan", item_id: item.laundry_item_id, name: item.laundry_item.name, expected: Number(item.quantity), actual });
    }
  }

  return { isMatch: discrepancies.length === 0, discrepancies };
}
