// Base API configuration
import { API_BASE_URL } from '../config/api';

// API response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// User types
interface User {
  id: string;
  email: string;
  location?: string;
  profileImage?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  location?: string;
}

// API service class
class ApiService {
  private accessToken: string | null = null;

  // Set authentication token
  setAuthToken(token: string) {
    this.accessToken = token;
  }

  // Clear authentication token
  clearAuthToken() {
    this.accessToken = null;
  }

  // Get headers for authenticated requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Make API request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/me');
  }

  // User profile endpoints
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Watchlist endpoints
  async getWatchlist(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/watchlist?page=${page}&limit=${limit}`);
  }

  async addToWatchlist(movieData: { movieId: number; movieTitle: string; moviePoster?: string }): Promise<ApiResponse<any>> {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async removeFromWatchlist(watchlistId: string): Promise<ApiResponse<any>> {
    return this.request(`/watchlist/${watchlistId}`, {
      method: 'DELETE',
    });
  }

  // Streaming services endpoints
  async getStreamingServices(): Promise<ApiResponse<any>> {
    return this.request('/streaming/services');
  }

  async getUserStreamingServices(): Promise<ApiResponse<any>> {
    return this.request('/streaming/user-services');
  }

  async toggleStreamingService(serviceId: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request('/streaming/toggle-service', {
      method: 'POST',
      body: JSON.stringify({ streamingServiceId: serviceId, isActive }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export type { User, AuthTokens, LoginCredentials, RegisterData };