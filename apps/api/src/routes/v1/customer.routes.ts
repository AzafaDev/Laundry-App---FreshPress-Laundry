import { Router } from "express";
import * as AuthCtrl from "../../controllers/customer/auth.controller.js";
import * as ProfileCtrl from "../../controllers/customer/profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  loginRateLimiter,
  authRateLimiter,
} from "../../middlewares/rate-limit.middleware.js";

const router = Router();

// Zod Schemas
const registerSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
  role: z.enum(["customer", "driver", "worker"]).optional().default("customer"),
});

const verifySchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const emailSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
  new_email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

// Auth Routes
router.post("/auth/register", authRateLimiter, validate(registerSchema), AuthCtrl.register);
router.post("/auth/verify", authRateLimiter, validate(verifySchema), AuthCtrl.verifyEmail);
router.post("/auth/resend-verification", authRateLimiter, validate(emailSchema), AuthCtrl.resendVerification);
router.post("/auth/login", loginRateLimiter, validate(loginSchema), AuthCtrl.login);
router.post("/auth/forgot-password", authRateLimiter, validate(emailSchema), AuthCtrl.forgotPassword);
router.post("/auth/reset-password", authRateLimiter, validate(resetSchema), AuthCtrl.resetPassword);

// Profile Routes (protected)
router.get("/profile", authenticate, ProfileCtrl.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema), ProfileCtrl.updateProfile);
router.patch("/profile/password", authenticate, validate(changePasswordSchema), ProfileCtrl.changePassword);
router.post("/profile/avatar", authenticate, ProfileCtrl.uploadAvatarMiddleware, ProfileCtrl.uploadAvatar);

export default router;
