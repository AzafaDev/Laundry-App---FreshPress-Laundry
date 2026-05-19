// Admin outlet controller — CRUD + map-driven create + user assignment
import type { Request, Response, NextFunction } from "express";
import * as OutletService from "../../services/admin/outlet.service.js";
import { listOutletQuerySchema } from "../../validations/outlet.validation.js";

export const listOutlets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = listOutletQuerySchema.parse(req.query);
    const result = await OutletService.listOutlets(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const outlet = await OutletService.getOutletById(req.params.id as string);
    res.json({ success: true, data: outlet });
  } catch (err) {
    next(err);
  }
};

export const createOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const outlet = await OutletService.createOutlet(req.body);
    res.status(201).json({ success: true, data: outlet });
  } catch (err) {
    next(err);
  }
};

export const updateOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const outlet = await OutletService.updateOutlet(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: outlet });
  } catch (err) {
    next(err);
  }
};

export const deactivateOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const outlet = await OutletService.deactivateOutlet(
      req.params.id as string,
    );
    res.json({ success: true, data: outlet, message: "Outlet dinonaktifkan." });
  } catch (err) {
    next(err);
  }
};

export const assignUserToOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user_id } = req.body as { user_id: string };
    const result = await OutletService.assignUserToOutlet(
      req.params.id as string,
      user_id,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const searchAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = String(req.query.q ?? "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit ?? 5), 1), 10);
    if (q.length < 3) {
      res.json({ success: true, items: [] });
      return;
    }
    const items = await OutletService.searchAddress(q, limit);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const listAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const items = await OutletService.listOutletAssignments(
      req.params.id as string,
    );
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const unassignUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await OutletService.unassignUserFromOutlet(
      req.params.id as string,
      req.params.userId as string,
    );
    res.json({ success: true, data: result, message: "User di-unassign." });
  } catch (err) {
    next(err);
  }
};
