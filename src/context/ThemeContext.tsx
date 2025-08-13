import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Interactive elements
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  
  // Borders and dividers
  border: string;
  borderSecondary: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  
  // Overlay and shadows
  overlay: string;
  shadow: string;
  
  // Logo colors
  logo: {
    dogFace: string;
    dogFaceInner: string;
    dogEars: string;
    dogEyes: string;
    dogEyesHighlight: string;
    glassesFrame: string;
    glassesRedLens: string;
    glassesBlueLens: string;
    dogNose: string;
    dogMouth: string;
  };
}

export interface Theme {
  type: ThemeType;
  colors: ThemeColors;
}

const LIGHT_THEME: Theme = {
  type: 'light',
  colors: {
    // Background colors
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceSecondary: '#e9ecef',
    
    // Text colors
    text: '#212529',
    textSecondary: '#6c757d',
    textTertiary: '#adb5bd',
    
    // Interactive elements - Using dog colors instead of blue
    primary: '#8B4513',        // Dog face brown
    primaryText: '#ffffff',    // White text on brown
    secondary: '#D2B48C',      // Dog face inner color
    secondaryText: '#8B4513',  // Brown text on light brown
    
    // Borders and dividers
    border: '#dee2e6',
    borderSecondary: '#ced4da',
    
    // Status colors
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    
    // Overlay and shadows
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Logo colors - Original logo colors for light theme
    logo: {
      dogFace: '#8B4513',        // Brown face
      dogFaceInner: '#D2B48C',   // Lighter brown inner face
      dogEars: '#8B4513',        // Brown ears
      dogEyes: '#000000',        // Black eyes
      dogEyesHighlight: '#FFFFFF', // White eye highlights
      glassesFrame: '#000000',   // Black glasses frame
      glassesRedLens: '#FF0000', // Red lens
      glassesBlueLens: '#0000FF', // Blue lens
      dogNose: '#000000',        // Black nose
      dogMouth: '#000000',       // Black mouth
    },
  },
};

const DARK_THEME: Theme = {
  type: 'dark',
  colors: {
    // Background colors
    background: '#000000',
    surface: '#111111',
    surfaceSecondary: '#1a1a1a',
    
    // Text colors - Back to original dark theme colors
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#888888',
    
    // Interactive elements - Back to original dark theme colors
    primary: '#ffffff',
    primaryText: '#000000',
    secondary: '#333333',
    secondaryText: '#ffffff',
    
    // Borders and dividers - Back to original dark theme colors
    border: '#333333',
    borderSecondary: '#444444',
    
    // Status colors
    success: '#00ff00',
    error: '#ff4444',
    warning: '#ffaa00',
    
    // Overlay and shadows
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.25)',
    
    // Logo colors - Dark theme adapted colors
    logo: {
      dogFace: '#A0522D',        // Lighter brown face for dark theme
      dogFaceInner: '#DEB887',   // Even lighter brown inner face
      dogEars: '#A0522D',        // Lighter brown ears
      dogEyes: '#ffffff',        // White eyes for dark theme
      dogEyesHighlight: '#000000', // Black eye highlights for contrast
      glassesFrame: '#ffffff',   // White glasses frame
      glassesRedLens: '#FF6B6B', // Softer red lens
      glassesBlueLens: '#4ECDC4', // Softer blue lens
      dogNose: '#ffffff',        // White nose
      dogMouth: '#ffffff',       // White mouth
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@MoviePicker:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [theme, setThemeState] = useState<Theme>(DARK_THEME);

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Update theme when themeType changes
  useEffect(() => {
    setThemeState(themeType === 'light' ? LIGHT_THEME : DARK_THEME);
  }, [themeType]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeType(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load saved theme:', error);
    }
  };

  const saveTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeType(newTheme);
    saveTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    themeType,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { LIGHT_THEME, DARK_THEME };
