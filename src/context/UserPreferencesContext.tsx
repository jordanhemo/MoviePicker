import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, Subscription } from '../types';

interface UserPreferencesContextType {
  userPreferences: UserPreferences;
  updateOrigin: (origin: string) => void;
  updateSubscriptions: (subscriptions: Subscription[]) => void;
  toggleSubscription: (subscriptionId: string) => void;
  addSubscription: (subscription: Omit<Subscription, 'isActive'>) => void;
  removeSubscription: (subscriptionId: string) => void;
  addToWatchlist: (movie: any) => void;
  removeFromWatchlist: (movieId: number) => void;
  toggleGenre: (genreId: number) => void;
  getRegionCode: (countryName: string) => string;
  getRegionDisplayName: (regionCode: string) => string;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  ORIGIN: 'user_origin',
  SUBSCRIPTIONS: 'user_subscriptions',
  FAVORITE_GENRES: 'user_favorite_genres',
  WATCHLIST: 'user_watchlist',
};

const COUNTRY_TO_REGION_MAP: { [key: string]: string } = {
  'United States': 'US',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'Japan': 'JP',
  'South Korea': 'KR',
  'India': 'IN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Israel': 'IL',
};

const REGION_TO_COUNTRY_MAP: { [key: string]: string } = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'JP': 'Japan',
  'KR': 'South Korea',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'IL': 'Israel',
};

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    origin: 'United States',
    subscriptions: [], // Start with empty subscriptions - users will add their own
    favoriteGenres: [], // Start with no favorite genres - users will select their own
    watchlist: [],
  });

  // Load saved preferences on app start
  useEffect(() => {
    loadSavedPreferences();
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences();
  }, [userPreferences]);

  const loadSavedPreferences = async () => {
    try {
      const savedOrigin = await AsyncStorage.getItem(STORAGE_KEYS.ORIGIN);
      const savedSubscriptions = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const savedFavoriteGenres = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_GENRES);
      const savedWatchlist = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);

      if (savedOrigin || savedSubscriptions || savedFavoriteGenres || savedWatchlist) {
        setUserPreferences(prev => ({
          ...prev,
          origin: savedOrigin || prev.origin,
          subscriptions: savedSubscriptions ? JSON.parse(savedSubscriptions) : prev.subscriptions,
          favoriteGenres: savedFavoriteGenres ? JSON.parse(savedFavoriteGenres) : prev.favoriteGenres,
          watchlist: savedWatchlist ? JSON.parse(savedWatchlist) : prev.watchlist,
        }));
      }
    } catch (error) {
      console.error('Failed to load saved preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORIGIN, userPreferences.origin);
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(userPreferences.subscriptions));
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_GENRES, JSON.stringify(userPreferences.favoriteGenres));
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(userPreferences.watchlist));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const updateOrigin = (origin: string) => {
    setUserPreferences(prev => ({ ...prev, origin }));
  };

  const updateSubscriptions = (subscriptions: Subscription[]) => {
    setUserPreferences(prev => ({ ...prev, subscriptions }));
  };

  const toggleSubscription = (subscriptionId: string) => {
    setUserPreferences(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, isActive: !sub.isActive }
          : sub
      ),
    }));
  };

  const addSubscription = (subscription: Omit<Subscription, 'isActive'>) => {
    const exists = userPreferences.subscriptions.find(sub => sub.id === subscription.id);
    if (!exists) {
      setUserPreferences(prev => ({
        ...prev,
        subscriptions: [...prev.subscriptions, { ...subscription, isActive: true }],
      }));
    }
  };

  const removeSubscription = (subscriptionId: string) => {
    setUserPreferences(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(sub => sub.id !== subscriptionId),
    }));
  };

  const addToWatchlist = (movie: any) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: [...prev.watchlist, movie],
    }));
  };

  const removeFromWatchlist = (movieId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(movie => movie.id !== movieId),
    }));
  };

  const toggleGenre = (genreId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genreId)
        ? prev.favoriteGenres.filter(id => id !== genreId)
        : [...prev.favoriteGenres, genreId],
    }));
  };

  const getRegionCode = (countryName: string): string => {
    return COUNTRY_TO_REGION_MAP[countryName] || 'US';
  };

  const getRegionDisplayName = (regionCode: string): string => {
    return REGION_TO_COUNTRY_MAP[regionCode] || regionCode;
  };

  const value: UserPreferencesContextType = {
    userPreferences,
    updateOrigin,
    updateSubscriptions,
    toggleSubscription,
    addSubscription,
    removeSubscription,
    addToWatchlist,
    removeFromWatchlist,
    toggleGenre,
    getRegionCode,
    getRegionDisplayName,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
