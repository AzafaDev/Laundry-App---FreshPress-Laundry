// Admin order controller — list + detail + process
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { OrderStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyCustomer } from "../../lib/notification.js";
import { emitToUser } from "../../lib/socket.js";
import { buildPagination, getSkipTake } from "../../utils/pagination.js";

const ORDER_STATUSES = Object.values(OrderStatus);

const listOrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]).optional(),
  outlet_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.enum(["created_at", "updated_at"]).optional().default("created_at"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

const processOrderSchema = z.object({
  total_weight_kg: z.coerce
    .number()
    .positive("Berat harus lebih dari 0.")
    .max(999.99, "Berat maksimal 999.99 kg."),
  items: z
    .array(
      z.object({
        laundry_item_id: z.string().uuid("laundry_item_id harus UUID."),
        quantity: z.coerce.number().int().positive("Quantity harus lebih dari 0."),
      }),
    )
    .min(1, "Minimal satu item harus diisi."),
  breakdown: z
    .array(
      z.object({
        clothing_type_id: z.string().uuid("clothing_type_id harus UUID."),
        quantity: z.coerce.number().int().positive("Quantity harus lebih dari 0."),
      }),
    )
    .optional(),
  notes: z.string().optional(),
});

// ── List orders ───────────────────────────────────────────────────────────────
export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = listOrderQuerySchema.parse(req.query);
    const { skip, take } = getSkipTake(q);

    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId: string | undefined = isOutletAdmin
      ? (req.user?.outletId ?? undefined)
      : q.outlet_id;

    const where = {
      deleted_at: null,
      ...(outletId !== undefined && { outlet_id: outletId }),
      ...(q.status !== undefined && { status: q.status }),
      ...(q.date_from || q.date_to
        ? {
            created_at: {
              ...(q.date_from && { gte: new Date(q.date_from) }),
              ...(q.date_to && { lte: new Date(q.date_to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { [q.sort_by]: q.sort_dir },
        skip,
        take,
        select: {
          id: true,
          invoice_number: true,
          status: true,
          pickup_schedule: true,
          total_weight_kg: true,
          total_price: true,
          created_at: true,
          updated_at: true,
          customer: { select: { id: true, full_name: true, email: true, phone: true } },
          outlet: { select: { id: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
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

// ── Get order detail ──────────────────────────────────────────────────────────
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId: string | undefined = req.user?.outletId ?? undefined;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(isOutletAdmin && outletId ? { outlet_id: outletId } : {}),
      },
      include: {
        customer: { select: { id: true, full_name: true, email: true, phone: true } },
        outlet: { select: { id: true, name: true } },
        pickup_address: true,
        order_items: {
          include: {
            laundry_item: { select: { id: true, name: true, unit: true } },
          },
        },
        status_histories: { orderBy: { created_at: "asc" } },
        process_logs: {
          orderBy: { created_at: "asc" },
          include: {
            employee: { select: { id: true, full_name: true, role: true } },
          },
        },
        driver_tasks: {
          orderBy: { created_at: "asc" },
          include: {
            driver: { select: { id: true, full_name: true } },
          },
        },
        payment: true,
      },
    });

    if (!order) return next(new AppError("Order tidak ditemukan.", 404));
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ── Process order (outlet admin: input weight + items → advance to washing) ───
export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const outletId: string | undefined = req.user?.outletId ?? undefined;
    const adminId = req.user?.userId;

    const body = processOrderSchema.parse(req.body);

    // Fetch order and verify it belongs to this outlet and is in the right status
    const order = await prisma.order.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(outletId ? { outlet_id: outletId } : {}),
      },
    });

    if (!order) return next(new AppError("Order tidak ditemukan.", 404));
    if (order.status !== OrderStatus.laundry_arrived_outlet) {
      return next(
        new AppError(
          `Order harus berstatus 'laundry_arrived_outlet'. Status saat ini: ${order.status}.`,
          422,
        ),
      );
    }
    if ((await prisma.orderItem.count({ where: { order_id: id } })) > 0) {
      return next(new AppError("Order ini sudah diproses sebelumnya.", 409));
    }

    // Fetch all requested laundry items to get current prices
    const laundryItemIds = body.items.map((i) => i.laundry_item_id);
    const laundryItems = await prisma.laundryItem.findMany({
      where: { id: { in: laundryItemIds }, deleted_at: null, is_active: true },
    });

    if (laundryItems.length !== laundryItemIds.length) {
      return next(new AppError("Satu atau lebih laundry item tidak valid atau tidak aktif.", 422));
    }

    const itemMap = new Map(laundryItems.map((li) => [li.id, li]));

    // Calculate total price:
    // - kg items:  base_price × quantity  (quantity = weight in kg)
    // - pcs items: base_price × quantity
    let totalPrice = 0;
    const orderItemsData = body.items.map((item) => {
      const li = itemMap.get(item.laundry_item_id)!;
      const priceAtOrder = Number(li.base_price);
      totalPrice += priceAtOrder * item.quantity;
      return {
        order_id: id,
        laundry_item_id: item.laundry_item_id,
        quantity: item.quantity,
        price_at_order: priceAtOrder,
      };
    });

    // Transactionally: create items, save breakdown, update order, log status change
    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.createMany({ data: orderItemsData });

      // Save clothing-type breakdown if provided
      if (body.breakdown && body.breakdown.length > 0) {
        await tx.orderItemBreakdown.createMany({
          data: body.breakdown.map((b) => ({
            order_id: id,
            clothing_type_id: b.clothing_type_id,
            quantity: b.quantity,
            created_by: adminId!,
          })),
          skipDuplicates: true,
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          total_weight_kg: body.total_weight_kg,
          total_price: totalPrice + Number(order.delivery_fee),
          notes: body.notes,
          created_by_outlet_admin_id: adminId,
          status: OrderStatus.washing,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: id,
          old_status: OrderStatus.laundry_arrived_outlet,
          new_status: OrderStatus.washing,
          changed_by_type: "outlet_admin",
          changed_by_id: adminId,
          note: "Order diproses oleh outlet admin.",
        },
      });

      return updatedOrder;
    });

    await notifyCustomer(
      updated.customer_id,
      "Detail pesanan telah diinput",
      `Outlet admin telah menginput detail item untuk pesanan ${updated.invoice_number}.`,
      "order_details",
      updated.id,
    );

    emitToUser(updated.customer_id, "order:status-updated", {
      orderId: updated.id,
      status: updated.status,
      total_price: Number(updated.total_price),
      delivery_fee: Number(updated.delivery_fee),
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
