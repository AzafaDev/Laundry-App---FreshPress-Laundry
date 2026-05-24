import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";
import { addDays, subDays, setHours, setMinutes } from "date-fns";

const SALT_ROUNDS = 12;

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function setTimeOfDay(date: Date, hours: number, minutes = 0) {
  return setHours(setMinutes(date, minutes), hours);
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Buat Outlets (biarkan UUID otomatis)
  const outlet1 = await prisma.outlet.create({
    data: {
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
      opening_time: new Date("1970-01-01T08:00:00Z"),
      closing_time: new Date("1970-01-01T22:00:00Z"),
      is_active: true,
    },
  });

  const outlet2 = await prisma.outlet.create({
    data: {
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
      opening_time: new Date("1970-01-01T08:00:00Z"),
      closing_time: new Date("1970-01-01T22:00:00Z"),
      is_active: true,
    },
  });

  const defaultPassword = await hashPassword("Password123");

  // 2. Employees (UUID otomatis)
  const superAdmin = await prisma.employee.create({
    data: {
      email: "admin@freshpress.com",
      full_name: "Super Admin",
      phone: "081234567890",
      password_hash: defaultPassword,
      role: "super_admin",
      outlet_id: null,
      is_active: true,
      is_occupied: false,
    },
  });

  const outletAdmin1 = await prisma.employee.create({
    data: {
      email: "outletadmin@downtown.com",
      full_name: "Budi Outlet Admin",
      phone: "081234567891",
      password_hash: defaultPassword,
      role: "outlet_admin",
      outlet_id: outlet1.id,
      is_active: true,
      is_occupied: false,
    },
  });

  const outletAdmin2 = await prisma.employee.create({
    data: {
      email: "outletadmin@westside.com",
      full_name: "Siti Outlet Admin",
      phone: "081234567892",
      password_hash: defaultPassword,
      role: "outlet_admin",
      outlet_id: outlet2.id,
      is_active: true,
      is_occupied: false,
    },
  });

  const washingWorker = await prisma.employee.create({
    data: {
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

  const ironingWorker = await prisma.employee.create({
    data: {
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

  const packingWorker = await prisma.employee.create({
    data: {
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

  const driver = await prisma.employee.create({
    data: {
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

  // 3. WorkShifts
  const morningShift = await prisma.workShift.create({
    data: {
      name: "Morning",
      start_time: new Date("1970-01-01T08:00:00Z"),
      end_time: new Date("1970-01-01T16:00:00Z"),
      description: "Shift pagi 08:00 - 16:00",
      is_active: true,
    },
  });

  const afternoonShift = await prisma.workShift.create({
    data: {
      name: "Afternoon",
      start_time: new Date("1970-01-01T14:00:00Z"),
      end_time: new Date("1970-01-01T22:00:00Z"),
      description: "Shift siang 14:00 - 22:00",
      is_active: true,
    },
  });

  const nightShift = await prisma.workShift.create({
    data: {
      name: "Night",
      start_time: new Date("1970-01-01T22:00:00Z"),
      end_time: new Date("1970-01-01T06:00:00Z"),
      description: "Shift malam 22:00 - 06:00",
      is_active: true,
    },
  });

  // 4. EmployeeShift (jadwal karyawan)
  const assignShift = async (
    employeeId: string,
    shiftId: string,
    outletId: string,
    dayOfWeek: number,
  ) => {
    await prisma.employeeShift.create({
      data: {
        employee_id: employeeId,
        shift_id: shiftId,
        outlet_id: outletId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });
  };

  const employeesOutlet1 = [washingWorker.id, ironingWorker.id, driver.id];
  for (const empId of employeesOutlet1) {
    for (let day = 1; day <= 5; day++) {
      await assignShift(empId, morningShift.id, outlet1.id, day);
    }
  }
  for (let day = 1; day <= 5; day++) {
    await assignShift(packingWorker.id, morningShift.id, outlet2.id, day);
  }

  // 5. Attendance records (3 hari terakhir)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);

  const createAttendance = async (
    employeeId: string,
    outletId: string,
    date: Date,
    checkInHour: number,
    checkOutHour: number,
  ) => {
    const checkIn = setTimeOfDay(date, checkInHour, 0);
    const checkOut = setTimeOfDay(date, checkOutHour, 0);
    await prisma.attendance.create({
      data: {
        employee_id: employeeId,
        outlet_id: outletId,
        date: date,
        check_in_time: checkIn,
        check_out_time: checkOut,
        check_in_latitude: -6.2,
        check_in_longitude: 106.816666,
      },
    });
  };

  await createAttendance(washingWorker.id, outlet1.id, twoDaysAgo, 8, 16);
  await createAttendance(washingWorker.id, outlet1.id, yesterday, 8, 16);
  await createAttendance(ironingWorker.id, outlet1.id, twoDaysAgo, 14, 22);
  await createAttendance(ironingWorker.id, outlet1.id, yesterday, 14, 22);
  await createAttendance(driver.id, outlet1.id, twoDaysAgo, 8, 16);
  await createAttendance(packingWorker.id, outlet2.id, twoDaysAgo, 8, 16);
  await createAttendance(packingWorker.id, outlet2.id, yesterday, 8, 16);

  // Sample keterlambatan
  await prisma.attendance.create({
    data: {
      employee_id: driver.id,
      outlet_id: outlet1.id,
      date: yesterday,
      check_in_time: setTimeOfDay(yesterday, 9, 15),
      check_out_time: setTimeOfDay(yesterday, 17, 0),
    },
  });

  console.log("✅ Seed selesai!");
  console.log(`📋 Data karyawan (password default: Password123):
    - Super Admin: admin@freshpress.com
    - Outlet Admin Downtown: outletadmin@downtown.com
    - Outlet Admin Westside: outletadmin@westside.com
    - Washing Worker: washing.worker@freshpress.com
    - Ironing Worker: ironing.worker@freshpress.com
    - Packing Worker: packing.worker@freshpress.com
    - Driver: driver@freshpress.com
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
