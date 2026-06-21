export const FREE_RADIUS_KM = Number(5);
export const FLAT_RATE_ONGKIR = Number(10_000);

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 900_000) + 100_000;
  return `INV-${y}${m}${d}-${random}`;
}

export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= FREE_RADIUS_KM) return 0;
  return FLAT_RATE_ONGKIR;
}

export interface CreateCustomerOrderInput {
  pickup_address_id: string;
  pickup_date: string;
  service_type: "wash-and-fold" | "dry-cleaning";
  estimated_weight_kg?: number;
  notes?: string;
}
