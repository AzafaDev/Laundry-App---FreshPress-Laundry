import { Router } from "express";
import customerRoutes from "./v1/customer.routes.js";

const router = Router();

router.use("/v1/customer", customerRoutes);

export default router;
