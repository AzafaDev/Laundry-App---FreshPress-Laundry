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
