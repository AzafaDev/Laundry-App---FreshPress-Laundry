import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";
import { subDays, setHours, setMinutes } from "date-fns";

const SALT_ROUNDS = 12;

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function setTimeOfDay(date: Date, hours: number, minutes = 0) {
  return setHours(setMinutes(date, minutes), hours);
}

async function getOrCreateOutlet(data: any) {
  const existing = await prisma.outlet.findFirst({
    where: { name: data.name },
  });
  if (existing) return existing;
  return prisma.outlet.create({ data });
}

// === Fungsi random tanggal antara startDaysAgo dan endDaysAgo ===
function getRandomDateInRange(startDaysAgo: number, endDaysAgo: number): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const range = startDaysAgo - endDaysAgo;
  const randomDays = Math.floor(Math.random() * (range + 1));
  return subDays(today, endDaysAgo + randomDays);
}

// Generate check-in/out time berdasarkan shift dan status
const generateAttendanceTimes = (
  shift: any,
  date: Date,
  status: "on_time" | "late" | "absent",
) => {
  if (status === "absent") return { check_in_time: null, check_out_time: null };

  const startTime = shift.start_time;
  const endTime = shift.end_time;
  const checkIn = new Date(date);
  checkIn.setUTCHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0);
  const checkOut = new Date(date);
  checkOut.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);

  if (status === "late") {
    const lateMinutes = Math.floor(Math.random() * 25) + 5;
    checkIn.setUTCMinutes(checkIn.getUTCMinutes() + lateMinutes);
  }
  if (checkOut <= checkIn) {
    checkOut.setUTCHours(checkOut.getUTCHours() + 1);
  }
  return { check_in_time: checkIn, check_out_time: checkOut };
};

async function main() {
  console.log("🌱 Seeding database...");

  // ========== HAPUS SEMUA ATTENDANCE LAMA ==========
  console.log("🗑️ Menghapus semua data attendance yang ada...");
  await prisma.attendance.deleteMany({});
  console.log("✅ Attendance terhapus.\n");

  // ========== 1. Outlets ==========
  const outlet1 = await getOrCreateOutlet({
    name: "Downtown Hub",
    address: "Jl. Merdeka No. 123, Jakarta Pusat",
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    district: "Menteng",
    postal_code: "10110",
    latitude: -6.2,
    longitude: 106.816666,
    service_radius_km: 10.0,
    phone: "+6221 1234567",
    opening_time: new Date(1970, 0, 1, 8, 0, 0),
    closing_time: new Date(1970, 0, 1, 22, 0, 0),
    is_active: true,
  });

  const outlet2 = await getOrCreateOutlet({
    name: "Westside Branch",
    address: "Jl. Raya Kebon Jeruk No. 45, Jakarta Barat",
    province: "DKI Jakarta",
    city: "Jakarta Barat",
    district: "Kebon Jeruk",
    postal_code: "11530",
    latitude: -6.183333,
    longitude: 106.766667,
    service_radius_km: 8.0,
    phone: "+6221 7654321",
    opening_time: new Date(1970, 0, 1, 8, 0, 0),
    closing_time: new Date(1970, 0, 1, 22, 0, 0),
    is_active: true,
  });

  const defaultPassword = await hashPassword("Password123");

  // ========== 2. Employees (original) ==========
  const washingWorker = await prisma.employee.upsert({
    where: { email: "washing.worker@freshpress.com" },
    update: {},
    create: {
      email: "washing.worker@freshpress.com",
      full_name: "Joko Washing",
      phone: "081234567893",
      password_hash: defaultPassword,
      role: "washing_worker",
      outlet_id: outlet1.id,
      is_active: true,
      is_occupied: false,
    },
  });

  const ironingWorker = await prisma.employee.upsert({
    where: { email: "ironing.worker@freshpress.com" },
    update: {},
    create: {
      email: "ironing.worker@freshpress.com",
      full_name: "Susi Ironing",
      phone: "081234567894",
      password_hash: defaultPassword,
      role: "ironing_worker",
      outlet_id: outlet1.id,
      is_active: true,
      is_occupied: false,
    },
  });

  const packingWorker = await prisma.employee.upsert({
    where: { email: "packing.worker@freshpress.com" },
    update: {},
    create: {
      email: "packing.worker@freshpress.com",
      full_name: "Agus Packing",
      phone: "081234567895",
      password_hash: defaultPassword,
      role: "packing_worker",
      outlet_id: outlet2.id,
      is_active: true,
      is_occupied: false,
    },
  });

  const driver = await prisma.employee.upsert({
    where: { email: "driver@freshpress.com" },
    update: {},
    create: {
      email: "driver@freshpress.com",
      full_name: "Bambang Driver",
      phone: "081234567896",
      password_hash: defaultPassword,
      role: "driver",
      outlet_id: outlet1.id,
      is_active: true,
      is_occupied: false,
    },
  });

  // ========== 3. WorkShifts ==========
  const morningShift = await prisma.workShift.upsert({
    where: { name: "Morning" },
    update: {},
    create: {
      name: "Morning",
      start_time: new Date(1970, 0, 1, 8, 0, 0),
      end_time: new Date(1970, 0, 1, 16, 0, 0),
      description: "Shift pagi 08:00 - 16:00",
      is_active: true,
    },
  });

  const afternoonShift = await prisma.workShift.upsert({
    where: { name: "Afternoon" },
    update: {},
    create: {
      name: "Afternoon",
      start_time: new Date(1970, 0, 1, 14, 0, 0),
      end_time: new Date(1970, 0, 1, 22, 0, 0),
      description: "Shift siang 14:00 - 22:00",
      is_active: true,
    },
  });

  const nightShift = await prisma.workShift.upsert({
    where: { name: "Night" },
    update: {},
    create: {
      name: "Night",
      start_time: new Date(1970, 0, 1, 22, 0, 0),
      end_time: new Date(1970, 0, 1, 6, 0, 0),
      description: "Shift malam 22:00 - 06:00",
      is_active: true,
    },
  });

  const fullDayShift = await prisma.workShift.upsert({
    where: { name: "FullDay" },
    update: {},
    create: {
      name: "FullDay",
      start_time: new Date(1970, 0, 1, 0, 0, 0),
      end_time: new Date(1970, 0, 1, 23, 59, 59),
      description: "24 jam - Untuk demo check-in/check-out anytime",
      is_active: true,
    },
  });

  // ========== 4. Assign shift untuk karyawan asli (hanya Morning) ==========
  const assignShift = async (
    employeeId: string,
    shiftId: string,
    outletId: string,
    dayOfWeek: number,
  ) => {
    await prisma.employeeShift.upsert({
      where: {
        employee_id_shift_id_day_of_week: {
          employee_id: employeeId,
          shift_id: shiftId,
          day_of_week: dayOfWeek,
        },
      },
      update: {},
      create: {
        employee_id: employeeId,
        shift_id: shiftId,
        outlet_id: outletId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });
  };

  for (const emp of [washingWorker, ironingWorker, driver, packingWorker]) {
    for (let day = 1; day <= 5; day++) {
      await assignShift(emp.id, morningShift.id, emp.outlet_id!, day);
    }
  }

  // ========== 5. Buat attendance ACAK untuk karyawan asli ==========
  console.log(
    "📅 Membuat attendance acak untuk karyawan ASLI (12-27 record per orang)...",
  );
  const originalEmployees = [
    washingWorker,
    ironingWorker,
    driver,
    packingWorker,
  ];
  for (const emp of originalEmployees) {
    const shift = morningShift;
    const totalRecords = Math.floor(Math.random() * 15) + 12;
    let created = 0;
    for (let i = 0; i < totalRecords; i++) {
      const randomDate = getRandomDateInRange(90, 0);
      const dayOfWeek = randomDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // hanya weekday
      const statusRand = Math.random();
      let status: "on_time" | "late" | "absent";
      if (statusRand < 0.7) status = "on_time";
      else if (statusRand < 0.9) status = "late";
      else status = "absent";
      if (status === "absent") continue;

      const { check_in_time, check_out_time } = generateAttendanceTimes(
        shift,
        randomDate,
        status,
      );
      await prisma.attendance.upsert({
        where: { employee_id_date: { employee_id: emp.id, date: randomDate } },
        update: {},
        create: {
          employee_id: emp.id,
          outlet_id: emp.outlet_id!,
          date: randomDate,
          check_in_time,
          check_out_time,
          check_in_latitude: -6.2,
          check_in_longitude: 106.816666,
        },
      });
      created++;
      if (created === 1)
        console.log(
          `   Contoh tanggal untuk ${emp.full_name}: ${randomDate.toISOString().slice(0, 10)}`,
        );
    }
    console.log(
      `   ✅ ${emp.full_name} -> ${created} record attendance (bervariasi)`,
    );
  }

  // ========== 6. Buat employee testing (12 orang) dengan shift sesuai nama ==========
  console.log("\n🧪 Membuat 12 employee testing dengan attendance acak...");
  const targetOutlet = outlet1;
  const roles = [
    "driver",
    "washing_worker",
    "ironing_worker",
    "packing_worker",
  ] as const;
  type ShiftType = "Morning" | "Afternoon" | "Night";
  const shiftMap = {
    Morning: morningShift,
    Afternoon: afternoonShift,
    Night: nightShift,
  };

  const getEmail = (role: string, shift: ShiftType) =>
    `${role}.${shift.toLowerCase()}@freshpress.com`;
  const getFullName = (role: string, shift: ShiftType) => {
    const map: Record<string, string> = {
      driver: "Driver",
      washing_worker: "Washing Worker",
      ironing_worker: "Ironing Worker",
      packing_worker: "Packing Worker",
    };
    return `${map[role]} (${shift})`;
  };

  const testEmployees = [];
  for (const role of roles) {
    for (const shiftName of ["Morning", "Afternoon", "Night"] as ShiftType[]) {
      const email = getEmail(role, shiftName);
      const fullName = getFullName(role, shiftName);
      const shift = shiftMap[shiftName];
      const employee = await prisma.employee.upsert({
        where: { email },
        update: {},
        create: {
          email,
          full_name: fullName,
          phone: `08123456789${Math.floor(Math.random() * 100)}`,
          password_hash: await hashPassword("Password123"),
          role: role as any,
          outlet_id: targetOutlet.id,
          is_active: true,
          is_occupied: false,
        },
      });
      for (let day = 1; day <= 5; day++) {
        await assignShift(employee.id, shift.id, targetOutlet.id, day);
      }
      testEmployees.push({ employee, shift });
      console.log(`   ✅ Created ${fullName}`);
    }
  }

  // ========== 7. Attendance acak untuk testing employees ==========
  for (const { employee, shift } of testEmployees) {
    const totalRecords = Math.floor(Math.random() * 15) + 12;
    let created = 0;
    for (let i = 0; i < totalRecords; i++) {
      const randomDate = getRandomDateInRange(90, 0);
      const dayOfWeek = randomDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const statusRand = Math.random();
      let status: "on_time" | "late" | "absent";
      if (statusRand < 0.7) status = "on_time";
      else if (statusRand < 0.9) status = "late";
      else status = "absent";
      if (status === "absent") continue;

      const { check_in_time, check_out_time } = generateAttendanceTimes(
        shift,
        randomDate,
        status,
      );
      await prisma.attendance.upsert({
        where: {
          employee_id_date: { employee_id: employee.id, date: randomDate },
        },
        update: {},
        create: {
          employee_id: employee.id,
          outlet_id: targetOutlet.id,
          date: randomDate,
          check_in_time,
          check_out_time,
          check_in_latitude: -6.2,
          check_in_longitude: 106.816666,
        },
      });
      created++;
      if (created === 1)
        console.log(
          `   Contoh tanggal untuk ${employee.full_name}: ${randomDate.toISOString().slice(0, 10)}`,
        );
    }
    console.log(`   ✅ ${employee.full_name} -> ${created} record attendance`);
  }

  // ========== 8. Demo accounts with FullDay shift (for demo purposes) ==========
  console.log("\n🎭 Membuat akun demo dengan shift 24 jam...");
  const demoRoles = ["driver", "washing_worker", "ironing_worker", "packing_worker"];
  const roleNames = {
    driver: "Driver Demo",
    washing_worker: "Washing Worker Demo",
    ironing_worker: "Ironing Worker Demo",
    packing_worker: "Packing Worker Demo",
  };

  for (const role of demoRoles) {
    const email = `${role}.full_day@freshpress.com`;
    const fullName = roleNames[role as keyof typeof roleNames];
    const demoEmployee = await prisma.employee.upsert({
      where: { email },
      update: {},
      create: {
        email,
        full_name: fullName,
        phone: `081234567890`,
        password_hash: defaultPassword,
        role: role as any,
        outlet_id: outlet1.id,
        is_active: true,
        is_occupied: false,
      },
    });
    // Assign FullDay shift for all days
    for (let day = 1; day <= 5; day++) {
      await assignShift(demoEmployee.id, fullDayShift.id, outlet1.id, day);
    }
    console.log(`   ✅ Created ${fullName} (${email})`);
  }

  console.log(
    "\n✅ Seeding selesai! Attendance sekarang memiliki tanggal yang bervariasi (acak dalam 90 hari).",
  );
  console.log(
    "🔍 Silakan cek di database atau aplikasi, filter berdasarkan tanggal akan menunjukkan perbedaan.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
