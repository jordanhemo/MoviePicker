import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,

  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription, TMDBStreamingProvider } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { API_BASE_URL } from '../config/api';
import HamburgerMenu from '../components/HamburgerMenu';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Available movie genres for user selection
const AVAILABLE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const POPULAR_COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Japan', 'South Korea', 'India', 'Brazil',
  'Mexico', 'Argentina', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
  'Israel'
];

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [tmdbStreamingServices, setTmdbStreamingServices] = useState<TMDBStreamingProvider[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  // Use the user preferences context
  const { 
    userPreferences, 
    updateOrigin, 
    updateSubscriptions, 
    toggleSubscription, 
    addSubscription, 
    removeSubscription,
    getRegionCode,
    toggleGenre
  } = useUserPreferences();

  // Use the theme context
  const { theme } = useTheme();

  // Fetch TMDB streaming services when component mounts
  useEffect(() => {
    fetchTMDBStreamingServices();
  }, []);

  // Refresh streaming services when user's origin changes
  useEffect(() => {
    if (userPreferences.origin) {
      console.log('User origin changed to:', userPreferences.origin, 'refreshing streaming services...');
      // Small delay to ensure context is fully updated
      const timer = setTimeout(() => {
        fetchTMDBStreamingServices();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userPreferences.origin]);

  const fetchTMDBStreamingServices = async () => {
    try {
      setIsLoadingServices(true);
      
      // Clear existing services first to avoid showing old data
      setTmdbStreamingServices([]);
      
      // If user hasn't set a location, use a default region to show popular services
      let regionCode = 'US'; // Default to US for broader service availability
      
      if (userPreferences.origin) {
        regionCode = getRegionCode(userPreferences.origin);
      }
      
      console.log('Fetching streaming services for region:', regionCode, 'user origin:', userPreferences.origin);
      
      const response = await fetch(`${API_BASE_URL}/streaming/tmdb/services?region=${regionCode}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Received streaming services for region', regionCode, ':', data.data.providers.length);
        setTmdbStreamingServices(data.data.providers);
      } else {
        console.log('Failed to fetch streaming services for region', regionCode, ':', data);
        // Fallback to empty array if API fails
        setTmdbStreamingServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch TMDB streaming services:', error);
      // Fallback to empty array if API fails
      setTmdbStreamingServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const selectOrigin = async (origin: string) => {
    try {
      // Update origin first
      updateOrigin(origin);
      setShowOriginModal(false);
      setSearchOrigin('');
      
      // The useEffect will automatically refresh services when userPreferences.origin changes
      // No need to manually call fetchTMDBStreamingServices here
      
      Alert.alert('Location Updated', `Your location has been set to ${origin}. Movies will now be filtered for this region.`);
    } catch (error) {
      console.error('Error updating origin:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  };

  const filteredCountries = POPULAR_COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchOrigin.toLowerCase())
  );

  const renderSubscriptionItem = (subscription: Subscription) => (
    <View key={subscription.id} style={styles.subscriptionItem}>
      <View style={styles.subscriptionInfo}>
        <Image
          source={{ uri: subscription.logo }}
          style={styles.subscriptionLogo}
          resizeMode="contain"
        />
        <Text style={styles.subscriptionName}>{subscription.name}</Text>
      </View>
      <View style={styles.subscriptionActions}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeSubscription(subscription.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableSubscription = (provider: TMDBStreamingProvider) => {
    const isAdded = userPreferences.subscriptions.find(sub => sub.tmdbId === provider.provider_id);
    const logoUrl = provider.logo_path ? `https://image.tmdb.org/t/p/original${provider.logo_path}` : '';
    
    return (
      <TouchableOpacity
        key={provider.provider_id}
        style={[styles.availableSubscription, isAdded ? styles.availableSubscriptionAdded : null]}
        onPress={() => isAdded ? null : addSubscription({
          id: `tmdb_${provider.provider_id}`,
          tmdbId: provider.provider_id,
          name: provider.provider_name,
          logo: logoUrl,
        })}
        disabled={!!isAdded}
      >
        <Image
          source={{ uri: logoUrl }}
          style={styles.availableSubscriptionLogo}
          resizeMode="contain"
        />
        <Text style={styles.availableSubscriptionName}>{provider.provider_name}</Text>
        {isAdded && (
          <Ionicons name="checkmark-circle" size={20} color="#00ff00" />
        )}
      </TouchableOpacity>
    );
  };

  const renderCountryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectOrigin(item)}
    >
      <Text style={styles.countryText}>{item}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666666" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HamburgerMenu />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Customize your movie preferences</Text>
        </View>

        {/* Origin Section - Enhanced */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Location</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textTertiary }]}>
            Set your country to see available movies and streaming options
          </Text>
          <TouchableOpacity
            style={[styles.originSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowOriginModal(true)}
          >
            <View style={styles.originInfo}>
              <Ionicons name="location" size={24} color={theme.colors.primary} />
              <Text style={[styles.originText, { color: theme.colors.text }]}>
                {userPreferences.origin || 'Select your country'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Active Subscriptions Section */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Streaming Services</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowSubscriptionsModal(true)}
            >
              <Ionicons name="add" size={20} color={theme.colors.primaryText} />
              <Text style={[styles.addButtonText, { color: theme.colors.primaryText }]}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {!userPreferences.origin && (
            <View style={[styles.locationWarning, { backgroundColor: theme.colors.error }]}>
              <Text style={[styles.locationWarningText, { color: theme.colors.primaryText }]}>
                Set your location first to see streaming services available in your region
              </Text>
            </View>
          )}
          
          {userPreferences.subscriptions.length > 0 ? (
            userPreferences.subscriptions.map(renderSubscriptionItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="tv-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No streaming services added yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>Add your services to get personalized recommendations</Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowSubscriptionsModal(true)}
              >
                <Text style={[styles.emptyStateButtonText, { color: theme.colors.primaryText }]}>Add Your First Service</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Favorite Genres Section */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Favorite Genres</Text>

          </View>
          
          <View style={styles.genresGrid}>
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = userPreferences.favoriteGenres.includes(genre.id);
              return (
                <TouchableOpacity
                  key={genre.id}
                  style={[styles.genreChip, isSelected && styles.genreChipSelected]}
                  onPress={() => toggleGenre(genre.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genreChipText, isSelected && styles.genreChipTextSelected]}>
                    {genre.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#000000" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {userPreferences.favoriteGenres.length === 0 && (
            <View style={styles.emptyGenresState}>
              <Ionicons name="film-outline" size={32} color="#666666" />
              <Text style={styles.emptyGenresText}>No favorite genres selected</Text>
              <Text style={styles.emptyGenresSubtext}>Select genres to get better movie recommendations</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {userPreferences.subscriptions.filter(sub => sub.isActive).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{userPreferences.favoriteGenres.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Favorite Genres</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{userPreferences.watchlist.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Watchlist</Text>
            </View>
          </View>
        </View>

        {/* Origin Selection Modal */}
        <Modal
          visible={showOriginModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Country</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOriginModal(false)}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                placeholderTextColor="#666666"
                value={searchOrigin}
                onChangeText={setSearchOrigin}
              />
            </View>

            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item}
              style={styles.countryList}
            />
          </View>
        </Modal>

        {/* Subscriptions Selection Modal */}
        <Modal
          visible={showSubscriptionsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Streaming Services
                {userPreferences.origin && ` (${userPreferences.origin})`}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSubscriptionsModal(false)}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.availableSubscriptionsGrid}>
              {!userPreferences.origin && (
                <View style={styles.noLocationNote}>
                  <Text style={styles.noLocationNoteText}>
                    Showing popular streaming services. Set your location in Profile to see services available in your region.
                  </Text>
                </View>
              )}
              
              {isLoadingServices ? (
                <View style={styles.loadingState}>
                  <Text style={styles.loadingText}>
                    Loading streaming services for {userPreferences.origin || 'your region'}...
                  </Text>
                </View>
              ) : tmdbStreamingServices.length > 0 ? (
                tmdbStreamingServices.map(renderAvailableSubscription)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="tv-outline" size={48} color="#666666" />
                  <Text style={styles.emptyText}>No streaming services found for your location.</Text>
                  <Text style={styles.emptySubtext}>Please try a different location or check back later.</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  originSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  originInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  removeButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  availableSubscriptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 20,
  },
  availableSubscription: {
    backgroundColor: '#111111',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  availableSubscriptionAdded: {
    backgroundColor: '#1a1a1a',
    borderColor: '#00ff00',
  },
  availableSubscriptionLogo: {
    width: 50,
    height: 50,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  availableSubscriptionName: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
  },
  countryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  countryText: {
    fontSize: 16,
    color: '#ffffff',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#888888',
    fontSize: 16,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
  },
  genreChip: {
    backgroundColor: '#111111',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  genreChipSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
  },
  genreChipText: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: '500',
  },
  genreChipTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  emptyGenresState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyGenresText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyGenresSubtext: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  locationWarning: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  locationWarningText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  noLocationNote: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  noLocationNoteText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
  },
});
