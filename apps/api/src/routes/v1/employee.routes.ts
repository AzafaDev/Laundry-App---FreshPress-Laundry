import { Router } from "express";
import { authRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  loginEmployeeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../../validations/employee.validation.js";
import {
  login,
  logout,
  refresh,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
} from "../../controllers/employee/auth.controller.js";
import {
  getProfileHandler,
  updateProfileHandler,
  uploadAvatarHandler,
  uploadAvatarMiddleware,
} from "../../controllers/employee/profile.controller.js";
import * as NotificationCtrl from "../../controllers/employee/notification.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/login", authRateLimiter, validate(loginEmployeeSchema), login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", authenticate, logout);
router.post("/auth/forgot-password", authRateLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post("/auth/reset-password", validate(resetPasswordSchema), resetPasswordHandler);
router.post("/auth/change-password", authenticate, validate(changePasswordSchema), changePasswordHandler);

router.get("/profile", authenticate, getProfileHandler);
router.patch("/profile", authenticate, validate(updateProfileSchema), updateProfileHandler);
router.patch("/profile/avatar", authenticate, uploadAvatarMiddleware, uploadAvatarHandler);

router.get("/notifications", authenticate, NotificationCtrl.listNotifications);
router.get("/notifications/unread-count", authenticate, NotificationCtrl.getUnreadCount);
router.patch("/notifications/read-all", authenticate, NotificationCtrl.markAllAsRead);
router.patch("/notifications/:id/read", authenticate, NotificationCtrl.markAsRead);

export default router;
