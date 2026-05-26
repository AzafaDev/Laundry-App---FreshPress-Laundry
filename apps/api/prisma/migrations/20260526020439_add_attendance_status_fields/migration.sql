-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "is_late" BOOLEAN,
ADD COLUMN     "status" VARCHAR(20);

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");
