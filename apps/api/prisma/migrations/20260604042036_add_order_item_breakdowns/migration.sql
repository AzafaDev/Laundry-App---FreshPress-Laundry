-- CreateTable
CREATE TABLE "order_item_breakdowns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "laundry_item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_item_breakdowns_order_id_idx" ON "order_item_breakdowns"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_breakdowns_order_id_laundry_item_id_key" ON "order_item_breakdowns"("order_id", "laundry_item_id");

-- AddForeignKey
ALTER TABLE "order_item_breakdowns" ADD CONSTRAINT "order_item_breakdowns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_breakdowns" ADD CONSTRAINT "order_item_breakdowns_laundry_item_id_fkey" FOREIGN KEY ("laundry_item_id") REFERENCES "laundry_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_breakdowns" ADD CONSTRAINT "order_item_breakdowns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
