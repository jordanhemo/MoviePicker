import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { movieService } from '../services/tmdbApi';
import { Movie } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';

type HistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [movieHistory, setMovieHistory] = useState<Movie[]>([]);
  
  // Use the user preferences context
  const { userPreferences, getRegionCode } = useUserPreferences();

  // Use the theme context
  const { theme } = useTheme();

  // Load movie history when component mounts or origin changes
  useEffect(() => {
    loadMovieHistory();
  }, [userPreferences.origin]); // Reload when origin changes

  const loadMovieHistory = () => {
    // In a real app, this would load from AsyncStorage, backend, or TMDB API
    // For now, we'll show an empty state
    setMovieHistory([]);
  };

  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)}/10`;
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={[styles.movieItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
        }}
        style={styles.moviePoster}
        resizeMode="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={[styles.movieTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.movieYear, { color: theme.colors.textSecondary }]}>
          {new Date(item.release_date).getFullYear()}
        </Text>
        <Text style={[styles.movieRating, { color: theme.colors.warning }]}>⭐ {formatRating(item.vote_average)}</Text>
        <Text style={[styles.movieOverview, { color: theme.colors.textSecondary }]} numberOfLines={3}>
          {item.overview}
        </Text>
        
        {/* Region availability indicator */}
        <View style={styles.availabilityInfo}>
          <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
          <Text style={[styles.availabilityText, { color: theme.colors.textSecondary }]}>
            Available in {userPreferences.origin}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Movie History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your recent movie discoveries</Text>
        
        {/* Region Display */}
        <View style={styles.regionInfo}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.regionText, { color: theme.colors.textSecondary }]}>
            Showing movies available in {userPreferences.origin}
          </Text>
        </View>
      </View>

      {movieHistory.length > 0 ? (
        <FlatList
          data={movieHistory}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.moviesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No movie history yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Start blending movies to build your history</Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Blender')}
          >
            <Text style={[styles.emptyStateButtonText, { color: theme.colors.primaryText }]}>Go to Blender</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 100, // Account for status bar and hamburger menu
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  regionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  regionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  moviesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 1,
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  movieYear: {
    fontSize: 14,
    marginBottom: 5,
  },
  movieRating: {
    fontSize: 14,
    marginBottom: 5,
  },
  movieOverview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availabilityText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
