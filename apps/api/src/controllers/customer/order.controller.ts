import type { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import * as OrderService from "../../services/customer/order.service.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  MAX_COMPLAINT_PHOTO_SIZE_BYTES,
  MAX_COMPLAINT_PHOTO_COUNT,
  ALLOWED_COMPLAINT_PHOTO_MIME_TYPES,
} from "../../config/constants.js";
import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const complaintPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COMPLAINT_PHOTO_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_COMPLAINT_PHOTO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Format foto tidak didukung. Gunakan jpg, png, atau webp.", 422));
    }
  },
});

export const uploadComplaintPhotosMiddleware = complaintPhotoUpload.array("photos", MAX_COMPLAINT_PHOTO_COUNT);

function getParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const order = await OrderService.createCustomerOrder(customerId, req.body);
  created(res, order, "Order pickup berhasil dibuat.");
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const { status, search, date_from, date_to, page, limit } = req.query as Record<string, string | undefined>;
  const result = await OrderService.listCustomerOrders(customerId, {
    status: status || undefined,
    search: search || undefined,
    date_from: date_from || undefined,
    date_to: date_to || undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  ok(res, result, "Daftar order berhasil diambil.");
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.id);
  const order = await OrderService.getCustomerOrderById(customerId, orderId);
  ok(res, order, "Detail order berhasil diambil.");
});

export const completeOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.id);
  const order = await OrderService.completeCustomerOrder(customerId, orderId);
  ok(res, order, "Pesanan berhasil diselesaikan.");
});

export const createComplaint = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.id);

  const files = req.files as Express.Multer.File[] | undefined;
  let photoUrls: string[] = [];

  if (files && files.length > 0) {
    photoUrls = await Promise.all(
      files.map((file) => {
        const b64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        return cloudinary.uploader
          .upload(b64, { folder: "freshpress/complaint-photos" })
          .then((r) => r.secure_url);
      }),
    );
  }

  const complaint = await OrderService.createCustomerComplaint(customerId, orderId, {
    ...req.body,
    photo_urls: photoUrls,
  });
  created(res, complaint, "Komplain berhasil diajukan.");
});
