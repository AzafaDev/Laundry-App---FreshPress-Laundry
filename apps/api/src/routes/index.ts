import { Router } from "express";
import customerRoutes from "./v1/customer.routes.js";
import driverWorkerRoutes from "./v1/driver-worker.routes.js";
import adminRoutes from "./v1/admin.routes.js";
import employeeRoutes from "./v1/employee.routes.js";

const router = Router();

router.use("/v1/customer", customerRoutes);
router.use("/v1/employee", employeeRoutes);
router.use("/v1", adminRoutes);
router.use("/v1", driverWorkerRoutes);

export default router;
