import { Subscription, UserPreferences } from '../types';

// Mock data for subscriptions - in a real app, this would come from a backend
export const availableSubscriptions: Subscription[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    isActive: false,
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    logo: '🍎',
    isActive: false,
  },
  {
    id: 'disney',
    name: 'Disney+',
    logo: '🏰',
    isActive: false,
  },
  {
    id: 'hbo',
    name: 'HBO Max',
    logo: '📺',
    isActive: false,
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    logo: '📦',
    isActive: false,
  },
  {
    id: 'hulu',
    name: 'Hulu',
    logo: '🟢',
    isActive: false,
  },
];

export const subscriptionService = {
  // Get all available subscriptions
  getAvailableSubscriptions: (): Subscription[] => {
    return availableSubscriptions;
  },

  // Update subscription status
  updateSubscription: (subscriptionId: string, isActive: boolean): Subscription[] => {
    const subscription = availableSubscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.isActive = isActive;
    }
    return availableSubscriptions;
  },

  // Get active subscriptions
  getActiveSubscriptions: (): Subscription[] => {
    return availableSubscriptions.filter(sub => sub.isActive);
  },

  // Save user preferences to local storage (mock implementation)
  saveUserPreferences: (preferences: UserPreferences): void => {
    try {
      // In a real app, you'd use AsyncStorage or similar
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  // Load user preferences from local storage (mock implementation)
  loadUserPreferences: (): UserPreferences | null => {
    try {
      // In a real app, you'd use AsyncStorage or similar
      const stored = localStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  },
};
