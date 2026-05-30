import { Request, Response, NextFunction } from "express";
import { workerService } from "../../services/driver-worker/index.js";
import { AppError } from "../../middlewares/error.middleware.js";

const ROLE_TO_STATION: Record<string, "washing" | "ironing" | "packing"> = {
  washing_worker: "washing",
  ironing_worker: "ironing",
  packing_worker: "packing",
};

function assertStationAccess(role: string, station: string): asserts station is "washing" | "ironing" | "packing" {
  const allowed = ROLE_TO_STATION[role];
  if (!allowed || allowed !== station) {
    throw new AppError("Anda tidak memiliki akses ke station ini", 403);
  }
}

export const getStationOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    const station = req.params.station as string;
    if (!employeeId || !station) throw new AppError("Invalid request", 400);
    assertStationAccess(req.user!.role, station);
    const orders = await workerService.getStationOrders(employeeId, station);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

export const completeStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const station = req.params.station as string;
    const orderId = req.params.orderId as string;
    assertStationAccess(req.user!.role, station);

    const result = await workerService.completeStation(employeeId, station, orderId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};