import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';

import { UserPreferencesProvider } from './src/context/UserPreferencesContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Import your existing screens
import BlenderScreen from './src/screens/BlenderScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { AuthProvider } from './src/context/AuthContext';

// Import new auth screens (we'll create these next)


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserPreferencesProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Auth Screens */}
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{ headerShown: false }}
              />

              {/* Main App Screens */}
              <Stack.Screen 
                name="Blender" 
                component={BlenderScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="History" 
                component={HistoryScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="MovieDetail" 
                component={MovieDetailScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Watchlist" 
                component={WatchlistScreen} 
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </UserPreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}