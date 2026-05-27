import { prisma } from '../../src/lib/prisma.js';
import type { Outlet } from '@prisma/client';

export async function seedOutlets(): Promise<Outlet[]> {
  const outletsData = [
    {
      name: 'Downtown Hub',
      address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postal_code: '10110',
      latitude: -6.2,
      longitude: 106.816666,
      service_radius_km: 10.0,
      phone: '+6221 1234567',
      opening_time: new Date(1970, 0, 1, 8, 0, 0),
      closing_time: new Date(1970, 0, 1, 22, 0, 0),
      is_active: true,
    },
    {
      name: 'Westside Branch',
      address: 'Jl. Raya Kebon Jeruk No. 45, Jakarta Barat',
      province: 'DKI Jakarta',
      city: 'Jakarta Barat',
      district: 'Kebon Jeruk',
      postal_code: '11530',
      latitude: -6.183333,
      longitude: 106.766667,
      service_radius_km: 8.0,
      phone: '+6221 7654321',
      opening_time: new Date(1970, 0, 1, 8, 0, 0),
      closing_time: new Date(1970, 0, 1, 22, 0, 0),
      is_active: true,
    },
  ];

  const outlets: Outlet[] = [];
  for (const data of outletsData) {
    const outlet = await prisma.outlet.create({ data });
    outlets.push(outlet);
  }
  console.log(`✅ Seeded ${outlets.length} outlets`);
  return outlets;
}