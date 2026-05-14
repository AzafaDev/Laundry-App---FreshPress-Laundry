// Driver/Worker API routes

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import {
  checkIn,
  checkOut,
  getMyLogs,
} from "../../controllers/driver-worker/attendance.controller.js";

const router = Router();

router.use(authenticate);
router.use(allowRoles("driver", "worker"));

router.post("/attendance/check-in", checkIn);
router.post("/attendance/check-out", checkOut);
router.get("/attendance/my-logs", getMyLogs);

export default router;
