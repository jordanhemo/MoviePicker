import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, AuthTokens } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a stored token
      const storedToken = await getStoredToken();
      if (storedToken) {
        apiService.setAuthToken(storedToken);
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.log('No stored authentication found');
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredToken = async (): Promise<string | null> => {
    // For now, use AsyncStorage. In production, use react-native-keychain
    try {
      // This is a placeholder - you'll implement proper token storage
      return null;
    } catch (error) {
      return null;
    }
  };

  const storeToken = async (token: string) => {
    // Store token securely (implement with react-native-keychain later)
    try {
      // Placeholder implementation
      console.log('Token stored:', token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        setUser(user);
        apiService.setAuthToken(tokens.accessToken);
        await storeToken(tokens.accessToken);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        setUser(user);
        apiService.setAuthToken(tokens.accessToken);
        await storeToken(tokens.accessToken);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiService.clearAuthToken();
    // Clear stored token
    // In a real app, you would clear AsyncStorage or secure storage here
    console.log('User logged out');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};