import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const payments = await prisma.payment.findMany({
  where: { status: "pending" },
  include: { order: { select: { id: true, invoice_number: true, status: true, customer_id: true } } },
  orderBy: { created_at: "desc" },
  take: 10,
});

console.log(JSON.stringify(payments, null, 2));

await prisma.$disconnect();
