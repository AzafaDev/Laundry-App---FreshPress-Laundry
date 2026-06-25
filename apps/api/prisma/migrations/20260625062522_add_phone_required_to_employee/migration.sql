/*
  Warnings:

  - You are about to drop the column `payment_deadline` on the `orders` table. All the data in the column will be lost.
  - Made the column `phone` on table `employees` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "employee_shifts_employee_id_shift_id_day_of_week_key";

-- DropIndex
DROP INDEX "orders_payment_deadline_idx";

-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "payment_deadline";

-- RenameIndex
ALTER INDEX "employee_id_date" RENAME TO "employee_shifts_employee_id_date_key";

-- RenameIndex
ALTER INDEX "employee_id_day_of_week" RENAME TO "employee_shifts_employee_id_day_of_week_key";
