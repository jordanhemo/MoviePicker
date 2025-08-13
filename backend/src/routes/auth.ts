import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('location').optional().isLength({ min: 1, max: 100 })
];

const loginSchema = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const biometricSchema = [
  body('biometricToken').notEmpty(),
  body('deviceId').notEmpty()
];

// Routes
router.post('/register', registerSchema, validateRequest, authController.register);
router.post('/login', loginSchema, validateRequest, authController.login);
router.post('/biometric-login', biometricSchema, validateRequest, authController.biometricLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/change-password', authenticateToken, authController.changePassword);

export default router;
