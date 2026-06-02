import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from './helpers.js';
import type { Customer } from '../../generated/prisma/client.js';

export const seededCustomerEmails = [
  'testcustomer@freshpress.com',
  'ani.safitri@freshpress.com',
  'budi.pratama@freshpress.com',
  'siti.rahma@freshpress.com',
] as const;

export async function seedCustomers(): Promise<Customer[]> {
  const defaultPassword = await hashPassword('Password123');

  const customerSeedData = [
    {
      email: 'testcustomer@freshpress.com',
      full_name: 'Test Customer',
      phone: '08111222333',
      avatar_url: null,
      is_verified: true,
      is_active: true,
      last_login_at: new Date(),
    },
    {
      email: 'ani.safitri@freshpress.com',
      full_name: 'Ani Safitri',
      phone: '081234567801',
      avatar_url: null,
      is_verified: true,
      is_active: true,
      last_login_at: null,
    },
    {
      email: 'budi.pratama@freshpress.com',
      full_name: 'Budi Pratama',
      phone: '081234567802',
      avatar_url: null,
      is_verified: false,
      is_active: true,
      last_login_at: null,
    },
    {
      email: 'siti.rahma@freshpress.com',
      full_name: 'Siti Rahma',
      phone: null,
      avatar_url: null,
      is_verified: true,
      is_active: true,
      last_login_at: null,
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
  }

  console.log(`✅ Seeded ${customers.length} customers`);
  return customers;
}