import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { workerService } from "../../services/driver-worker/worker.service.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { requireUserId } from "../../utils/asyncHandler.js";
import {
  MAX_BYPASS_PHOTO_SIZE_BYTES,
  MAX_BYPASS_PHOTO_COUNT,
  ALLOWED_BYPASS_PHOTO_MIME_TYPES,
} from "../../config/constants.js";
import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const bypassPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYPASS_PHOTO_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_BYPASS_PHOTO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Format foto tidak didukung. Gunakan jpg atau png.", 422));
    }
  },
});

export const uploadBypassPhotosMiddleware = bypassPhotoUpload.array("photo_evidence", MAX_BYPASS_PHOTO_COUNT);

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
    const employeeId = requireUserId(req);
    const station = req.params.station as string;
    if (!station) throw new AppError("Invalid request", 400);
    assertStationAccess(req.user!.role, station);
    const orders = await workerService.getStationOrders(employeeId, station);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

export const submitItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = requireUserId(req);

    const station = req.params.station as string;
    const orderId = req.params.orderId as string;
    assertStationAccess(req.user!.role, station);

    const { actual_items, actual_satuan_items } = req.body as {
      actual_items: { clothing_type_id: string; actual_quantity: number }[];
      actual_satuan_items?: { laundry_item_id: string; actual_quantity: number }[];
    };
    if (!Array.isArray(actual_items)) throw new AppError("actual_items harus berupa array", 400);

    const result = await workerService.submitItems(employeeId, station, orderId, actual_items, actual_satuan_items ?? []);

    if ("requiresBypass" in result) {
      return res.status(409).json(result);
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const createBypassRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = requireUserId(req);

    const station = ROLE_TO_STATION[req.user!.role];
    if (!station) throw new AppError("Role Anda tidak memiliki akses bypass", 403);

    const { order_id, discrepancy_description, actual_items, actual_satuan_items } = req.body as {
      order_id: string;
      discrepancy_description: string;
      actual_items: string;
      actual_satuan_items?: string;
    };

    if (!order_id) throw new AppError("order_id wajib diisi", 400);
    if (!discrepancy_description) throw new AppError("discrepancy_description wajib diisi", 400);
    if (!actual_items) throw new AppError("actual_items wajib diisi", 400);

    let parsedActualItems: { clothing_type_id: string; actual_quantity: number }[];
    try {
      parsedActualItems = JSON.parse(actual_items);
    } catch {
      throw new AppError("actual_items harus berupa JSON string yang valid", 400);
    }
    if (!Array.isArray(parsedActualItems)) throw new AppError("actual_items harus berupa array", 400);

    let parsedSatuanItems: { laundry_item_id: string; actual_quantity: number }[] = [];
    if (actual_satuan_items) {
      try {
        parsedSatuanItems = JSON.parse(actual_satuan_items);
      } catch {
        throw new AppError("actual_satuan_items harus berupa JSON string yang valid", 400);
      }
      if (!Array.isArray(parsedSatuanItems)) throw new AppError("actual_satuan_items harus berupa array", 400);
    }

    const files = (req.files as Express.Multer.File[]) ?? [];

    if (files.length > 0 && !env.CLOUDINARY_CLOUD_NAME) throw new AppError("Upload foto belum dikonfigurasi.", 501);

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const uploaded = await cloudinary.uploader.upload(base64, {
          folder: "freshpress/bypass-evidence",
        });
        return uploaded.secure_url;
      }),
    );

    const result = await workerService.createBypassRequest(
      employeeId,
      station,
      order_id,
      discrepancy_description,
      parsedActualItems,
      parsedSatuanItems,
      photoUrls,
    );

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const completeStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = requireUserId(req);
    const station = req.params.station as string;
    const orderId = req.params.orderId as string;
    assertStationAccess(req.user!.role, station);

    const result = await workerService.completeStation(employeeId, station, orderId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getBypassForOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = requireUserId(req);
    const orderId = req.params.orderId as string;
    const bypass = await workerService.getBypassForOrder(employeeId, orderId);
    res.json({ success: true, data: bypass });
  } catch (err) {
    next(err);
  }
};