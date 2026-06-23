// Admin laundry-item controller — CRUD with soft delete
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  listLaundryItemQuerySchema,
  createLaundryItemSchema,
  updateLaundryItemSchema,
} from "../../validations/laundryItem.validation.js";
import { buildPagination, getSkipTake } from "../../utils/pagination.js";

// ── List ──────────────────────────────────────────────────────────────────────
export const listLaundryItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = listLaundryItemQuerySchema.parse(req.query);
    const { skip, take } = getSkipTake(q);

    const includeDeleted = req.query.include_deleted === "true";
    const where = {
      ...(includeDeleted ? {} : { deleted_at: null }),
      ...(q.is_active !== undefined && { is_active: q.is_active }),
      ...(q.search && {
        name: { contains: q.search, mode: "insensitive" as const },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.laundryItem.findMany({
        where,
        orderBy: { [q.sort_by]: q.sort_dir },
        skip,
        take,
      }),
      prisma.laundryItem.count({ where }),
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
export const getLaundryItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await prisma.laundryItem.findFirst({
      where: { id, deleted_at: null },
    });
    if (!item) return next(new AppError("Laundry item tidak ditemukan.", 404));
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Create ────────────────────────────────────────────────────────────────────
export const createLaundryItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createLaundryItemSchema.parse(req.body);

    const exists = await prisma.laundryItem.findFirst({
      where: { name: body.name, deleted_at: null },
    });
    if (exists) return next(new AppError("Nama item sudah ada.", 409));

    const item = await prisma.laundryItem.create({
      data: {
        name: body.name,
        description: body.description,
        unit: body.unit,
        base_price: body.base_price,
        is_active: body.is_active,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updateLaundryItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = updateLaundryItemSchema.parse(req.body);

    const existing = await prisma.laundryItem.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) return next(new AppError("Laundry item tidak ditemukan.", 404));

    if (body.name && body.name !== existing.name) {
      const dup = await prisma.laundryItem.findFirst({
        where: { name: body.name, deleted_at: null },
      });
      if (dup) return next(new AppError("Nama item sudah ada.", 409));
    }

    const item = await prisma.laundryItem.update({
      where: { id },
      data: body,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Hard delete ───────────────────────────────────────────────────────────────
export const hardDeleteLaundryItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.laundryItem.findFirst({ where: { id } });
    if (!existing) return next(new AppError("Laundry item tidak ditemukan.", 404));
    if (!existing.deleted_at) return next(new AppError("Item harus dihapus terlebih dahulu sebelum dihapus permanen.", 400));

    await prisma.laundryItem.delete({ where: { id } });
    res.json({ success: true, data: { id }, message: "Item dihapus permanen." });
  } catch (err) {
    next(err);
  }
};

// ── Soft delete ───────────────────────────────────────────────────────────────
export const deleteLaundryItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.laundryItem.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) return next(new AppError("Laundry item tidak ditemukan.", 404));

    const item = await prisma.laundryItem.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};
