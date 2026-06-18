ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_deadline" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS "orders_payment_deadline_idx" ON "orders"("payment_deadline");
