import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const updateProfileSchema = [
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('location').optional().isLength({ min: 1, max: 100 }),
  body('profileImage').optional().isURL()
];

// Routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileSchema, validateRequest, userController.updateProfile);
router.delete('/account', userController.deleteAccount);

export default router;
