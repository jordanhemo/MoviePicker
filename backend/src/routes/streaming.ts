import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { streamingController } from '../controllers/streamingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/tmdb/services', streamingController.getTMDBStreamingServices);
router.get('/tmdb/movie/:movieId/providers', streamingController.getMovieStreamingProviders);
router.get('/tmdb/tv/:tvId/providers', streamingController.getTVShowStreamingProviders);
router.get('/tmdb/regions', streamingController.getAvailableRegions);

// All other routes require authentication
router.use(authenticateToken);

// Validation schemas
const toggleServiceSchema = [
  body('streamingServiceId').isUUID(),
  body('isActive').isBoolean()
];

const updatePreferencesSchema = [
  body('favoriteGenres').optional().isArray(),
  body('preferredLanguage').optional().isLength({ min: 1, max: 10 }),
  body('adultContent').optional().isBoolean(),
  body('notificationEnabled').optional().isBoolean(),
  body('theme').optional().isIn(['dark', 'light', 'auto'])
];

// Routes
router.get('/services', streamingController.getAvailableServices);
router.get('/user-services', streamingController.getUserServices);
router.post('/toggle-service', toggleServiceSchema, validateRequest, streamingController.toggleService);
router.get('/preferences', streamingController.getUserPreferences);
router.put('/preferences', updatePreferencesSchema, validateRequest, streamingController.updatePreferences);

export default router;
