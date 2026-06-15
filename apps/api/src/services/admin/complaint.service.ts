import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyCustomer } from "../../lib/notification.js";

export type ComplaintStatusUpdate = "in_progress" | "resolved" | "rejected";

export interface ListComplaintsOptions {
  status?: string;
  outletId?: string; // if provided, scope to this outlet only
  search?: string;
  page?: number;
  limit?: number;
}

export const listComplaints = async (options: ListComplaintsOptions) => {
  const { status, outletId, search, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where: Parameters<typeof prisma.complaint.findMany>[0]["where"] = {};

  if (status) where.status = status as never;

  if (outletId) {
    where.order = { outlet_id: outletId };
  }

  if (search) {
    where.OR = [
      { order: { invoice_number: { contains: search, mode: "insensitive" } } },
      { customer: { full_name: { contains: search, mode: "insensitive" } } },
      { complaint_type: { contains: search, mode: "insensitive" } },
    ];
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        order: { select: { id: true, invoice_number: true, outlet_id: true, outlet: { select: { name: true } } } },
        customer: { select: { id: true, full_name: true, email: true, phone: true } },
        resolver: { select: { id: true, full_name: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getComplaintStats = async (outletId?: string) => {
  const baseWhere = outletId ? { order: { outlet_id: outletId } } : {};

  const [open, in_progress, resolved, rejected] = await Promise.all([
    prisma.complaint.count({ where: { ...baseWhere, status: "open" } }),
    prisma.complaint.count({ where: { ...baseWhere, status: "in_progress" } }),
    prisma.complaint.count({ where: { ...baseWhere, status: "resolved" } }),
    prisma.complaint.count({ where: { ...baseWhere, status: "rejected" } }),
  ]);

  return { open, in_progress, resolved, rejected };
};

export const getComplaint = async (complaintId: string, outletId?: string) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      order: { select: { id: true, invoice_number: true, outlet_id: true, outlet: { select: { name: true } } } },
      customer: { select: { id: true, full_name: true, email: true, phone: true } },
      resolver: { select: { id: true, full_name: true } },
    },
  });

  if (!complaint) throw new AppError("Complaint tidak ditemukan.", 404);

  // outlet_admin scope check
  if (outletId && complaint.order.outlet_id !== outletId) {
    throw new AppError("Complaint ini bukan dari outlet Anda.", 403);
  }

  return complaint;
};

export const updateComplaintStatus = async (
  complaintId: string,
  employeeId: string,
  newStatus: ComplaintStatusUpdate,
  resolutionNotes?: string,
  expectedResolutionDate?: string,
  outletId?: string,
) => {
  const complaint = await getComplaint(complaintId, outletId);

  // Validate state transitions
  const validTransitions: Record<string, ComplaintStatusUpdate[]> = {
    open: ["in_progress", "rejected"],
    in_progress: ["resolved", "rejected"],
  };

  const allowed = validTransitions[complaint.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Tidak dapat mengubah status dari ${complaint.status} ke ${newStatus}.`,
      400,
    );
  }

  const updateData: Parameters<typeof prisma.complaint.update>[0]["data"] = {
    status: newStatus,
    updated_at: new Date(),
  };

  if (newStatus === "in_progress") {
    if (expectedResolutionDate) {
      updateData.expected_resolution_date = new Date(expectedResolutionDate);
    }
    if (resolutionNotes) updateData.resolution_notes = resolutionNotes;
  }

  if (newStatus === "resolved" || newStatus === "rejected") {
    updateData.resolved_by = employeeId;
    updateData.resolved_at = new Date();
    if (resolutionNotes) updateData.resolution_notes = resolutionNotes;
  }

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: updateData,
  });

  // Notify customer
  const invoiceNumber = complaint.order.invoice_number;
  const customerId = complaint.customer_id;

  if (newStatus === "in_progress") {
    await notifyCustomer(
      customerId,
      "Komplain Sedang Ditangani",
      `Komplain Anda untuk pesanan ${invoiceNumber} sedang dalam proses penanganan oleh tim kami.`,
      "order_update",
      complaintId,
    );
  } else if (newStatus === "resolved") {
    await notifyCustomer(
      customerId,
      "Komplain Diselesaikan",
      `Komplain Anda untuk pesanan ${invoiceNumber} telah diselesaikan. ${resolutionNotes ? `Catatan: ${resolutionNotes}` : ""}`.trim(),
      "order_update",
      complaintId,
    );
  } else if (newStatus === "rejected") {
    await notifyCustomer(
      customerId,
      "Komplain Ditolak",
      `Komplain Anda untuk pesanan ${invoiceNumber} tidak dapat diproses. ${resolutionNotes ? `Alasan: ${resolutionNotes}` : ""}`.trim(),
      "order_update",
      complaintId,
    );
  }

  return updated;
};
