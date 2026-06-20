-- Add optional date field for one-time specific date shift assignments
ALTER TABLE "employee_shifts" ADD COLUMN "date" DATE;

-- Make day_of_week nullable (was INT NOT NULL)
ALTER TABLE "employee_shifts" ALTER COLUMN "day_of_week" DROP NOT NULL;

-- Drop old unique constraints
ALTER TABLE "employee_shifts" DROP CONSTRAINT IF EXISTS "employee_shifts_employee_id_shift_id_day_of_week_key";
ALTER TABLE "employee_shifts" DROP CONSTRAINT IF EXISTS "employee_shifts_employee_id_day_of_week_key";

-- Drop old indexes
DROP INDEX IF EXISTS "employee_shifts_outlet_id_shift_id_day_of_week_idx";

-- New unique constraint: recurring (employee + day_of_week), only when day_of_week is not null
CREATE UNIQUE INDEX "employee_id_day_of_week"
  ON "employee_shifts"("employee_id", "day_of_week")
  WHERE "day_of_week" IS NOT NULL;

-- New unique constraint: date-specific (employee + date), only when date is not null
CREATE UNIQUE INDEX "employee_id_date"
  ON "employee_shifts"("employee_id", "date")
  WHERE "date" IS NOT NULL;

-- New indexes for query performance
CREATE INDEX "employee_shifts_outlet_id_day_of_week_idx" ON "employee_shifts"("outlet_id", "day_of_week");
CREATE INDEX "employee_shifts_outlet_id_date_idx" ON "employee_shifts"("outlet_id", "date");
