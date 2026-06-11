-- DropIndex
DROP INDEX "orders_pickup_schedule_idx";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "pickup_schedule" DROP NOT NULL;
