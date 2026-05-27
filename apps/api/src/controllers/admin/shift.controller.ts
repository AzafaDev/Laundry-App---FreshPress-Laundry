import type { Request, Response, NextFunction } from "express";
import * as ShiftService from "../../services/admin/shift.service.js";
import { listWorkShiftQuerySchema } from "../../validations/shift.validation.js";

// ── WorkShift CRUD ────────────────────────────────────────────────────────────

export const listWorkShifts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = listWorkShiftQuerySchema.parse(req.query);
    const result = await ShiftService.listWorkShifts(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getWorkShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shift = await ShiftService.getWorkShiftById(req.params.id as string);
    res.json({ success: true, data: shift });
  } catch (err) {
    next(err);
  }
};

export const createWorkShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shift = await ShiftService.createWorkShift(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    next(err);
  }
};

export const updateWorkShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shift = await ShiftService.updateWorkShift(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: shift });
  } catch (err) {
    next(err);
  }
};

export const deleteWorkShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shift = await ShiftService.deleteWorkShift(req.params.id as string);
    res.json({ success: true, data: shift, message: "Shift dinonaktifkan." });
  } catch (err) {
    next(err);
  }
};

// ── EmployeeShift ─────────────────────────────────────────────────────────────

export const listEmployeeShifts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const items = await ShiftService.listEmployeeShifts(
      req.params.id as string,
    );
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const assignEmployeeShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await ShiftService.assignEmployeeShift(
      req.params.id as string,
      req.body,
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const removeEmployeeShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await ShiftService.removeEmployeeShift(
      req.params.id as string,
      req.params.shiftRecordId as string,
    );
    res.json({ success: true, data: record, message: "Jadwal shift dihapus." });
  } catch (err) {
    next(err);
  }
};
