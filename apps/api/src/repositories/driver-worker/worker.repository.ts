import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { OrderStatus, StationType } from "../../../generated/prisma/client.js";

export async function runCompleteStationTransaction(
  orderId: string,
  employeeId: string,
  station: "washing" | "ironing" | "packing",
  currentStatus: OrderStatus,
  finalStatus: OrderStatus,
  checkPendingBypass: boolean,
  actualItems?: { clothing_type_id: string; actual_quantity: number }[],
  bypassRequestId?: string,
) {
  await prisma.$transaction(async (tx) => {
    if (checkPendingBypass) {
      const pendingBypass = await tx.bypassRequest.findFirst({
        where: { order_id: orderId, station: station as StationType, status: "pending" },
      });
      if (pendingBypass) throw new AppError("Terdapat BypassRequest pending untuk order ini, tunggu review admin", 409);
    }

    const updateResult = await tx.order.updateMany({
      where: { id: orderId, status: currentStatus },
      data: { status: finalStatus },
    });
    if (updateResult.count === 0) throw new AppError(`Station ${station} sudah diproses`, 409);

    await tx.orderStatusHistory.create({
      data: {
        order_id: orderId,
        old_status: currentStatus,
        new_status: finalStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Station ${station} completed by worker`,
      },
    });

    await tx.processLog.create({
      data: {
        order_id: orderId,
        station: station as StationType,
        employee_id: employeeId,
        input_items: actualItems ?? [],
        completed_at: new Date(),
        is_bypassed: !!bypassRequestId,
        bypass_request_id: bypassRequestId ?? null,
      },
    });
  });
}
