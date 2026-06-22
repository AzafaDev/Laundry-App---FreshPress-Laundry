import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyCustomer } from "../../lib/notification.js";
import { calcEtaText } from "../../utils/distance.util.js";
import type { OrderStatus } from "../../../generated/prisma/client.js";
import type { DriverTaskDetail } from "../../repositories/driver-worker/driver.repository.js";

export async function emitClaimEvents(task: DriverTaskDetail, employeeId: string, driverName: string) {
  emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-claimed", {
    taskId: task.id,
    driverId: employeeId,
    order_id: task.order_id,
    task_type: task.task_type,
  });

  const outlet = task.order.outlet;
  const addr = task.order.pickup_address;
  const etaText =
    outlet?.latitude && outlet?.longitude && addr?.latitude && addr?.longitude
      ? calcEtaText(Number(outlet.latitude), Number(outlet.longitude), Number(addr.latitude), Number(addr.longitude))
      : null;
  const etaSuffix = etaText ? `, estimasi ${etaText}` : "";

  if (task.task_type === "pickup") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver dalam perjalanan",
      `Driver ${driverName} sedang menuju lokasi penjemputan${etaSuffix} untuk pesanan ${task.order.invoice_number}.`,
      "driver_pickup_started",
      task.order_id,
    );
  } else if (task.task_type === "delivery") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver dalam perjalanan",
      `Driver ${driverName} sedang mengantarkan pesanan ${task.order.invoice_number} ke lokasi Anda${etaSuffix}.`,
      "driver_delivery_started",
      task.order_id,
    );
  }
}

export async function emitCompleteEvents(
  task: { id: string; order_id: string; task_type: string; order: { outlet_id: string; customer_id: string } },
  employeeId: string,
  newOrderStatus: OrderStatus,
) {
  emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-completed", {
    taskId: task.id,
    taskType: task.task_type,
    orderId: task.order_id,
    driverId: employeeId,
    completedAt: new Date(),
  });

  emitToUser(task.order.customer_id, "order:status-updated", {
    orderId: task.order_id,
    status: newOrderStatus,
    message:
      task.task_type === "pickup"
        ? "Laundry Anda telah tiba di outlet dan akan segera diproses."
        : "Driver telah tiba di lokasi Anda dengan pesanan laundry Anda.",
  });

  if (task.task_type === "pickup") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver telah tiba di outlet",
      "Laundry Anda telah tiba di outlet dan akan segera diproses.",
      "driver_arrived_outlet",
      task.order_id,
    );
  } else if (task.task_type === "delivery") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver telah tiba",
      "Driver telah tiba di lokasi Anda dengan pesanan laundry Anda.",
      "driver_arrived_customer",
      task.order_id,
    );
  }
}

export function mapTaskHistoryItem(task: {
  id: string;
  task_type: string;
  status: string;
  taken_at: Date | null;
  completed_at: Date | null;
  order: {
    id: string;
    invoice_number: string;
    customer: { full_name: string; phone: string | null } | null;
    pickup_address: { address: string } | null;
  };
}) {
  return {
    id: task.id,
    task_type: task.task_type,
    status: task.status,
    taken_at: task.taken_at,
    completed_at: task.completed_at,
    order: {
      id: task.order.id,
      invoice_number: task.order.invoice_number,
      customer_name: task.order.customer?.full_name ?? null,
      customer_phone: task.order.customer?.phone ?? null,
      address: task.order.pickup_address?.address ?? null,
    },
  };
}

export function mapDriverTaskToActivePayload(task: {
  id: string;
  order_id: string;
  driver_id: string | null;
  task_type: string;
  status: string;
  taken_at: Date | null;
  created_at: Date;
  updated_at: Date;
  order: {
    id: string;
    invoice_number: string;
    outlet_id: string;
    customer_id: string;
    pickup_address: { address: string; latitude: any; longitude: any } | null;
    customer: { full_name: string; phone: string | null } | null;
    outlet: { latitude: any; longitude: any } | null;
  };
} | null) {
  return {
    hasActiveTask: !!task,
    task: task
      ? {
          id: task.id,
          order_id: task.order_id,
          driver_id: task.driver_id,
          task_type: task.task_type,
          status: task.status,
          taken_at: task.taken_at,
          created_at: task.created_at,
          updated_at: task.updated_at,
          order: task.order,
        }
      : null,
  };
}
