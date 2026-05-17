import { Router } from 'express';
import {
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/', authenticate, listAppointments);
router.post('/', authenticate, authorize('patient'), createAppointment);
router.patch('/:id/status', authenticate, authorize('admin', 'doctor'), updateAppointmentStatus);
router.patch('/:id/cancel', authenticate, cancelAppointment);

export default router;
