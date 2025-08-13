import { Request, Response } from 'express';
import { prisma } from '../index';
import { streamingService } from '../services/streamingService';

export const streamingController = {
  // Get available streaming services from TMDB for a specific region
  async getTMDBStreamingServices(req: Request, res: Response) {
    try {
      const { region = 'US' } = req.query;
      const providers = await streamingService.getAvailableProviders(region as string);

      res.json({
        success: true,
        data: { 
          providers,
          region: region as string
        }
      });
    } catch (error) {
      console.error('Get TMDB streaming services error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get streaming providers for a specific movie
  async getMovieStreamingProviders(req: Request, res: Response) {
    try {
      const { movieId } = req.params;
      const { region = 'US' } = req.query;
      
      if (!movieId) {
        return res.status(400).json({
          success: false,
          message: 'Movie ID is required'
        });
      }

      const providers = await streamingService.getMovieProviders(parseInt(movieId), region as string);

      res.json({
        success: true,
        data: { 
          providers,
          movieId: parseInt(movieId),
          region: region as string
        }
      });
    } catch (error) {
      console.error('Get movie streaming providers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get streaming providers for a specific TV show
  async getTVShowStreamingProviders(req: Request, res: Response) {
    try {
      const { tvId } = req.params;
      const { region = 'US' } = req.query;
      
      if (!tvId) {
        return res.status(400).json({
          success: false,
          message: 'TV Show ID is required'
        });
      }

      const providers = await streamingService.getTVShowProviders(parseInt(tvId), region as string);

      res.json({
        success: true,
        data: { 
          providers,
          tvId: parseInt(tvId),
          region: region as string
        }
      });
    } catch (error) {
      console.error('Get TV show streaming providers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get available regions
  async getAvailableRegions(req: Request, res: Response) {
    try {
      const regions = await streamingService.getAvailableRegions();

      res.json({
        success: true,
        data: { regions }
      });
    } catch (error) {
      console.error('Get available regions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get all available streaming services from database
  async getAvailableServices(req: Request, res: Response) {
    try {
      const services = await prisma.streamingService.findMany({
        where: { isActive: true },
        orderBy: { displayName: 'asc' }
      });

      res.json({
        success: true,
        data: { services }
      });
    } catch (error) {
      console.error('Get available services error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user's streaming services
  async getUserServices(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const userServices = await prisma.userStreamingService.findMany({
        where: { userId },
        include: {
          streamingService: true
        },
        orderBy: {
          streamingService: {
            displayName: 'asc'
          }
        }
      });

      res.json({
        success: true,
        data: { userServices }
      });
    } catch (error) {
      console.error('Get user services error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Toggle streaming service subscription
  async toggleService(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { streamingServiceId, isActive } = req.body;

      // Check if service exists
      const service = await prisma.streamingService.findUnique({
        where: { id: streamingServiceId }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Streaming service not found'
        });
      }

      if (isActive) {
        // Add or activate service
        await prisma.userStreamingService.upsert({
          where: {
            userId_streamingServiceId: {
              userId,
              streamingServiceId
            }
          },
          update: {
            isActive: true
          },
          create: {
            userId,
            streamingServiceId,
            isActive: true
          }
        });

        res.json({
          success: true,
          message: `${service.displayName} subscription activated`
        });
      } else {
        // Deactivate service
        await prisma.userStreamingService.updateMany({
          where: {
            userId,
            streamingServiceId
          },
          data: {
            isActive: false
          }
        });

        res.json({
          success: true,
          message: `${service.displayName} subscription deactivated`
        });
      }
    } catch (error) {
      console.error('Toggle service error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user preferences
  async getUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      let preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      // Create default preferences if none exist
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: {
            userId,
            favoriteGenres: [],
            preferredLanguage: 'en',
            adultContent: false,
            notificationEnabled: true,
            theme: 'dark'
          }
        });
      }

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      console.error('Get user preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user preferences
  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { favoriteGenres, preferredLanguage, adultContent, notificationEnabled, theme } = req.body;

      const updatedPreferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          ...(favoriteGenres !== undefined && { favoriteGenres }),
          ...(preferredLanguage !== undefined && { preferredLanguage }),
          ...(adultContent !== undefined && { adultContent }),
          ...(notificationEnabled !== undefined && { notificationEnabled }),
          ...(theme !== undefined && { theme })
        },
        create: {
          userId,
          favoriteGenres: favoriteGenres || [],
          preferredLanguage: preferredLanguage || 'en',
          adultContent: adultContent || false,
          notificationEnabled: notificationEnabled !== undefined ? notificationEnabled : true,
          theme: theme || 'dark'
        }
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: updatedPreferences }
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
