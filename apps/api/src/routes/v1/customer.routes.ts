import { Router } from "express";
import * as AuthCtrl from "../../controllers/customer/auth.controller.js";
import * as ProfileCtrl from "../../controllers/customer/profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  loginRateLimiter,
  authRateLimiter,
} from "../../middlewares/rate-limit.middleware.js";
import {
  registerSchema,
  verifySchema,
  loginSchema,
  emailSchema,
  resetSchema,
  updateProfileSchema,
  changePasswordSchema,
  verifyEmailChangeSchema,
} from "../../validations/customer.validation.js";

const router = Router();

// Auth Routes
router.get("/auth/google", AuthCtrl.googleRedirect);
router.get("/auth/google/callback", AuthCtrl.googleCallback);
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
router.post("/profile/verify-email-change", authRateLimiter, validate(verifyEmailChangeSchema), ProfileCtrl.verifyEmailChange);

export default router;
