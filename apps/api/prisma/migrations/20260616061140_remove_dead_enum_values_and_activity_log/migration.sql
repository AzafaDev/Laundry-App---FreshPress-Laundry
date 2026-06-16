/*
  Warnings:

  - The values [cancelled,pending] on the enum `DriverTaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [cancelled] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DriverTaskStatus_new" AS ENUM ('available', 'in_progress', 'completed');
ALTER TABLE "public"."driver_tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "driver_tasks" ALTER COLUMN "status" TYPE "DriverTaskStatus_new" USING ("status"::text::"DriverTaskStatus_new");
ALTER TYPE "DriverTaskStatus" RENAME TO "DriverTaskStatus_old";
ALTER TYPE "DriverTaskStatus_new" RENAME TO "DriverTaskStatus";
DROP TYPE "public"."DriverTaskStatus_old";
ALTER TABLE "driver_tasks" ALTER COLUMN "status" SET DEFAULT 'available';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('waiting_pickup_driver', 'laundry_to_outlet', 'laundry_arrived_outlet', 'washing', 'ironing', 'packing', 'waiting_payment', 'ready_for_delivery', 'delivery_to_customer', 'received_by_customer', 'completed');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "order_status_histories" ALTER COLUMN "old_status" TYPE "OrderStatus_new" USING ("old_status"::text::"OrderStatus_new");
ALTER TABLE "order_status_histories" ALTER COLUMN "new_status" TYPE "OrderStatus_new" USING ("new_status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'waiting_pickup_driver';
COMMIT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "total_price" SET DEFAULT 0;

-- DropTable
DROP TABLE "activity_logs";
