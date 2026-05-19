// Admin API routes

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getAttendanceReport } from "../../controllers/admin/report.controller.js";
import * as UserCtrl from "../../controllers/admin/user.controller.js";
import * as OutletCtrl from "../../controllers/admin/outlet.controller.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../validations/user.validation.js";
import {
  createOutletSchema,
  updateOutletSchema,
  assignUserToOutletSchema,
} from "../../validations/outlet.validation.js";

const router = Router();

// All admin routes require a valid Bearer token.
router.use(authenticate);

// Reports
router.get(
  "/reports/attendance",
  requireRole("super_admin", "outlet_admin"),
  getAttendanceReport,
);

// Users (super_admin only)
router.get("/admin/users", requireRole("super_admin"), UserCtrl.listUsers);
router.get("/admin/users/:id", requireRole("super_admin"), UserCtrl.getUser);
router.post(
  "/admin/users",
  requireRole("super_admin"),
  validate(createUserSchema),
  UserCtrl.createUser,
);
router.patch(
  "/admin/users/:id",
  requireRole("super_admin"),
  validate(updateUserSchema),
  UserCtrl.updateUser,
);
router.delete(
  "/admin/users/:id",
  requireRole("super_admin"),
  UserCtrl.deleteUser,
);

// Outlets (super_admin manages, outlet_admin can read)
router.get(
  "/admin/outlets",
  requireRole("super_admin", "outlet_admin"),
  OutletCtrl.listOutlets,
);
router.get(
  "/admin/outlets/geocode",
  requireRole("super_admin", "outlet_admin"),
  OutletCtrl.searchAddress,
);
router.get(
  "/admin/outlets/:id",
  requireRole("super_admin", "outlet_admin"),
  OutletCtrl.getOutlet,
);
router.post(
  "/admin/outlets",
  requireRole("super_admin"),
  validate(createOutletSchema),
  OutletCtrl.createOutlet,
);
router.patch(
  "/admin/outlets/:id",
  requireRole("super_admin"),
  validate(updateOutletSchema),
  OutletCtrl.updateOutlet,
);
router.delete(
  "/admin/outlets/:id",
  requireRole("super_admin"),
  OutletCtrl.deactivateOutlet,
);
router.get(
  "/admin/outlets/:id/assignments",
  requireRole("super_admin", "outlet_admin"),
  OutletCtrl.listAssignments,
);
router.delete(
  "/admin/outlets/:id/assignments/:userId",
  requireRole("super_admin"),
  OutletCtrl.unassignUser,
);
router.post(
  "/admin/outlets/:id/assignments",
  requireRole("super_admin"),
  validate(assignUserToOutletSchema),
  OutletCtrl.assignUserToOutlet,
);

export default router;
