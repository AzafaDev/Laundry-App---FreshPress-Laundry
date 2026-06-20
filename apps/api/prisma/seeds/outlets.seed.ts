import { prisma } from '../../src/lib/prisma.js';
import type { Outlet } from '../../generated/prisma/index.js';

export async function seedOutlets(): Promise<Outlet[]> {
  const outletsData = [
    {
      name: 'Rumah Akmal',
      address: 'Jl. Komp. Tataka Puri Blok J5 No.10, RT.3/RW.5, Kadu, Kec. Curug',
      province: 'Banten',
      city: 'Kabupaten Tangerang',
      district: 'Curug',
      postal_code: '15810',
      latitude: -6.229383828043414,
      longitude: 106.56748566704175,
      service_radius_km: 10.0,
      phone: '+6288225659672',
      opening_time: new Date(1970, 0, 1, 8, 0, 0),
      closing_time: new Date(1970, 0, 1, 22, 0, 0),
      is_active: true,
    },
    {
      name: 'Purwadhika',
      address: 'Jl. BSD Green Office Park, GOP 9 - G Floor BSD City, Sampora',
      province: 'Banten',
      city: 'Kabupaten Tangerang',
      district: 'Cisauk',
      postal_code: '15345',
      latitude: -6.298110837438938,
      longitude: 106.65004638358602,
      service_radius_km: 10.0,
      phone: '+6281380125296',
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