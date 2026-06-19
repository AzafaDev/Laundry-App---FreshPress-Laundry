import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  checkInSchema,
  checkOutSchema,
  getMyLogsQuerySchema,
} from "../../validations/attendance.validation.js";
import {
  checkIn,
  checkOut,
  checkTodayAttendance,
  getMyLogs,
  getCurrentShift,
} from "../../controllers/driver-worker/attendance.controller.js";
import { getAvailablePickups, getAvailableDeliveries, getActiveTask, claimTask, completeTask, getTaskHistory as getDriverTaskHistory } from "../../controllers/driver-worker/driver.controller.js";
import * as NotifCtrl from "../../controllers/admin/notification.controller.js";
import { getStationOrders, completeStation, submitItems, createBypassRequest, uploadBypassPhotosMiddleware, getBypassForOrder, getTaskHistory as getWorkerTaskHistory } from "../../controllers/driver-worker/worker.controller.js";
import { submitItemsSchema, createBypassRequestSchema } from "../../validations/worker.validation.js";

const router = Router();

const EMPLOYEE_ROLES = ["driver", "washing_worker", "ironing_worker", "packing_worker"] as const;
const WORKER_ROLES = ["washing_worker", "ironing_worker", "packing_worker"] as const;

router.use(authenticate);

router.post(
  "/attendance/check-in",
  requireRole(...EMPLOYEE_ROLES),
  validate(checkInSchema),
  checkIn,
);
router.post(
  "/attendance/check-out",
  requireRole(...EMPLOYEE_ROLES),
  validate(checkOutSchema),
  checkOut,
);
router.get(
  "/attendance/my-logs",
  requireRole(...EMPLOYEE_ROLES),
  validate(getMyLogsQuerySchema, "query"),
  getMyLogs,
);
router.get(
  "/attendance/today",
  requireRole(...EMPLOYEE_ROLES),
  checkTodayAttendance,
);
router.get(
  "/attendance/current-shift",
  requireRole(...EMPLOYEE_ROLES),
  getCurrentShift,
);

router.get(
  "/driver/pickups/available",
  requireRole("driver"),
  getAvailablePickups,
);
router.get(
  "/driver/deliveries/available",
  requireRole("driver"),
  getAvailableDeliveries,
);
router.get(
  "/driver/tasks/active",
  requireRole("driver"),
  getActiveTask,
);
router.post(
  "/driver/tasks/:taskId/claim",
  requireRole("driver"),
  claimTask,
);
router.patch(
  "/driver/tasks/:taskId/complete",
  requireRole("driver"),
  completeTask,
);
router.get(
  "/driver/tasks/history",
  requireRole("driver"),
  getDriverTaskHistory,
);

router.get(
  "/worker/station/:station",
  requireRole(...WORKER_ROLES),
  getStationOrders,
);
router.post(
  "/worker/station/:station/orders/:orderId/submit-items",
  requireRole(...WORKER_ROLES),
  validate(submitItemsSchema),
  submitItems,
);
router.patch(
  "/worker/station/:station/orders/:orderId/complete",
  requireRole(...WORKER_ROLES),
  completeStation,
);
router.get(
  "/worker/tasks/history",
  requireRole(...WORKER_ROLES),
  getWorkerTaskHistory,
);
router.get(
  "/worker/orders/:orderId/bypass",
  requireRole(...WORKER_ROLES),
  getBypassForOrder,
);
router.post(
  "/worker/bypass",
  requireRole(...WORKER_ROLES),
  uploadBypassPhotosMiddleware,
  validate(createBypassRequestSchema),
  createBypassRequest,
);

router.get("/driver/notifications", requireRole("driver"), NotifCtrl.listNotifications);
router.get("/driver/notifications/unread-count", requireRole("driver"), NotifCtrl.getUnreadCount);
router.patch("/driver/notifications/read-all", requireRole("driver"), NotifCtrl.markAllAsRead);
router.patch("/driver/notifications/:id/read", requireRole("driver"), NotifCtrl.markAsRead);

export default router;