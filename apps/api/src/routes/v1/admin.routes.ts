// Admin API routes

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getAttendanceReport, exportAttendanceReport } from "../../controllers/admin/report.controller.js";
import * as UserCtrl from "../../controllers/admin/user.controller.js";
import * as OutletCtrl from "../../controllers/admin/outlet.controller.js";
import * as ShiftCtrl from "../../controllers/admin/shift.controller.js";
import * as LaundryItemCtrl from "../../controllers/admin/laundryItem.controller.js";
import * as OrderCtrl from "../../controllers/admin/order.controller.js";
import * as BypassCtrl from "../../controllers/admin/bypass.controller.js";
import * as ClothingCtrl from "../../controllers/admin/clothingType.controller.js";
import * as NotifCtrl from "../../controllers/admin/notification.controller.js";
import * as ComplaintCtrl from "../../controllers/admin/complaint.controller.js";
import { getSalesReport, getEmployeePerformanceReport } from "../../controllers/admin/report.controller.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../validations/user.validation.js";
import {
  createOutletSchema,
  updateOutletSchema,
  assignUserToOutletSchema,
} from "../../validations/outlet.validation.js";
import {
  createWorkShiftSchema,
  updateWorkShiftSchema,
  assignEmployeeShiftSchema,
} from "../../validations/shift.validation.js";
import {
  createLaundryItemSchema,
  updateLaundryItemSchema,
} from "../../validations/laundryItem.validation.js";
import {
  createClothingTypeSchema,
  updateClothingTypeSchema,
} from "../../validations/clothingType.validation.js";
import { updateComplaintStatusSchema } from "../../validations/complaint.validation.js";
import { processOrderSchema, reviewBypassSchema } from "../../validations/order.validation.js";

const router = Router();

// All admin routes require a valid Bearer token.
router.use(authenticate);

// Reports
router.get(
  "/reports/attendance",
  requireRole("super_admin", "outlet_admin"),
  getAttendanceReport,
);
router.get(
  "/reports/attendance/export",
  requireRole("super_admin", "outlet_admin"),
  exportAttendanceReport,
);

// -- Users (super_admin only) --------------------------------------------------
router.get("/admin/users", requireRole("super_admin", "outlet_admin"), UserCtrl.listUsers);
router.get("/admin/users/:id", requireRole("super_admin", "outlet_admin"), UserCtrl.getUser);
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

// Employee shift assignments
router.get(
  "/admin/employees/:id/shifts",
  requireRole("super_admin", "outlet_admin"),
  ShiftCtrl.listEmployeeShifts,
);
router.post(
  "/admin/employees/:id/shifts",
  requireRole("super_admin"),
  validate(assignEmployeeShiftSchema),
  ShiftCtrl.assignEmployeeShift,
);
router.delete(
  "/admin/employees/:id/shifts/:shiftRecordId",
  requireRole("super_admin"),
  ShiftCtrl.removeEmployeeShift,
);

// -- Outlets (super_admin only) ------------------------------------------------
router.get(
  "/admin/outlets",
  requireRole("super_admin"),
  OutletCtrl.listOutlets,
);
router.get(
  "/admin/outlets/geocode",
  requireRole("super_admin"),
  OutletCtrl.searchAddress,
);
router.get(
  "/admin/outlets/:id",
  requireRole("super_admin"),
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
  requireRole("super_admin"),
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

// -- WorkShifts ----------------------------------------------------------------
router.get(
  "/admin/shifts",
  requireRole("super_admin", "outlet_admin"),
  ShiftCtrl.listWorkShifts,
);
router.get(
  "/admin/shifts/:id",
  requireRole("super_admin", "outlet_admin"),
  ShiftCtrl.getWorkShift,
);
router.post(
  "/admin/shifts",
  requireRole("super_admin"),
  validate(createWorkShiftSchema),
  ShiftCtrl.createWorkShift,
);
router.patch(
  "/admin/shifts/:id",
  requireRole("super_admin"),
  validate(updateWorkShiftSchema),
  ShiftCtrl.updateWorkShift,
);
router.delete(
  "/admin/shifts/:id",
  requireRole("super_admin"),
  ShiftCtrl.deleteWorkShift,
);

// -- Laundry Items -------------------------------------------------------------
// GET is accessible by both super_admin and outlet_admin (needed for create order)
router.get(
  "/admin/laundry-items",
  requireRole("super_admin", "outlet_admin"),
  LaundryItemCtrl.listLaundryItems,
);
router.get(
  "/admin/laundry-items/:id",
  requireRole("super_admin", "outlet_admin"),
  LaundryItemCtrl.getLaundryItem,
);
router.post(
  "/admin/laundry-items",
  requireRole("super_admin"),
  validate(createLaundryItemSchema),
  LaundryItemCtrl.createLaundryItem,
);
router.patch(
  "/admin/laundry-items/:id",
  requireRole("super_admin"),
  validate(updateLaundryItemSchema),
  LaundryItemCtrl.updateLaundryItem,
);
router.delete(
  "/admin/laundry-items/:id",
  requireRole("super_admin"),
  LaundryItemCtrl.deleteLaundryItem,
);

// -- Orders -------------------------------------------------------------------
router.get(
  "/admin/orders",
  requireRole("super_admin", "outlet_admin"),
  OrderCtrl.listOrders,
);
router.get(
  "/admin/orders/:id",
  requireRole("super_admin", "outlet_admin"),
  OrderCtrl.getOrder,
);
router.post(
  "/admin/orders/:id/process",
  requireRole("outlet_admin"),
  validate(processOrderSchema),
  OrderCtrl.processOrder,
);

// -- Bypass Requests ----------------------------------------------------------
router.get(
  "/admin/bypass-requests",
  requireRole("super_admin", "outlet_admin"),
  BypassCtrl.listBypassRequests,
);
router.get(
  "/admin/bypass-requests/:id",
  requireRole("super_admin", "outlet_admin"),
  BypassCtrl.getBypassRequest,
);
router.patch(
  "/admin/bypass-requests/:id/review",
  requireRole("outlet_admin"),
  validate(reviewBypassSchema),
  BypassCtrl.reviewBypassRequest,
);

// -- Clothing Types (master data) ---------------------------------------------
// GET accessible by outlet_admin too (needed for processOrder breakdown)
router.get(
  "/admin/clothing-types",
  requireRole("super_admin", "outlet_admin"),
  ClothingCtrl.listClothingTypes,
);
router.get(
  "/admin/clothing-types/:id",
  requireRole("super_admin", "outlet_admin"),
  ClothingCtrl.getClothingType,
);
router.post(
  "/admin/clothing-types",
  requireRole("super_admin"),
  validate(createClothingTypeSchema),
  ClothingCtrl.createClothingType,
);
router.patch(
  "/admin/clothing-types/:id",
  requireRole("super_admin"),
  validate(updateClothingTypeSchema),
  ClothingCtrl.updateClothingType,
);
router.delete(
  "/admin/clothing-types/:id",
  requireRole("super_admin"),
  ClothingCtrl.deleteClothingType,
);

// -- Sales & Employee Performance Reports -------------------------------------
router.get(
  "/reports/sales",
  requireRole("super_admin", "outlet_admin"),
  getSalesReport,
);
router.get(
  "/reports/employees",
  requireRole("super_admin", "outlet_admin"),
  getEmployeePerformanceReport,
);

// -- Admin Notifications ------------------------------------------------------
router.get(
  "/admin/notifications",
  requireRole("super_admin", "outlet_admin"),
  NotifCtrl.listNotifications,
);
router.get(
  "/admin/notifications/unread-count",
  requireRole("super_admin", "outlet_admin"),
  NotifCtrl.getUnreadCount,
);
router.patch(
  "/admin/notifications/read-all",
  requireRole("super_admin", "outlet_admin"),
  NotifCtrl.markAllAsRead,
);
router.patch(
  "/admin/notifications/:id/read",
  requireRole("super_admin", "outlet_admin"),
  NotifCtrl.markAsRead,
);

// -- Complaints ---------------------------------------------------------------
router.get(
  "/admin/complaints",
  requireRole("super_admin", "outlet_admin"),
  ComplaintCtrl.listComplaints,
);
router.get(
  "/admin/complaints/stats",
  requireRole("super_admin", "outlet_admin"),
  ComplaintCtrl.getComplaintStats,
);
router.get(
  "/admin/complaints/:id",
  requireRole("super_admin", "outlet_admin"),
  ComplaintCtrl.getComplaint,
);
router.patch(
  "/admin/complaints/:id/status",
  requireRole("super_admin", "outlet_admin"),
  validate(updateComplaintStatusSchema),
  ComplaintCtrl.updateComplaintStatus,
);

export default router;
