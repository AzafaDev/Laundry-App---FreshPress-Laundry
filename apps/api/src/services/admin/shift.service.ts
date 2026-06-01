import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type {
  CreateWorkShiftInput,
  UpdateWorkShiftInput,
  AssignEmployeeShiftInput,
  ListWorkShiftQuery,
} from "../../validations/shift.validation.js";

// ── WorkShift CRUD ────────────────────────────────────────────────────────────

export const listWorkShifts = async (query: ListWorkShiftQuery) => {
  const { page, limit, is_active } = query;
  const skip = (page - 1) * limit;

  const where = is_active !== undefined ? { is_active } : {};

  const [items, total] = await Promise.all([
    prisma.workShift.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.workShift.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getWorkShiftById = async (id: string) => {
  const shift = await prisma.workShift.findUnique({ where: { id } });
  if (!shift) throw new AppError("Shift tidak ditemukan.", 404);
  return shift;
};

export const createWorkShift = async (input: CreateWorkShiftInput) => {
  const existing = await prisma.workShift.findUnique({
    where: { name: input.name },
  });
  if (existing) throw new AppError("Nama shift sudah digunakan.", 409);

  return prisma.workShift.create({
    data: {
      name: input.name,
      start_time: new Date(`1970-01-01T${input.start_time}:00Z`),
      end_time: new Date(`1970-01-01T${input.end_time}:00Z`),
      description: input.description,
      is_active: input.is_active ?? true,
    },
  });
};

export const updateWorkShift = async (
  id: string,
  input: UpdateWorkShiftInput,
) => {
  const existing = await prisma.workShift.findUnique({ where: { id } });
  if (!existing) throw new AppError("Shift tidak ditemukan.", 404);

  if (input.name && input.name !== existing.name) {
    const conflict = await prisma.workShift.findUnique({
      where: { name: input.name },
    });
    if (conflict) throw new AppError("Nama shift sudah digunakan.", 409);
  }

  return prisma.workShift.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.start_time !== undefined && {
        start_time: new Date(`1970-01-01T${input.start_time}:00Z`),
      }),
      ...(input.end_time !== undefined && {
        end_time: new Date(`1970-01-01T${input.end_time}:00Z`),
      }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
  });
};

export const deleteWorkShift = async (id: string) => {
  const existing = await prisma.workShift.findUnique({ where: { id } });
  if (!existing) throw new AppError("Shift tidak ditemukan.", 404);

  return prisma.workShift.update({
    where: { id },
    data: { is_active: false },
  });
};

// ── EmployeeShift (assign shifts to employees) ────────────────────────────────

export const listEmployeeShifts = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deleted_at)
    throw new AppError("Employee tidak ditemukan.", 404);

  return prisma.employeeShift.findMany({
    where: { employee_id: employeeId },
    include: {
      shift: true,
      outlet: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ day_of_week: "asc" }],
  });
};

export const assignEmployeeShift = async (
  employeeId: string,
  input: AssignEmployeeShiftInput,
) => {
  const [employee, shift, outlet] = await Promise.all([
    prisma.employee.findUnique({ where: { id: employeeId } }),
    prisma.workShift.findUnique({ where: { id: input.shift_id } }),
    prisma.outlet.findUnique({ where: { id: input.outlet_id } }),
  ]);

  if (!employee || employee.deleted_at)
    throw new AppError("Employee tidak ditemukan.", 404);
  if (!shift) throw new AppError("Shift tidak ditemukan.", 404);
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);

  // Upsert: update is_active if combo already exists
  return prisma.employeeShift.upsert({
    where: {
      employee_id_shift_id_day_of_week: {
        employee_id: employeeId,
        shift_id: input.shift_id,
        day_of_week: input.day_of_week,
      },
    },
    update: { is_active: input.is_active ?? true, outlet_id: input.outlet_id },
    create: {
      employee_id: employeeId,
      shift_id: input.shift_id,
      outlet_id: input.outlet_id,
      day_of_week: input.day_of_week,
      is_active: input.is_active ?? true,
    },
  });
};

export const removeEmployeeShift = async (
  employeeId: string,
  employeeShiftId: string,
) => {
  const record = await prisma.employeeShift.findUnique({
    where: { id: employeeShiftId },
  });
  if (!record || record.employee_id !== employeeId)
    throw new AppError("Jadwal shift tidak ditemukan.", 404);

  return prisma.employeeShift.update({
    where: { id: employeeShiftId },
    data: { is_active: false },
  });
};
