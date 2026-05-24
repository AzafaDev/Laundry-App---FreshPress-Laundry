import { Router } from "express";
import { authRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginEmployeeSchema } from "../../validations/employee.validation.js";
import {
  login,
  logout,
  refresh,
} from "../../controllers/employee/auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/auth/login",
  authRateLimiter,
  validate(loginEmployeeSchema),
  login,
);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", authenticate, logout);

export default router;
