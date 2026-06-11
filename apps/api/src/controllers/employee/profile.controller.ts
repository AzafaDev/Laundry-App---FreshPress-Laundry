import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../../middlewares/error.middleware.js";
import { MAX_AVATAR_SIZE_BYTES, ALLOWED_AVATAR_MIME_TYPES } from "../../config/constants.js";
import { getProfile, updateProfile, updateAvatar } from "../../services/employee/profile.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Format file tidak didukung. Gunakan jpg, jpeg, png, atau gif.", 422));
    }
  },
});

export const uploadAvatarMiddleware = upload.single("avatar");

export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getProfile(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body;
    const result = await updateProfile(req.user!.userId, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) throw new AppError("File tidak ditemukan.", 400);

    const { env } = await import("../../config/env.js");
    if (!env.CLOUDINARY_CLOUD_NAME) throw new AppError("Upload avatar belum dikonfigurasi.", 501);

    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: "freshpress/employee-avatars",
      public_id: req.user!.userId,
      overwrite: true,
    });

    const result = await updateAvatar(req.user!.userId, uploaded.secure_url);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
