import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

interface DecodedToken {
  userId: string;
  type: string;
  iat: number;
  exp: number;
}

export const jwtService = {
  // Generate access and refresh tokens
  generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId, type: 'access' } as TokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' } as TokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  },

  // Verify access token
  verifyAccessToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as DecodedToken;
      
      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  },

  // Verify refresh token
  verifyRefreshToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as DecodedToken;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  },

  // Generate biometric token (for Face ID/Touch ID)
  generateBiometricToken(userId: string, deviceId: string) {
    return jwt.sign(
      { 
        userId, 
        type: 'biometric',
        deviceId,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' } // Biometric tokens last longer
    );
  },

  // Verify biometric token
  verifyBiometricToken(token: string): { userId: string; deviceId: string } | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      if (decoded.type !== 'biometric' || !decoded.userId || !decoded.deviceId) {
        return null;
      }

      return {
        userId: decoded.userId,
        deviceId: decoded.deviceId
      };
    } catch (error) {
      return null;
    }
  }
};

// Export individual functions for backward compatibility
export const generateTokens = jwtService.generateTokens;
export const verifyRefreshToken = jwtService.verifyRefreshToken;
