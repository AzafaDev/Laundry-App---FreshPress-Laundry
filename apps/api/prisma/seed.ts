import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Hash password ─────────────────────────────────────────────
  const password = await bcrypt.hash("password123", SALT_ROUNDS);

  // ── 2. Create Users ───────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@freshpress.com" },
    update: {},
    create: {
      email: "admin@freshpress.com",
      password_hash: password,
      full_name: "Super Admin",
      phone: "081111111111",
      role: "super_admin",
      is_verified: true,
    },
  });

  const outletAdmin = await prisma.user.upsert({
    where: { email: "outlet@freshpress.com" },
    update: {},
    create: {
      email: "outlet@freshpress.com",
      password_hash: password,
      full_name: "Outlet Admin",
      phone: "081222222222",
      role: "outlet_admin",
      is_verified: true,
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: "driver@freshpress.com" },
    update: {},
    create: {
      email: "driver@freshpress.com",
      password_hash: password,
      full_name: "Test Driver",
      phone: "081333333333",
      role: "driver",
      is_verified: true,
    },
  });

  const worker = await prisma.user.upsert({
    where: { email: "worker@freshpress.com" },
    update: {},
    create: {
      email: "worker@freshpress.com",
      password_hash: password,
      full_name: "Test Worker",
      phone: "081444444444",
      role: "worker",
      is_verified: true,
    },
  });

  console.log("✅ Users created");
  console.log(`   admin@freshpress.com / password123 (super_admin)`);
  console.log(`   outlet@freshpress.com / password123 (outlet_admin)`);
  console.log(`   driver@freshpress.com / password123 (driver)`);
  console.log(`   worker@freshpress.com / password123 (worker)\n`);

  // ── 3. Create Outlet (dibutuhkan untuk UserShift & attendance report) ─
  const outlet = await prisma.outlet.upsert({
    where: { id: "seed-outlet-01" },
    update: {},
    create: {
      id: "seed-outlet-01",
      name: "Downtown Hub",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      latitude: -6.2088,
      longitude: 106.8456,
      max_service_km: 15,
      is_active: true,
    },
  });

  console.log("✅ Outlet: Downtown Hub\n");

  // ── 4. Create Shift ──────────────────────────────────────────────
  const morningShift = await prisma.shift.upsert({
    where: { id: "seed-shift-01" },
    update: {},
    create: {
      id: "seed-shift-01",
      outlet_id: outlet.id,
      name: "Morning Shift",
      start_time: "08:00",
      end_time: "16:00",
    },
  });

  console.log("✅ Shift: Morning Shift (08:00-16:00)\n");

  // ── 5. Assign UserShift (driver & worker ke outlet) ─────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of [driver, worker, outletAdmin]) {
    await prisma.userShift.upsert({
      where: {
        user_id_shift_id_shift_date: {
          user_id: user.id,
          shift_id: morningShift.id,
          shift_date: today,
        },
      },
      update: {},
      create: {
        user_id: user.id,
        shift_id: morningShift.id,
        shift_date: today,
        is_active: true,
      },
    });
  }

  console.log(
    "✅ UserShifts assigned (driver, worker, outlet_admin) ke Downtown Hub\n",
  );

  // ── 6. Create dummy attendance records (untuk testing my-logs & report) ─
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const dummyAttendances = [
    {
      user_id: driver.id,
      attendance_date: twoDaysAgo,
      check_in_time: "08:00",
      check_out_time: "16:00",
      status: "on_time" as const,
      total_hours: 8.0,
    },
    {
      user_id: driver.id,
      attendance_date: yesterday,
      check_in_time: "08:30",
      check_out_time: "16:00",
      status: "late" as const,
      total_hours: 7.5,
    },
    {
      user_id: worker.id,
      attendance_date: twoDaysAgo,
      check_in_time: "07:55",
      check_out_time: "15:45",
      status: "on_time" as const,
      total_hours: 7.83,
    },
    {
      user_id: worker.id,
      attendance_date: yesterday,
      check_in_time: null,
      check_out_time: null,
      status: "absent" as const,
      total_hours: null,
    },
  ];

  for (const att of dummyAttendances) {
    await prisma.attendance.upsert({
      where: {
        user_id_attendance_date: {
          user_id: att.user_id,
          attendance_date: att.attendance_date,
        },
      },
      update: {},
      create: att,
    });
  }

  console.log("✅ 4 dummy attendance records created\n");
  console.log("🎉 Seed complete!");
  console.log("   Login credentials:");
  console.log("   ┌──────────────────────┬──────────────┬───────────────┐");
  console.log("   │ Email                │ Password     │ Role          │");
  console.log("   ├──────────────────────┼──────────────┼───────────────┤");
  console.log("   │ admin@freshpress.com │ password123  │ super_admin   │");
  console.log("   │ outlet@freshpress.com│ password123  │ outlet_admin  │");
  console.log("   │ driver@freshpress.com│ password123  │ driver        │");
  console.log("   │ worker@freshpress.com│ password123  │ worker        │");
  console.log("   └──────────────────────┴──────────────┴───────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
