/*
  Warnings:

  - You are about to drop the column `laundry_item_id` on the `order_item_breakdowns` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id,clothing_type_id]` on the table `order_item_breakdowns` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clothing_type_id` to the `order_item_breakdowns` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_item_breakdowns" DROP CONSTRAINT "order_item_breakdowns_laundry_item_id_fkey";

-- DropIndex
DROP INDEX "order_item_breakdowns_order_id_laundry_item_id_key";

-- AlterTable
ALTER TABLE "order_item_breakdowns" DROP COLUMN "laundry_item_id",
ADD COLUMN     "clothing_type_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "clothing_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clothing_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clothing_types_name_key" ON "clothing_types"("name");

-- CreateIndex
CREATE INDEX "clothing_types_is_active_idx" ON "clothing_types"("is_active");

-- CreateIndex
CREATE INDEX "clothing_types_deleted_at_idx" ON "clothing_types"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_breakdowns_order_id_clothing_type_id_key" ON "order_item_breakdowns"("order_id", "clothing_type_id");

-- AddForeignKey
ALTER TABLE "order_item_breakdowns" ADD CONSTRAINT "order_item_breakdowns_clothing_type_id_fkey" FOREIGN KEY ("clothing_type_id") REFERENCES "clothing_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
