-- AlterTable
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_employee_id_day_of_week_key" UNIQUE ("employee_id", "day_of_week");