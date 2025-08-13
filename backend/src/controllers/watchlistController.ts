import { Request, Response } from 'express';
import { prisma } from '../index';

export const watchlistController = {
  // Add movie to watchlist
  async addMovie(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { movieId, movieTitle, moviePoster } = req.body;

      // Check if movie already exists in user's watchlist
      const existingMovie = await prisma.watchlistItem.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId
          }
        }
      });

      if (existingMovie) {
        return res.status(409).json({
          success: false,
          message: 'Movie already in watchlist'
        });
      }

      // Add movie to watchlist
      const watchlistItem = await prisma.watchlistItem.create({
        data: {
          userId,
          movieId,
          movieTitle,
          moviePoster
        }
      });

      res.status(201).json({
        success: true,
        message: 'Movie added to watchlist',
        data: { watchlistItem }
      });
    } catch (error) {
      console.error('Add movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user's watchlist
  async getWatchlist(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, isWatched } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const whereClause: any = { userId };
      if (isWatched !== undefined) {
        whereClause.isWatched = isWatched === 'true';
      }

      // Get watchlist items with pagination
      const [watchlistItems, totalCount] = await Promise.all([
        prisma.watchlistItem.findMany({
          where: whereClause,
          orderBy: { addedAt: 'desc' },
          skip,
          take: limitNum
        }),
        prisma.watchlistItem.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        success: true,
        data: {
          watchlistItems,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPreviousPage: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Get watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get specific movie from watchlist
  async getMovie(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const watchlistItem = await prisma.watchlistItem.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!watchlistItem) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found in watchlist'
        });
      }

      res.json({
        success: true,
        data: { watchlistItem }
      });
    } catch (error) {
      console.error('Get movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update movie in watchlist
  async updateMovie(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { isWatched, watchedAt } = req.body;

      // Find and update the watchlist item
      const watchlistItem = await prisma.watchlistItem.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!watchlistItem) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found in watchlist'
        });
      }

      // Update the item
      const updatedItem = await prisma.watchlistItem.update({
        where: { id },
        data: {
          isWatched: isWatched !== undefined ? isWatched : watchlistItem.isWatched,
          watchedAt: watchedAt !== undefined ? new Date(watchedAt) : watchlistItem.watchedAt
        }
      });

      res.json({
        success: true,
        message: 'Watchlist item updated successfully',
        data: { watchlistItem: updatedItem }
      });
    } catch (error) {
      console.error('Update movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Remove movie from watchlist
  async removeMovie(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Check if movie exists in user's watchlist
      const watchlistItem = await prisma.watchlistItem.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!watchlistItem) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found in watchlist'
        });
      }

      // Remove the item
      await prisma.watchlistItem.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Movie removed from watchlist'
      });
    } catch (error) {
      console.error('Remove movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get watchlist statistics
  async getWatchlistStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const [
        totalMovies,
        watchedMovies,
        unwatchedMovies,
        recentlyAdded
      ] = await Promise.all([
        // Total movies in watchlist
        prisma.watchlistItem.count({ where: { userId } }),
        
        // Watched movies
        prisma.watchlistItem.count({ 
          where: { userId, isWatched: true } 
        }),
        
        // Unwatched movies
        prisma.watchlistItem.count({ 
          where: { userId, isWatched: false } 
        }),
        
        // Recently added (last 7 days)
        prisma.watchlistItem.count({
          where: {
            userId,
            addedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const watchRate = totalMovies > 0 ? (watchedMovies / totalMovies) * 100 : 0;

      res.json({
        success: true,
        data: {
          totalMovies,
          watchedMovies,
          unwatchedMovies,
          recentlyAdded,
          watchRate: Math.round(watchRate * 100) / 100
        }
      });
    } catch (error) {
      console.error('Get watchlist stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
