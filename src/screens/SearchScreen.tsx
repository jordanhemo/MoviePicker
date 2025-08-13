import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { movieService } from '../services/tmdbApi';
import { Movie, Genre, MovieSearchParams } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';

type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  
  // Use the user preferences context
  const { userPreferences, getRegionCode } = useUserPreferences();

  // Use the theme context
  const { theme } = useTheme();

  useEffect(() => {
    loadGenres();
    loadPopularMovies();
  }, [userPreferences.origin]); // Reload when origin changes

  const loadGenres = async () => {
    try {
      const response = await movieService.getGenres();
      setGenres(response.genres);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const loadPopularMovies = async (page: number = 1) => {
    setIsLoading(true);
    try {
      // Get the region code from user's selected country
      const regionCode = getRegionCode(userPreferences.origin);
      console.log('Loading popular movies for region:', regionCode, 'country:', userPreferences.origin);
      
      const response = await movieService.getPopularMovies(page, regionCode);
      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      setHasMorePages(page < response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load movies:', error);
      Alert.alert('Error', 'Failed to load movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchMovies = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      loadPopularMovies(page);
      return;
    }

    setIsLoading(true);
    try {
      const params: MovieSearchParams = {
        query: query.trim(),
        ...(selectedGenre && { genre: selectedGenre }),
        ...(selectedYear && { year: selectedYear }),
        ...(selectedRating && { rating: selectedRating }),
      };

      const response = await movieService.searchMovies(params, page);
      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      setHasMorePages(page < response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to search movies:', error);
      Alert.alert('Error', 'Failed to search movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchMovies(searchQuery, 1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMorePages) {
      const nextPage = currentPage + 1;
      if (searchQuery.trim()) {
        searchMovies(searchQuery, nextPage);
      } else {
        loadPopularMovies(nextPage);
      }
    }
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedYear(null);
    setSelectedRating(null);
    setSearchQuery('');
    setCurrentPage(1);
    loadPopularMovies(1);
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={[styles.movieItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
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
        <Text style={[styles.movieRating, { color: theme.colors.warning }]}>⭐ {item.vote_average.toFixed(1)}/10</Text>
        <Text style={[styles.movieOverview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
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

  const renderFilterChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip, 
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        isSelected && { backgroundColor: theme.colors.primary }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText, 
        { color: theme.colors.textSecondary },
        isSelected && { color: theme.colors.primaryText }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      
      <View style={styles.content}>
        {/* Region Indicator */}
        <View style={[styles.regionIndicator, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.regionText, { color: theme.colors.textSecondary }]}>
            Showing movies available in {userPreferences.origin} ({getRegionCode(userPreferences.origin)})
          </Text>
          <TouchableOpacity
            style={[styles.changeRegionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={[styles.changeRegionButtonText, { color: theme.colors.primaryText }]}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="search" size={20} color={theme.colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search movies..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.primary }]} onPress={handleSearch}>
            <Text style={[styles.searchButtonText, { color: theme.colors.primaryText }]}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderFilterChip('All Genres', selectedGenre === null, () => setSelectedGenre(null))}
            {genres.slice(0, 10).map(genre => (
              <View key={genre.id} style={{ marginRight: 10 }}>
                {renderFilterChip(
                  genre.name,
                  selectedGenre === genre.id,
                  () => setSelectedGenre(genre.id)
                )}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.filterRow}>
            {renderFilterChip('All Years', selectedYear === null, () => setSelectedYear(null))}
            {[2024, 2023, 2022, 2021, 2020].map(year => (
              <View key={year} style={{ marginRight: 10 }}>
                {renderFilterChip(
                  year.toString(),
                  selectedYear === year,
                  () => setSelectedYear(year)
                )}
              </View>
            ))}
          </View>

          <View style={styles.filterRow}>
            {renderFilterChip('All Ratings', selectedRating === null, () => setSelectedRating(null))}
            {[8, 7, 6, 5].map(rating => (
              <View key={rating} style={{ marginRight: 10 }}>
                {renderFilterChip(
                  `${rating}+`,
                  selectedRating === rating,
                  () => setSelectedRating(rating)
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Movies List */}
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.moviesList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isLoading && hasMorePages ? (
              <ActivityIndicator style={styles.loadingIndicator} color={theme.colors.primary} />
            ) : null
          }
        />
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
  regionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    borderRadius: 10,
  },
  regionText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  changeRegionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeRegionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  filtersContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipSelected: {
    // Theme colors applied dynamically
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipTextSelected: {
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  clearFiltersText: {
    fontSize: 14,
    textDecorationLine: 'underline',
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
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availabilityText: {
    fontSize: 11,
    color: '#00ff00',
    fontWeight: '500',
  },
  loadingIndicator: {
    padding: 20,
  },
});
