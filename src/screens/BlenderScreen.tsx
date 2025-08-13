import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { movieService } from '../services/tmdbApi';
import { Movie } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';
import { useFocusEffect } from '@react-navigation/native';

type BlenderScreenProps = NativeStackScreenProps<RootStackParamList, 'Blender'>;

const { width, height } = Dimensions.get('window');

const CATCHY_SENTENCES = [
  "Feeling indecisive? Let your preferences guide you! 🎯",
  "Can't choose? We'll pick something perfect for you! ✨",
  "Ready for a personalized surprise? Let's blend! 🎬",
  "Time to discover something tailored to your taste! 🚀",
  "Let your preferences choose your next adventure! 🌟",
  "Feeling lucky? Your taste knows best! 🍀",
  "Your next favorite movie is just one blend away! 💫",
  "Surprise yourself with a movie made for you! 🎭",
  "Blending movies that match your style! 🎨",
  "Personalized recommendations, just for you! 🎁",
];

// Genre mapping
const GENRE_NAMES: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export default function BlenderScreen({ navigation }: BlenderScreenProps) {
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [catchySentence, setCatchySentence] = useState<string>('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Animation values
  const watchlistScale = useRef(new Animated.Value(1)).current;
  const watchlistColor = useRef(new Animated.Value(0)).current;
  const cardEntrance = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;
  
  // Use the user preferences context
  const { userPreferences, getRegionCode, addToWatchlist: addToWatchlistContext } = useUserPreferences();

  // Use the theme context
  const { theme } = useTheme();

  // Refresh watchlist state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (currentMovie) {
        // Check if current movie is in watchlist and update state
        const isInWatchlist = userPreferences.watchlist.some(watchlistMovie => watchlistMovie.id === currentMovie.id);
        setIsInWatchlist(isInWatchlist);
      }
    }, [currentMovie, userPreferences.watchlist])
  );

  const pickRandomMovie = async () => {
    console.log('pickRandomMovie called');
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Button animation on click
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    
    // Button rotation animation
    Animated.timing(buttonRotation, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
      buttonRotation.setValue(0);
    });
    
    setIsLoading(true);
    try {
      // Get the region code from user's selected country
      const regionCode = getRegionCode(userPreferences.origin);
      console.log('Using region code:', regionCode, 'for country:', userPreferences.origin);
      
      // Get user's favorite genres for preference-based recommendations
      const favoriteGenres = userPreferences.favoriteGenres || [];
      console.log('User favorite genres:', favoriteGenres);
      
      // Get user's active streaming services
      const activeStreamingServices = userPreferences.subscriptions
        .filter(sub => sub.isActive)
        .map(sub => sub.tmdbId?.toString())
        .filter(Boolean); // Filter out undefined values
      console.log('User active streaming services:', activeStreamingServices);
      
      // Use preference-based movie selection for better recommendations
      const movie = await movieService.getPreferenceBasedRandomMovie(
        favoriteGenres,
        regionCode, 
        activeStreamingServices
      );
      
      console.log('Preference-based movie received:', movie ? movie.title : 'No movie');
      setCurrentMovie(movie);
      
      // Check if movie is already in watchlist
      const isInWatchlist = userPreferences.watchlist.some(watchlistMovie => watchlistMovie.id === movie?.id);
      setIsInWatchlist(isInWatchlist);
      
      // Change catchy sentence after each blend
      setCatchySentence(CATCHY_SENTENCES[Math.floor(Math.random() * CATCHY_SENTENCES.length)]);
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Card entrance animation
      cardEntrance.setValue(0);
      Animated.spring(cardEntrance, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
    } catch (error) {
      console.error('Error picking random movie:', error);
      Alert.alert('Error', 'Failed to pick a random movie. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const addToWatchlist = () => {
    if (currentMovie) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(watchlistScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(watchlistScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      Animated.timing(watchlistColor, { toValue: 1, duration: 300, useNativeDriver: false }).start();
      
      // Add to watchlist using context
      addToWatchlistContext(currentMovie);
      setIsInWatchlist(true);
      
      // Auto-blend to next movie after a short delay
      setTimeout(() => pickRandomMovie(), 1000);
    }
  };

  useEffect(() => {
    setCatchySentence(CATCHY_SENTENCES[0]);
    
    // Only load initial movie if we haven't initialized yet
    if (!hasInitialized) {
      pickRandomMovie();
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)}/10`;
  };

  const getGenreNames = (genreIds: number[]): string[] => {
    return genreIds.map(id => GENRE_NAMES[id] || 'Unknown');
  };

  // Interpolate button rotation
  const buttonRotate = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Card entrance animation
  const cardAnimatedStyle = {
    transform: [
      {
        translateY: cardEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      },
      {
        scale: cardEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    opacity: cardEntrance,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {currentMovie ? (
          // Show current movie card with entrance animation
          <Animated.View style={[styles.movieCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }, cardAnimatedStyle]}>

            
            <TouchableOpacity
              onPress={() => handleMoviePress(currentMovie)}
              activeOpacity={0.9}
            >
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w400${currentMovie.poster_path}`,
                }}
                style={styles.poster}
                resizeMode="cover"
              />
              
              {/* Watchlist Icon */}
              <TouchableOpacity
                style={styles.watchlistButton}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent opening movie details
                  addToWatchlist();
                }}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale: watchlistScale }] }}>
                  <Ionicons 
                    name={isInWatchlist ? "bookmark" : "bookmark-outline"} 
                    size={28} 
                    color={isInWatchlist ? theme.colors.success : theme.colors.text} 
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <View style={styles.movieInfo}>
                <Text style={[styles.movieTitle, { color: theme.colors.text }]}>{currentMovie.title}</Text>
                <Text style={[styles.movieYear, { color: theme.colors.textSecondary }]}>
                  {new Date(currentMovie.release_date).getFullYear()}
                </Text>
                <Text style={[styles.movieRating, { color: theme.colors.warning }]}>⭐ {formatRating(currentMovie.vote_average)}</Text>
                
                {/* Genre Tags - styled like movie details */}
                <View style={styles.genreContainer}>
                  {getGenreNames(currentMovie.genre_ids).map((genre, index) => (
                    <View key={index} style={[styles.genreTag, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
                      <Text style={[styles.genreText, { color: theme.colors.text }]}>{genre}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={[styles.movieOverview, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                  {currentMovie.overview}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : isLoading ? (
          // Show loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Blending your perfect movie...</Text>
          </View>
        ) : (
          // Show catchy sentence
          <View style={styles.catchyContainer}>
            <Text style={[styles.catchyText, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.primary, shadowColor: theme.colors.shadow }]}>{catchySentence}</Text>
            <Text style={[styles.catchySubtext, { color: theme.colors.textSecondary }]}>
              Press the blend button below to get started!
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={pickRandomMovie}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.primaryText }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Blender Button at Bottom */}
      <View style={styles.buttonContainer}>
        <Animated.View style={[
          styles.blendButton,
          { backgroundColor: theme.colors.primary, shadowColor: theme.colors.shadow },
          isLoading && styles.blendButtonLoading,
          {
            transform: [
              { scale: buttonScale },
              { rotate: buttonRotate }
            ]
          }
        ]}>
          <TouchableOpacity
            onPress={pickRandomMovie}
            disabled={isLoading}
            activeOpacity={0.8}
            style={styles.blendButtonTouchable}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primaryText} size="large" />
            ) : (
              <Text style={[styles.blendText, { color: theme.colors.primaryText }]}>BLEND!</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingTop: 100, // Account for status bar and hamburger menu
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catchyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  catchyText: {
    fontSize: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 32,
    padding: 25,
    borderRadius: 20,
    borderLeftWidth: 5,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  catchySubtext: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  movieCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    width: width * 0.8,
    maxWidth: 350,
  },

  poster: {
    width: '100%',
    height: 250,
  },
  movieInfo: {
    padding: 20,
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  movieYear: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  movieRating: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  movieOverview: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'center',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 12,
  },

  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingTop: 20,
  },
  blendButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    // White border
    borderWidth: 4,
  },
  blendButtonLoading: {
    opacity: 0.6,
  },
  blendText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  blendButtonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  watchlistButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  preferencesIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#111111',
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#333333',
    zIndex: 1,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  preferenceText: {
    color: '#ffffff',
    fontSize: 12,
  },
});
