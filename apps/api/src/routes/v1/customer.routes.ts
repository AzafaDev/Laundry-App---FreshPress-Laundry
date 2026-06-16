import { Router } from "express";
import * as AuthCtrl from "../../controllers/customer/auth.controller.js";
import * as ProfileCtrl from "../../controllers/customer/profile.controller.js";
import * as AddressCtrl from "../../controllers/customer/address.controller.js";
import * as OrderCtrl from "../../controllers/customer/order.controller.js";
import * as NotificationCtrl from "../../controllers/customer/notification.controller.js";
import * as LaundryItemCtrl from "../../controllers/customer/laundryItem.controller.js";
import * as PaymentCtrl from "../../controllers/customer/payment.controller.js";
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
  createAddressSchema,
  updateAddressSchema,
  createOrderSchema,
  createComplaintSchema,
  listOrdersQuerySchema,
  listNotificationsQuerySchema,
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
router.post("/auth/refresh", AuthCtrl.refresh);
router.post("/auth/logout", AuthCtrl.logout);

// Profile Routes (protected)
router.get("/profile", authenticate, ProfileCtrl.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema), ProfileCtrl.updateProfile);
router.patch("/profile/password", authenticate, validate(changePasswordSchema), ProfileCtrl.changePassword);
router.post("/profile/avatar", authenticate, ProfileCtrl.uploadAvatarMiddleware, ProfileCtrl.uploadAvatar);
router.post("/profile/verify-email-change", authRateLimiter, validate(verifyEmailChangeSchema), ProfileCtrl.verifyEmailChange);

// Address Routes (protected)
router.get("/addresses", authenticate, AddressCtrl.listAddresses);
router.post("/addresses", authenticate, validate(createAddressSchema), AddressCtrl.createAddress);
router.patch("/addresses/:id", authenticate, validate(updateAddressSchema), AddressCtrl.updateAddress);
router.patch("/addresses/:id/primary", authenticate, AddressCtrl.setPrimaryAddress);
router.delete("/addresses/:id", authenticate, AddressCtrl.deleteAddress);
router.get("/addresses/:id/delivery-estimate", authenticate, AddressCtrl.estimateDeliveryFee);

// Geocode proxy (protected — keeps OPENCAGE_API_KEY server-side)
router.get("/geocode", authenticate, AddressCtrl.geocodeSearch);

// Laundry Items (public)
router.get("/laundry-items", LaundryItemCtrl.listLaundryItems);

// Order Routes (protected)
router.post("/orders", authenticate, validate(createOrderSchema), OrderCtrl.createOrder);
router.get("/orders", authenticate, validate(listOrdersQuerySchema, "query"), OrderCtrl.listOrders);
router.get("/orders/:id", authenticate, OrderCtrl.getOrderById);
router.patch("/orders/:id/complete", authenticate, OrderCtrl.completeOrder);
router.post("/orders/:id/complaints", authenticate, OrderCtrl.uploadComplaintPhotosMiddleware, validate(createComplaintSchema), OrderCtrl.createComplaint);

// Notification Routes (protected)
router.get("/notifications", authenticate, validate(listNotificationsQuerySchema, "query"), NotificationCtrl.listNotifications);
router.get("/notifications/unread-count", authenticate, NotificationCtrl.getUnreadCount);
router.patch("/notifications/read-all", authenticate, NotificationCtrl.markAllAsRead);
router.patch("/notifications/:id/read", authenticate, NotificationCtrl.markAsRead);

// Payment Routes
router.post("/payment/notification", PaymentCtrl.handleNotification); // public webhook (Midtrans)
router.post("/payment/:orderId/create-transaction", authenticate, PaymentCtrl.createTransaction);
router.get("/payment/:orderId/status", authenticate, PaymentCtrl.getStatus);
router.post("/payment/:orderId/sync", authenticate, PaymentCtrl.syncStatus);

export default router;
