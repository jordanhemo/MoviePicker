import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { watchlistController } from '../controllers/watchlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const addMovieSchema = [
  body('movieId').isInt({ min: 1 }),
  body('movieTitle').isLength({ min: 1, max: 200 }),
  body('moviePoster').optional().isURL()
];

const updateMovieSchema = [
  param('id').isUUID(),
  body('isWatched').optional().isBoolean(),
  body('watchedAt').optional().isISO8601()
];

const getWatchlistSchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('isWatched').optional().isBoolean()
];

// Routes
router.post('/', addMovieSchema, validateRequest, watchlistController.addMovie);
router.get('/', getWatchlistSchema, validateRequest, watchlistController.getWatchlist);
router.get('/:id', param('id').isUUID(), validateRequest, watchlistController.getMovie);
router.put('/:id', updateMovieSchema, validateRequest, watchlistController.updateMovie);
router.delete('/:id', param('id').isUUID(), validateRequest, watchlistController.removeMovie);
router.get('/stats/summary', watchlistController.getWatchlistStats);

export default router;
