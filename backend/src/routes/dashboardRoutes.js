import { Router } from 'express';
import { dashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, dashboardStats);

export default router;
