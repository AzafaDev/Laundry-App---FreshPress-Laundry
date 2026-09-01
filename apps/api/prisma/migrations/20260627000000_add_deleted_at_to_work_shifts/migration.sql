-- AlterTable: add soft-delete column to work_shifts
ALTER TABLE "work_shifts" ADD COLUMN "deleted_at" TIMESTAMPTZ;
