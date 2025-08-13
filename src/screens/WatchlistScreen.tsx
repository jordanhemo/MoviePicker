import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';

type WatchlistScreenProps = NativeStackScreenProps<RootStackParamList, 'Watchlist'>;

export default function WatchlistScreen({ navigation }: WatchlistScreenProps) {
  const { userPreferences, removeFromWatchlist: removeFromWatchlistContext } = useUserPreferences();
  const { theme } = useTheme();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    // Load watchlist from user preferences
    if (userPreferences.watchlist && userPreferences.watchlist.length > 0) {
      // In a real app, you would fetch movie details from TMDB API
      // For now, we'll use the stored watchlist data
      setWatchlist(userPreferences.watchlist as any);
    }
  }, [userPreferences.watchlist]);

  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)}/10`;
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const removeFromWatchlist = (movieId: number) => {
    // Update both local state and user preferences context
    const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
    setWatchlist(updatedWatchlist);
    
    // Use the context function to remove from watchlist
    removeFromWatchlistContext(movieId);
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
      </View>
      
      {/* Remove button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWatchlist(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>My Watchlist</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Movies you want to watch</Text>
        </View>

        {watchlist.length > 0 ? (
          <FlatList
            data={watchlist}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.moviesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={theme.colors.textTertiary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>Your watchlist is empty</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Start blending movies to add them to your watchlist</Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Blender')}
            >
              <Text style={[styles.emptyStateButtonText, { color: theme.colors.primaryText }]}>Go to Blender</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Account for status bar and hamburger menu
  },
  header: {
    padding: 20,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  moviesList: {
    flex: 1,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 16,
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
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  removeButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  emptyStateButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
