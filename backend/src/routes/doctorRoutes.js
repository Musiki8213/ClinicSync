import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  listDoctors,
  getDoctor,
  getAvailableSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const readRoles = [authenticate, authorize('admin', 'doctor', 'patient')];
const adminOnly = [authenticate, authorize('admin')];

router.get(
  '/',
  ...readRoles,
  [
    query('specialization').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
    query('availableOnly').optional().isIn(['true', 'false']),
  ],
  validateRequest,
  listDoctors
);

router.get(
  '/:id/slots',
  ...readRoles,
  [
    param('id').isMongoId().withMessage('Invalid doctor id'),
    query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  ],
  validateRequest,
  getAvailableSlots
);

router.get('/:id', ...readRoles, [param('id').isMongoId().withMessage('Invalid doctor id')], validateRequest, getDoctor);

router.post(
  '/',
  ...adminOnly,
  [
    body('fullName').trim().notEmpty().withMessage('fullName is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('specialization').trim().notEmpty().withMessage('specialization is required'),
    body('phoneNumber').optional().isString().trim(),
    body('yearsOfExperience').optional().isInt({ min: 0, max: 70 }),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Invalid gender'),
    body('profileImage').optional().isString().trim(),
    body('bio').optional().isString().trim(),
    body('availability').optional(),
  ],
  validateRequest,
  createDoctor
);

router.put(
  '/:id',
  ...adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid doctor id'),
    body('fullName').optional({ checkFalsy: true }).trim().notEmpty(),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body('phoneNumber').optional().isString().trim(),
    body('specialization').optional({ checkFalsy: true }).trim().notEmpty(),
    body('yearsOfExperience').optional().isInt({ min: 0, max: 70 }),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body('profileImage').optional().isString().trim(),
    body('bio').optional().isString().trim(),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }),
    body('availability').optional(),
  ],
  validateRequest,
  updateDoctor
);

router.delete(
  '/:id',
  ...adminOnly,
  [param('id').isMongoId().withMessage('Invalid doctor id')],
  validateRequest,
  deleteDoctor
);

export default router;
