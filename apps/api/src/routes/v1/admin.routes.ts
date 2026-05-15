// Admin API routes

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { getAttendanceReport } from "../../controllers/admin/report.controller.js";

const router = Router();

router.use(authenticate);
router.get(
  "/reports/attendance",
  requireRole("super_admin", "outlet_admin"),
  getAttendanceReport,
);

export default router;
