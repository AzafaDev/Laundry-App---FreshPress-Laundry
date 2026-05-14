// Route aggregator

import { Router } from "express";
import driverWorkerRoutes from "./v1/driver-worker.routes.js";
import adminRoutes from "./v1/admin.routes.js";

const router = Router();

router.use("/v1", driverWorkerRoutes);
router.use("/v1", adminRoutes);

export default router;
