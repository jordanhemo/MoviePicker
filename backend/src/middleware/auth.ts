import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    const decoded = jwtService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: '', // Will be populated if needed
      username: '' // Will be populated if needed
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwtService.verifyAccessToken(token);
      
      if (decoded) {
        req.user = {
          id: decoded.userId,
          email: '',
          username: ''
        };
      }
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
    }
  }

  next();
};

// Role-based access control (for future use)
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For now, all authenticated users have access
    // You can implement role checking here later
    next();
  };
};
