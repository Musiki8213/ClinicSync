import { Router } from 'express';
import {
  listPatients,
  getPatient,
  updatePatientProfile,
  addMedicalNote,
  getMyProfile,
} from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'doctor'), listPatients);
router.get('/me/profile', authenticate, authorize('patient'), getMyProfile);
router.get('/:id', authenticate, authorize('admin', 'doctor', 'patient'), getPatient);
router.patch('/me', authenticate, authorize('patient'), updatePatientProfile);
router.post('/:id/notes', authenticate, authorize('admin', 'doctor'), addMedicalNote);

export default router;
