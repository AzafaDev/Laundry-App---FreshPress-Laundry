import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from './helpers.js';
import type { Customer } from '../../generated/prisma/client.js';

export const seededCustomerEmails = ['testcustomer@freshpress.com'] as const;

// ── Alamat uji jarak terhadap 2 outlet (Rumah Akmal & Purwadhika) ───────────
// Dipakai untuk testing ongkir (≤5km gratis, >5km flat Rp10.000) dan testing
// rejection ketika alamat di luar service_radius_km kedua outlet (>10km).
const CUSTOMER_ADDRESSES = [
  {
    label: 'Dekat Rumah Akmal',
    address: 'Jl. Tataka Indah, Kadu, Kec. Curug, Kabupaten Tangerang',
    city: 'Kabupaten Tangerang',
    district: 'Curug',
    latitude: -6.229383828,
    longitude: 106.585556,
    is_primary: true,
  },
  {
    label: 'Dekat Purwadhika',
    address: 'Jl. Raya Cisauk, Sampora, Kec. Cisauk, Kabupaten Tangerang',
    city: 'Kabupaten Tangerang',
    district: 'Cisauk',
    latitude: -6.298110837,
    longitude: 106.677166,
    is_primary: false,
  },
  {
    label: 'Sedang dari Rumah Akmal',
    address: 'Jl. Legok Raya, Kec. Legok, Kabupaten Tangerang',
    city: 'Kabupaten Tangerang',
    district: 'Legok',
    latitude: -6.229383828,
    longitude: 106.630736,
    is_primary: false,
  },
  {
    label: 'Sedang dari Purwadhika',
    address: 'Jl. Raya Serpong, Kec. Serpong, Tangerang Selatan',
    city: 'Tangerang Selatan',
    district: 'Serpong',
    latitude: -6.298110837,
    longitude: 106.722366,
    is_primary: false,
  },
  {
    label: 'Jauh (Timur)',
    address: 'Jl. Fatmawati Raya, Kebayoran Baru, Jakarta Selatan',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    latitude: -6.298110837,
    longitude: 106.830846,
    is_primary: false,
  },
  {
    label: 'Jauh (Barat)',
    address: 'Jl. Raya Serang, Kec. Balaraja, Kabupaten Tangerang',
    city: 'Kabupaten Tangerang',
    district: 'Balaraja',
    latitude: -6.229383828,
    longitude: 106.341586,
    is_primary: false,
  },
] as const;

export async function seedCustomers(): Promise<Customer[]> {
  const defaultPassword = await hashPassword('Password123');

  const customerSeedData = [
    {
      email: seededCustomerEmails[0],
      full_name: 'Demo Customer',
      phone: '08111222333',
      avatar_url: null,
      is_verified: true,
      is_active: true,
      last_login_at: new Date(),
    },
  ] as const;

  const customers: Customer[] = [];

  for (const data of customerSeedData) {
    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: {
        full_name: data.full_name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        is_verified: data.is_verified,
        is_active: data.is_active,
        last_login_at: data.last_login_at,
        deleted_at: null,
      },
      create: {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        password_hash: defaultPassword,
        is_verified: data.is_verified,
        is_active: data.is_active,
        last_login_at: data.last_login_at,
      },
    });

    customers.push(customer);

    for (const addr of CUSTOMER_ADDRESSES) {
      const existing = await prisma.customerAddress.findFirst({
        where: { customer_id: customer.id, label: addr.label },
      });
      const addressData = {
        label: addr.label,
        address: addr.address,
        province: 'Banten',
        city: addr.city,
        district: addr.district,
        latitude: addr.latitude,
        longitude: addr.longitude,
        is_primary: addr.is_primary,
      };
      if (existing) {
        await prisma.customerAddress.update({ where: { id: existing.id }, data: addressData });
      } else {
        await prisma.customerAddress.create({ data: { customer_id: customer.id, ...addressData } });
      }
    }
  }

  console.log(`✅ Seeded ${customers.length} customers with ${CUSTOMER_ADDRESSES.length} addresses each`);
  return customers;
}