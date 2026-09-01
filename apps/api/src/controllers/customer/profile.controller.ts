import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import * as ProfileService from "../../services/customer/profile.service.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_AVATAR_MIME_TYPES,
} from "../../config/constants.js";

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const profile = await ProfileService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await ProfileService.updateProfile(req.user!.userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { current_password, new_password } = req.body;
    const result = await ProfileService.changePassword(
      req.user!.userId,
      current_password,
      new_password,
      res,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

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

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) throw new AppError("File tidak ditemukan.", 400);

    let avatarUrl: string;
    const { env } = await import("../../config/env.js");

    if (env.CLOUDINARY_CLOUD_NAME) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploaded = await cloudinary.uploader.upload(base64, {
        folder: "freshpress/avatars",
        public_id: req.user!.userId,
        overwrite: true,
        invalidate: true,
      });
      avatarUrl = uploaded.secure_url;
    } else {
      // Fallback: in production always configure Cloudinary
      throw new AppError("Upload avatar belum dikonfigurasi.", 501);
    }

    const result = await ProfileService.updateAvatar(req.user!.userId, avatarUrl);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmailChange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.body;
    const result = await ProfileService.verifyEmailChange(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
