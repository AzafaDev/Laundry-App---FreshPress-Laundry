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

const router = Router();

router.use(authenticate);

// ✅ Ganti requireRole('driver', 'worker') dengan tiga role worker spesifik
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

export default router;
