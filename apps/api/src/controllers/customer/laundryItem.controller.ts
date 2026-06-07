import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { prisma } from "../../lib/prisma.js";

export const listLaundryItems = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.laundryItem.findMany({
    where: { is_active: true, deleted_at: null },
    select: {
      id: true,
      name: true,
      description: true,
      unit: true,
      base_price: true,
    },
    orderBy: { name: "asc" },
  });

  ok(res, items, "Daftar laundry items berhasil diambil.");
});
