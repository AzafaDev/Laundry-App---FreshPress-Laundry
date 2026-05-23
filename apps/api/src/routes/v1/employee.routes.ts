import { Router } from "express";
import { authRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginEmployeeSchema } from "../../validations/employee.validation.js";
import { login } from "../../controllers/employee/auth.controller.js";

const router = Router();

router.post(
  "/auth/login",
  authRateLimiter,
  validate(loginEmployeeSchema),
  login,
);

export default router;
