// Admin bypass controller — list, detail, approve / reject
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BypassStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { buildPagination, getSkipTake } from "../../utils/pagination.js";
import { emitToUser } from "../../lib/socket.js";
import { workerService } from "../../services/driver-worker/worker.service.js";

// ── Validation schemas ────────────────────────────────────────────────────────
const listBypassQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  outlet_id: z.string().uuid().optional(),
  sort_dir: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
});

const reviewBypassSchema = z.object({
  action: z.enum(["approve", "reject"]),
  admin_notes: z.string().optional(),
});

// ── List bypass requests ──────────────────────────────────────────────────────
export const listBypassRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = listBypassQuerySchema.parse(req.query);
    const { skip, take } = getSkipTake(q);

    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId: string | undefined = isOutletAdmin
      ? (req.user?.outletId ?? undefined)
      : q.outlet_id;

    const where = {
      ...(q.status !== undefined && { status: q.status as BypassStatus }),
      ...(outletId !== undefined && { order: { outlet_id: outletId } }),
      ...(q.search && {
        OR: [
          { order: { invoice_number: { contains: q.search, mode: "insensitive" as const } } },
          { requester: { full_name: { contains: q.search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.bypassRequest.findMany({
        where,
        orderBy: { created_at: q.sort_dir },
        skip,
        take,
        include: {
          order: {
            select: {
              id: true,
              invoice_number: true,
              outlet: { select: { id: true, name: true } },
            },
          },
          requester: {
            select: { id: true, full_name: true, role: true },
          },
          reviewer: {
            select: { id: true, full_name: true },
          },
        },
      }),
      prisma.bypassRequest.count({ where }),
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

// ── Get single bypass request ─────────────────────────────────────────────────
export const getBypassRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId: string | undefined = req.user?.outletId ?? undefined;

    const item = await prisma.bypassRequest.findFirst({
      where: {
        id,
        ...(isOutletAdmin && outletId
          ? { order: { outlet_id: outletId } }
          : {}),
      },
      include: {
        order: {
          select: {
            id: true,
            invoice_number: true,
            outlet: { select: { id: true, name: true } },
            order_items: {
              include: {
                laundry_item: { select: { id: true, name: true, unit: true } },
              },
            },
          },
        },
        requester: {
          select: { id: true, full_name: true, role: true },
        },
        reviewer: {
          select: { id: true, full_name: true },
        },
      },
    });

    if (!item) {
      return next(new AppError("Bypass request tidak ditemukan.", 404));
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ── Review bypass request (approve / reject) ──────────────────────────────────
export const reviewBypassRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const adminId = req.user?.userId;
    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId: string | undefined = req.user?.outletId ?? undefined;

    const body = reviewBypassSchema.parse(req.body);

    const bypass = await prisma.bypassRequest.findFirst({
      where: {
        id,
        ...(isOutletAdmin && outletId
          ? { order: { outlet_id: outletId } }
          : {}),
      },
      include: {
        order: { select: { id: true, status: true } },
      },
    });

    if (!bypass) {
      return next(new AppError("Bypass request tidak ditemukan.", 404));
    }

    if (bypass.status !== BypassStatus.pending) {
      return next(
        new AppError(
          `Bypass request ini sudah di-review (${bypass.status}).`,
          422,
        ),
      );
    }

    const newStatus =
      body.action === "approve" ? BypassStatus.approved : BypassStatus.rejected;

    const updated = await prisma.bypassRequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewed_by: adminId,
        admin_notes: body.admin_notes ?? null,
        resolved_at: new Date(),
      },
      include: {
        order: { select: { id: true, invoice_number: true } },
        requester: { select: { id: true, full_name: true, role: true } },
        reviewer: { select: { id: true, full_name: true } },
      },
    });

    // On approve: auto-complete the station using the saved actual_items
    if (body.action === "approve") {
      const bypassWithItems = await prisma.bypassRequest.findUnique({
        where: { id },
        select: { station: true, requested_by: true, actual_items: true, order_id: true },
      });
      if (bypassWithItems) {
        const actualItems = (bypassWithItems.actual_items ?? []) as {
          clothing_type_id: string;
          actual_quantity: number;
        }[];
        await workerService.completeStationAfterBypass(
          bypassWithItems.station as "washing" | "ironing" | "packing",
          bypassWithItems.order_id,
          bypassWithItems.requested_by,
          actualItems,
          id,
        );
      }
    }

    // Notify the requesting worker via WebSocket
    emitToUser(bypass.requested_by, body.action === "approve" ? "bypass:approved" : "bypass:rejected", {
      bypassId: id,
      orderId: updated.order.id,
      invoiceNumber: updated.order.invoice_number,
      admin_notes: body.admin_notes ?? null,
    });

    const action = body.action === "approve" ? "disetujui" : "ditolak";
    res.json({
      success: true,
      data: updated,
      message: `Bypass request berhasil ${action}.`,
    });
  } catch (err) {
    next(err);
  }
};
