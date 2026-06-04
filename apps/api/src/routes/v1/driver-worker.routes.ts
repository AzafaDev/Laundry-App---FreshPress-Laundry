import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  checkIn,
  checkOut,
  checkTodayAttendance,
  getMyLogs,
  getCurrentShift,
} from "../../controllers/driver-worker/attendance.controller.js";
import { getAvailablePickups, getAvailableDeliveries, getActiveTask, claimTask, completeTask } from "../../controllers/driver-worker/driver.controller.js";
import { getStationOrders, completeStation, submitItems, createBypassRequest, uploadBypassPhotosMiddleware } from "../../controllers/driver-worker/worker.controller.js";

const router = Router();

const EMPLOYEE_ROLES = ["driver", "washing_worker", "ironing_worker", "packing_worker"] as const;
const WORKER_ROLES = ["washing_worker", "ironing_worker", "packing_worker"] as const;

router.use(authenticate);

router.post(
  "/attendance/check-in",
  requireRole(...EMPLOYEE_ROLES),
  checkIn,
);
router.post(
  "/attendance/check-out",
  requireRole(...EMPLOYEE_ROLES),
  checkOut,
);
router.get(
  "/attendance/my-logs",
  requireRole(...EMPLOYEE_ROLES),
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
  "/worker/station/:station",
  requireRole(...WORKER_ROLES),
  getStationOrders,
);
router.post(
  "/worker/station/:station/orders/:orderId/submit-items",
  requireRole(...WORKER_ROLES),
  submitItems,
);
router.patch(
  "/worker/station/:station/orders/:orderId/complete",
  requireRole(...WORKER_ROLES),
  completeStation,
);
router.post(
  "/worker/bypass",
  requireRole(...WORKER_ROLES),
  uploadBypassPhotosMiddleware,
  createBypassRequest,
);

export default router;