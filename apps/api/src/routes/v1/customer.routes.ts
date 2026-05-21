import { Router } from "express";
import * as AuthCtrl from "../../controllers/customer/auth.controller.js";
import * as ProfileCtrl from "../../controllers/customer/profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  verifySchema,
  loginSchema,
  emailSchema,
  resetSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../../validations/customer.validation.js";

const router = Router();

// ── Auth Routes ───────────────────────────────────────────────────────────────
router.get("/auth/google", AuthCtrl.googleRedirect);
router.get("/auth/google/callback", AuthCtrl.googleCallback);
router.post("/auth/register", validate(registerSchema), AuthCtrl.register);
router.post("/auth/verify", validate(verifySchema), AuthCtrl.verifyEmail);
router.post("/auth/resend-verification", validate(emailSchema), AuthCtrl.resendVerification);
router.post("/auth/login", validate(loginSchema), AuthCtrl.login);
router.post("/auth/forgot-password", validate(emailSchema), AuthCtrl.forgotPassword);
router.post("/auth/reset-password", validate(resetSchema), AuthCtrl.resetPassword);

// ── Profile Routes (protected) ────────────────────────────────────────────────
router.get("/profile", authenticate, ProfileCtrl.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema), ProfileCtrl.updateProfile);
router.patch("/profile/password", authenticate, validate(changePasswordSchema), ProfileCtrl.changePassword);
router.post("/profile/avatar", authenticate, ProfileCtrl.uploadAvatarMiddleware, ProfileCtrl.uploadAvatar);

export default router;
