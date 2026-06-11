// Admin clothing-type controller — CRUD for master data jenis pakaian
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { buildPagination, getSkipTake } from "../../utils/pagination.js";

// ── Schemas ───────────────────────────────────────────────────────────────────
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  search: z.string().optional(),
  is_active: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  sort_dir: z.enum(["asc", "desc"]).default("asc"),
});

const createSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  is_active: z.boolean().default(true),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  is_active: z.boolean().optional(),
});

// ── List ──────────────────────────────────────────────────────────────────────
export const listClothingTypes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = listQuerySchema.parse(req.query);
    const { skip, take } = getSkipTake(q);

    const where = {
      deleted_at: null,
      ...(q.is_active !== undefined && { is_active: q.is_active }),
      ...(q.search && { name: { contains: q.search, mode: "insensitive" as const } }),
    };

    const [items, total] = await Promise.all([
      prisma.clothingType.findMany({
        where,
        orderBy: { name: q.sort_dir },
        skip,
        take,
      }),
      prisma.clothingType.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: buildPagination(q.page, q.limit, total),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get one ───────────────────────────────────────────────────────────────────
export const getClothingType = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const item = await prisma.clothingType.findFirst({
      where: { id: req.params.id as string, deleted_at: null },
    });
    if (!item) return next(new AppError("Jenis pakaian tidak ditemukan.", 404));
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Create ────────────────────────────────────────────────────────────────────
export const createClothingType = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createSchema.parse(req.body);

    const exists = await prisma.clothingType.findFirst({
      where: { name: body.name, deleted_at: null },
    });
    if (exists) return next(new AppError("Nama jenis pakaian sudah ada.", 409));

    const item = await prisma.clothingType.create({ data: body });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updateClothingType = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = updateSchema.parse(req.body);

    const existing = await prisma.clothingType.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) return next(new AppError("Jenis pakaian tidak ditemukan.", 404));

    if (body.name && body.name !== existing.name) {
      const dup = await prisma.clothingType.findFirst({
        where: { name: body.name, deleted_at: null },
      });
      if (dup) return next(new AppError("Nama jenis pakaian sudah ada.", 409));
    }

    const item = await prisma.clothingType.update({ where: { id }, data: body });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Soft delete ───────────────────────────────────────────────────────────────
export const deleteClothingType = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.clothingType.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) return next(new AppError("Jenis pakaian tidak ditemukan.", 404));

    const item = await prisma.clothingType.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    res.json({ success: true, data: item, message: "Jenis pakaian dihapus." });
  } catch (err) {
    next(err);
  }
};
