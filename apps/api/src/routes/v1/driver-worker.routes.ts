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
import { getAvailablePickups, getAvailableDeliveries, getActiveTask } from "../../controllers/driver-worker/driver.controller.js";
import { getStationOrders } from "../../controllers/driver-worker/worker.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/attendance/check-in",
  requireRole("driver", "washing_worker", "ironing_worker", "packing_worker"),
  checkIn,
);
router.post(
  "/attendance/check-out",
  requireRole("driver", "washing_worker", "ironing_worker", "packing_worker"),
  checkOut,
);
router.get(
  "/attendance/my-logs",
  requireRole("driver", "washing_worker", "ironing_worker", "packing_worker"),
  getMyLogs,
);
router.get(
  "/attendance/today",
  requireRole("driver", "washing_worker", "ironing_worker", "packing_worker"),
  checkTodayAttendance,
);
router.get(
  "/attendance/current-shift",
  requireRole("driver", "washing_worker", "ironing_worker", "packing_worker"),
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
router.get(
  "/worker/station/:station",
  requireRole("washing_worker", "ironing_worker", "packing_worker"),
  getStationOrders,
);

export default router;