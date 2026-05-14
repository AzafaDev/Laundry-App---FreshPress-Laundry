// Admin API routes

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { getAttendanceReport } from "../../controllers/admin/report.controller.js";

const router = Router();

router.use(authenticate);
router.use(allowRoles("super_admin", "outlet_admin"));

router.get("/reports/attendance", getAttendanceReport);

export default router;
