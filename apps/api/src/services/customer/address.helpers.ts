export const FREE_RADIUS_KM = Number(5);
export const FLAT_RATE_ONGKIR = Number(10_000);
export const EXTRA_RADIUS_KM = Number(10);
export const EXTRA_RATE_PER_KM = Number(10_000);

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

export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= FREE_RADIUS_KM) return 0;
  if (distanceKm <= EXTRA_RADIUS_KM) return FLAT_RATE_ONGKIR;
  const extraKm = Math.ceil(distanceKm - EXTRA_RADIUS_KM);
  return FLAT_RATE_ONGKIR + extraKm * EXTRA_RATE_PER_KM;
}

export interface CreateAddressInput {
  label: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  is_primary?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}
