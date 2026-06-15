import { CHECKIN_RADIUS_METERS } from "../config/constants.js";
import { prisma } from "../lib/prisma.js";
import { getDistance } from "geolib";

export function calcEtaText(outletLat: number, outletLng: number, addrLat: number, addrLng: number): string | null {
  const distMeters = getDistance(
    { latitude: outletLat, longitude: outletLng },
    { latitude: addrLat, longitude: addrLng },
  );
  return `${Math.max(1, Math.round((distMeters / 1000 / 20) * 60))} menit`;
}

export async function isWithinRadius(outletId: string, userLat: number, userLng: number): Promise<boolean> {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { latitude: true, longitude: true },
  });
  if (!outlet || outlet.latitude === null || outlet.longitude === null) return false;
  const distance = getDistance(
    { latitude: userLat, longitude: userLng },
    { latitude: Number(outlet.latitude), longitude: Number(outlet.longitude) },
  );
  return distance <= CHECKIN_RADIUS_METERS;
}
