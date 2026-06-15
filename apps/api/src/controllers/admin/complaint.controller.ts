import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import * as ComplaintService from "../../services/admin/complaint.service.js";

export const listComplaints = asyncHandler(async (req: Request, res: Response) => {
  const { role, userId, outletId } = req.user!;
  const { status, search, page, limit } = req.query;

  const result = await ComplaintService.listComplaints({
    status: status as string | undefined,
    outletId: role === "outlet_admin" ? (outletId ?? undefined) : (req.query.outlet_id as string | undefined),
    search: search as string | undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  ok(res, result, "Daftar komplain berhasil diambil.");
});

export const getComplaintStats = asyncHandler(async (req: Request, res: Response) => {
  const { role, outletId } = req.user!;

  const stats = await ComplaintService.getComplaintStats(
    role === "outlet_admin" ? (outletId ?? undefined) : (req.query.outlet_id as string | undefined),
  );

  ok(res, stats, "Statistik komplain berhasil diambil.");
});

export const getComplaint = asyncHandler(async (req: Request, res: Response) => {
  const { role, outletId } = req.user!;
  const { id } = req.params;

  const complaint = await ComplaintService.getComplaint(
    id,
    role === "outlet_admin" ? (outletId ?? undefined) : undefined,
  );

  ok(res, complaint, "Detail komplain berhasil diambil.");
});

export const updateComplaintStatus = asyncHandler(async (req: Request, res: Response) => {
  const { role, userId, outletId } = req.user!;
  const { id } = req.params;
  const { status, resolution_notes, expected_resolution_date } = req.body as {
    status: "in_progress" | "resolved" | "rejected";
    resolution_notes?: string;
    expected_resolution_date?: string;
  };

  const updated = await ComplaintService.updateComplaintStatus(
    id,
    userId,
    status,
    resolution_notes,
    expected_resolution_date,
    role === "outlet_admin" ? (outletId ?? undefined) : undefined,
  );

  ok(res, updated, "Status komplain berhasil diperbarui.");
});
