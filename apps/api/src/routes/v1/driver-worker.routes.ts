import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  checkIn,
  checkOut,
  checkTodayAttendance,
  getMyLogs,
  getCurrentShift,
} from '../../controllers/driver-worker/attendance.controller.js';

const router = Router();
router.use(authenticate);

router.post('/attendance/check-in', requireRole('driver', 'worker'), checkIn);
router.post('/attendance/check-out', requireRole('driver', 'worker'), checkOut);
router.get('/attendance/my-logs', requireRole('driver', 'worker'), getMyLogs);
router.get('/attendance/today', requireRole('driver', 'worker'), checkTodayAttendance);
router.get('/attendance/current-shift', requireRole('driver', 'worker'), getCurrentShift);

export default router;