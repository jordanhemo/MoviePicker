import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie, TMDBStreamingProvider } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';
import { API_BASE_URL } from '../config/api';

type MovieDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const { width } = Dimensions.get('window');

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

export default function MovieDetailScreen({ navigation, route }: MovieDetailScreenProps) {
  const { movie } = route.params;
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [streamingServices, setStreamingServices] = useState<TMDBStreamingProvider[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  // Use user preferences context
  const { userPreferences, addToWatchlist, removeFromWatchlist } = useUserPreferences();

  // Use theme context
  const { theme } = useTheme();

  // Check if movie is in user's watchlist
  useEffect(() => {
    const isInWatchlist = userPreferences.watchlist.some(watchlistMovie => watchlistMovie.id === movie.id);
    setIsInWatchlist(isInWatchlist);
  }, [movie.id, userPreferences.watchlist]);

  // Fetch streaming services for the movie
  useEffect(() => {
    fetchMovieStreamingServices();
  }, [movie.id, userPreferences.origin]);

  // Debug logging for streaming services
  useEffect(() => {
    console.log('MovieDetailScreen: streamingServices state updated:', streamingServices.length);
    console.log('MovieDetailScreen: userPreferences.origin:', userPreferences.origin);
  }, [streamingServices, userPreferences.origin]);

  const fetchMovieStreamingServices = async () => {
    try {
      setIsLoadingServices(true);
      // Use the same region code mapping as BlenderScreen for consistency
      const regionCode = userPreferences.origin === 'Israel' ? 'IL' : 
                        userPreferences.origin === 'United States' ? 'US' :
                        userPreferences.origin === 'United Kingdom' ? 'GB' :
                        userPreferences.origin === 'Canada' ? 'CA' :
                        userPreferences.origin === 'Australia' ? 'AU' :
                        userPreferences.origin === 'Germany' ? 'DE' :
                        userPreferences.origin === 'France' ? 'FR' :
                        userPreferences.origin === 'Spain' ? 'ES' :
                        userPreferences.origin === 'Italy' ? 'IT' :
                        userPreferences.origin === 'Japan' ? 'JP' :
                        userPreferences.origin === 'South Korea' ? 'KR' :
                        userPreferences.origin === 'India' ? 'IN' :
                        userPreferences.origin === 'Brazil' ? 'BR' :
                        userPreferences.origin === 'Mexico' ? 'MX' :
                        userPreferences.origin === 'Argentina' ? 'AR' :
                        userPreferences.origin === 'Netherlands' ? 'NL' :
                        userPreferences.origin === 'Sweden' ? 'SE' :
                        userPreferences.origin === 'Norway' ? 'NO' :
                        userPreferences.origin === 'Denmark' ? 'DK' :
                        userPreferences.origin === 'Finland' ? 'FI' :
                        userPreferences.origin === 'Poland' ? 'PL' :
                        userPreferences.origin === 'Czech Republic' ? 'CZ' :
                        userPreferences.origin === 'Hungary' ? 'HU' :
                        userPreferences.origin === 'Romania' ? 'RO' :
                        userPreferences.origin === 'Bulgaria' ? 'BG' : 'US';
      
      console.log('Fetching streaming services for movie:', movie.id, 'region:', regionCode, 'country:', userPreferences.origin);
      const response = await fetch(`${API_BASE_URL}/streaming/tmdb/movie/${movie.id}/providers?region=${regionCode}`);
      const data = await response.json();
      
      if (data.success && data.data.providers) {
        console.log('Received streaming services:', data.data.providers.length);
        setStreamingServices(data.data.providers);
      } else {
        console.log('No streaming services data received:', data);
      }
    } catch (error) {
      console.error('Failed to fetch movie streaming services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const toggleWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isInWatchlist) {
      // Remove from watchlist
      removeFromWatchlist(movie.id);
      setIsInWatchlist(false);
    } else {
      // Add to watchlist
      addToWatchlist(movie);
      setIsInWatchlist(true);
    }
  };

  const shareMovie = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const shareMessage = `Check out ${movie.title} (${new Date(movie.release_date).getFullYear()})! ⭐ ${movie.vote_average.toFixed(1)}/10\n\n${movie.overview}\n\nDiscover more movies on Movie Blender!`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareMessage, {
          mimeType: 'text/plain',
          dialogTitle: `Share ${movie.title}`,
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share movie');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#00ff00';
    if (rating >= 6) return '#ffff00';
    if (rating >= 4) return '#ff8800';
    return '#ff0000';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenreNames = (genreIds: number[]): string[] => {
    return genreIds.map(id => GENRE_NAMES[id] || 'Unknown');
  };

  const getAvailableServices = () => {
    // Show all available streaming services for the movie
    // This gives users a complete view of where they can watch the movie
    return streamingServices;
  };

  const getServiceLogo = (service: TMDBStreamingProvider) => {
    if (service.logo_path) {
      // Use TMDB provider logo
      return `https://image.tmdb.org/t/p/original${service.logo_path}`;
    } else {
      // Fallback to generic logo or placeholder
      return 'https://via.placeholder.com/60x60/333333/ffffff?text=' + service.provider_name.charAt(0);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back to Blender</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            style={styles.heroPoster}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{movie.title}</Text>
              
              {/* Genres below title */}
              <View style={styles.genresContainer}>
                {getGenreNames(movie.genre_ids).map((genre, index) => (
                  <View key={index} style={[styles.genreChip, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.genreText, { color: theme.colors.text }]}>{genre}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.heroMeta}>
                <Text style={[styles.heroYear, { color: theme.colors.textSecondary }]}>
                  {new Date(movie.release_date).getFullYear()}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.ratingText, { color: theme.colors.warning }]}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, isInWatchlist && { backgroundColor: theme.colors.primary }]}
            onPress={toggleWatchlist}
          >
            <Ionicons
              name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isInWatchlist ? theme.colors.primaryText : theme.colors.textSecondary}
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }, isInWatchlist && { color: theme.colors.primaryText }]}>
              Watchlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={shareMovie}>
            <Ionicons name="share-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Movie Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
          <Text style={[styles.overview, { color: theme.colors.textSecondary }]}>{movie.overview}</Text>
        </View>

        {/* Cast */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cast</Text>
          <View style={styles.castContainer}>
            {/* MOCK_CAST removed as per edit hint */}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Release Date:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(movie.release_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Rating:</Text>
            <Text style={[styles.detailValue, { color: getRatingColor(movie.vote_average) }]}>
              {movie.vote_average.toFixed(1)}/10
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Popularity:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{Math.round(movie.popularity)}</Text>
          </View>
        </View>

        {/* Where to Watch */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Where to Watch</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Available streaming services for this movie
          </Text>
          {isLoadingServices ? (
            <View style={styles.loadingServicesContainer}>
              <Text style={[styles.loadingServicesText, { color: theme.colors.textSecondary }]}>Loading streaming availability...</Text>
            </View>
          ) : getAvailableServices().length > 0 ? (
            <View style={styles.streamingServices}>
              {getAvailableServices().map((service) => {
                // Check if user has this service active
                const isUserSubscription = userPreferences.subscriptions.some(sub => 
                  sub.tmdbId === service.provider_id && sub.isActive
                );
                
                return (
                  <View key={service.provider_id} style={[
                    styles.streamingService,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    isUserSubscription && { borderColor: theme.colors.success }
                  ]}>
                    <Image
                      source={{ uri: getServiceLogo(service) }}
                      style={styles.serviceLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: theme.colors.text }]}>{service.provider_name}</Text>
                      <Text style={[styles.servicePrice, { color: theme.colors.textSecondary }]}>Available</Text>
                    </View>
                    <View style={styles.serviceStatus}>
                      {isUserSubscription ? (
                        <>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={20} 
                            color={theme.colors.success} 
                          />
                          <Text style={[styles.serviceStatusText, { color: theme.colors.success }]}>
                            Your Service
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons 
                            name="tv-outline" 
                            size={20} 
                            color={theme.colors.textTertiary} 
                          />
                          <Text style={[styles.serviceStatusText, { color: theme.colors.textTertiary }]}>
                            Available
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noServicesContainer}>
              <Ionicons name="tv-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.noServicesText, { color: theme.colors.textSecondary }]}>No streaming services available</Text>
              <Text style={[styles.noServicesSubtext, { color: theme.colors.textTertiary }]}>
                This movie may not be available on streaming services in your region yet
              </Text>
            </View>
          )}
        </View>

        {/* Similar Movies Suggestion */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>You Might Also Like</Text>
          <Text style={[styles.suggestionText, { color: theme.colors.textSecondary }]}>
            Based on your preferences and this movie, we think you'd enjoy similar films.
          </Text>
          <TouchableOpacity style={[styles.suggestionButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.suggestionButtonText, { color: theme.colors.primaryText }]}>Find Similar Movies</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Account for status bar and hamburger menu
  },
  scrollContainer: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  heroSection: {
    position: 'relative',
    height: 400,
  },
  heroPoster: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  heroYear: {
    fontSize: 18,
    color: '#cccccc',
  },
  ratingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ratingText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#111111',
    minWidth: 120,
    flex: 1,
  },
  actionButtonActive: {
    backgroundColor: '#ffffff',
  },
  actionButtonText: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  actionButtonTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  genreChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 14,
  },
  castContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  castMember: {
    alignItems: 'center',
    width: '20%', // Adjust as needed for 5 columns
  },
  castAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  castImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  castPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  castCharacter: {
    fontSize: 10,
    textAlign: 'center',
  },
  suggestionText: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  suggestionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  suggestionButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  streamingServices: {
    gap: 15,
  },
  streamingService: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 15,
    borderRadius: 10,
  },
  streamingServiceUserSubscription: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  serviceLogo: {
    width: 30,
    height: 30,
    marginRight: 15,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 14,
    color: '#888888',
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  serviceStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noServicesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noServicesText: {
    fontSize: 18,
    color: '#888888',
    marginTop: 10,
  },
  noServicesSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingServicesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingServicesText: {
    fontSize: 16,
    color: '#888888',
  },
});
