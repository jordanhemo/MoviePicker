import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

// Define only the main app screens (excluding auth screens)
type MainAppScreen = Exclude<keyof RootStackParamList, 'Login' | 'Register'>;

interface MenuItem {
  id: MainAppScreen;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'Blender', title: 'Movie Blender', icon: 'shuffle', color: '#333333' },
  { id: 'Search', title: 'Search Movies', icon: 'search', color: '#333333' },
  { id: 'Watchlist', title: 'My Watchlist', icon: 'bookmark', color: '#333333' },
  { id: 'History', title: 'Blend History', icon: 'time', color: '#333333' },
  { id: 'Profile', title: 'Profile', icon: 'person', color: '#333333' },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const { theme, themeType, toggleTheme } = useTheme();
  
  // Animation values - initialize with proper values
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const menuItemAnimations = useRef(
    MENU_ITEMS.map(() => new Animated.Value(0))
  ).current;

  // Memoize the closeMenu function to prevent recreation on every render
  const closeMenu = useCallback(() => {
    StatusBar.setBarStyle(themeType === 'light' ? 'dark-content' : 'light-content');
    
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // Changed to false for opacity
      }),
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      ...menuItemAnimations.map(animation =>
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      setIsOpen(false);
    });
  }, [overlayAnimation, menuAnimation, menuItemAnimations, themeType]);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    StatusBar.setBarStyle(themeType === 'light' ? 'dark-content' : 'light-content');
    
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false, // Changed to false for opacity
      }),
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate menu items with stagger
    const itemAnimations = menuItemAnimations.map((animation, index) =>
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(100, itemAnimations).start();
  }, [overlayAnimation, menuAnimation, menuItemAnimations, themeType]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, closeMenu, openMenu]);

  const handleMenuItemPress = useCallback((screenId: MainAppScreen) => {
    closeMenu();
    // Navigate to the selected screen
    navigation.navigate(screenId as any);
  }, [closeMenu, navigation]);

  const handleLogout = useCallback(() => {
    closeMenu();
    logout();
    // Navigate to login screen after logout
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [closeMenu, logout, navigation]);

  // Close menu when screen changes
  useEffect(() => {
    if (!navigation) return;
    
    const unsubscribe = navigation.addListener('state', () => {
      // Use a timeout to avoid immediate state updates during render
      setTimeout(() => {
        if (isOpen) {
          closeMenu();
        }
      }, 0);
    });

    return unsubscribe;
  }, [navigation, isOpen, closeMenu]);

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity
        style={[styles.hamburgerButton, { backgroundColor: theme.colors.overlay }]}
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.hamburgerIcon,
            {
              transform: [
                {
                  rotate: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="menu" size={24} color={theme.colors.text} />
        </Animated.View>
      </TouchableOpacity>

      {/* Overlay */}
      {isOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnimation,
              backgroundColor: theme.colors.overlay,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={closeMenu}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Menu */}
      <Animated.View
        style={[
          styles.menu,
          {
            transform: [
              {
                translateX: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width * 0.8, 0],
                }),
              },
            ],
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        {/* Menu Header */}
        <View style={[styles.menuHeader, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.menuHeaderContent}>
            <Logo size={50} style={styles.menuLogo} />
            <Text style={[styles.appTitle, { color: theme.colors.text }]}>Movie Picker</Text>
          </View>
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {MENU_ITEMS.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemContainer,
                {
                  transform: [
                    {
                      translateX: menuItemAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                  opacity: menuItemAnimations[index],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Ionicons name={item.icon} size={20} color={theme.colors.text} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Theme Switcher */}
        <View style={[styles.themeSection, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.colors.surfaceSecondary }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={[styles.themeIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons 
                name={themeType === 'light' ? 'moon' : 'sunny'} 
                size={20} 
                color={theme.colors.primaryText} 
              />
            </View>
            <Text style={[styles.themeText, { color: theme.colors.text }]}>
              {themeType === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={[styles.menuFooter, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.logoutIcon, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            </View>
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hamburgerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: height,
    zIndex: 1001,
    elevation: 10,
  },
  menuHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuHeaderContent: {
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItemContainer: {
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuFooter: {
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuLogo: {
    marginBottom: 10,
  },
  themeSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
