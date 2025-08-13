import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.value
      }))
    });
  }

  next();
};

// Custom validation helpers
export const customValidators = {
  // Validate streaming service IDs
  isValidStreamingServiceId: (value: string) => {
    // You can add validation logic here
    return true;
  },

  // Validate movie ID (TMDB format)
  isValidMovieId: (value: number) => {
    return Number.isInteger(value) && value > 0;
  },

  // Validate location format
  isValidLocation: (value: string) => {
    // Basic location validation (country code or name)
    return /^[A-Za-z\s\-']{2,100}$/.test(value);
  },

  // Validate username format
  isValidUsername: (value: string) => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(value);
  }
};
