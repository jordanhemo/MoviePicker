# Movie Picker App 🎬

A beautiful, dark-themed mobile app that helps users discover and pick movies based on their preferences and streaming subscriptions.

## Features

### 🎲 Blender Mode
- **Random Movie Picker**: Can't decide what to watch? Let the app pick a random movie for you!
- **Movie History**: View your recent random picks
- **Beautiful UI**: Clean, card-based design with movie posters and details

### 🔍 Search & Filter
- **Advanced Search**: Search movies by title, genre, year, and rating
- **Smart Filtering**: Filter by multiple criteria simultaneously
- **Infinite Scroll**: Load more movies as you scroll
- **Genre Selection**: Browse movies by specific genres

### 👤 Profile & Preferences
- **Location Setting**: Set your country/region for localized content
- **Streaming Services**: Manage your active subscriptions with real-time TMDB data
- **Personal Stats**: Track your preferences and watchlist
- **Easy Management**: Toggle services on/off with a simple interface

### 🎭 Movie Details
- **Rich Information**: Comprehensive movie details, ratings, and overviews
- **Watchlist Management**: Add movies to your personal watchlist
- **Favorites**: Mark movies as favorites
- **Sharing**: Share movie recommendations with friends
- **Streaming Info**: See where movies are available to watch with real-time TMDB data

## Tech Stack

- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety and better development experience
- **React Navigation** for smooth navigation between screens
- **Axios** for API communication
- **TMDB API** for comprehensive movie data and streaming availability
- **PostgreSQL** with **Prisma** for database management
- **Dark Theme** with clean, modern UI design

## Recent Updates

### Database Schema Changes
- **Simplified User Model**: Removed username, firstName, and lastName fields for easier registration
- **TMDB Integration**: Streaming services now fetched from TMDB's watch providers API
- **Real-time Data**: Streaming availability updates automatically based on user's region
- **Regional Support**: Better content localization for different countries

See [DATABASE_CHANGES.md](DATABASE_CHANGES.md) for detailed migration instructions.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL database
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MoviePicker
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up the database**
   ```bash
   cd backend
   # Copy environment file
   cp env.example .env
   # Edit .env with your database credentials
   
   # Apply database schema changes
   npm run db:migrate-schema
   
   # Or use Prisma migrations
   npm run db:migrate
   npm run db:push
   ```

4. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

5. **Start the frontend**
   ```bash
   # In a new terminal
   npm start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## API Configuration

The app is already configured with your TMDB API credentials:
- **API Key**: `REDACTED`
- **Base URL**: `https://api.themoviedb.org/3`

### New TMDB Endpoints
- `GET /streaming/tmdb/services?region={region}` - Get streaming services for a region
- `GET /streaming/tmdb/movie/{movieId}/providers?region={region}` - Get streaming providers for a movie
- `GET /streaming/tmdb/tv/{tvId}/providers?region={region}` - Get streaming providers for a TV show
- `GET /streaming/tmdb/regions` - Get available regions

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── MovieCard.tsx   # Movie display component
├── screens/            # App screens
│   ├── BlenderScreen.tsx      # Random movie picker
│   ├── SearchScreen.tsx       # Search and filter
│   ├── ProfileScreen.tsx      # User preferences
│   └── MovieDetailScreen.tsx  # Movie details
├── services/           # API and external services
│   └── tmdbApi.ts     # TMDB API integration
├── types/              # TypeScript type definitions
│   └── index.ts       # App-wide types
└── utils/              # Utility functions

backend/
├── src/
│   ├── controllers/    # API controllers
│   ├── services/       # Business logic services
│   ├── routes/         # API route definitions
│   └── middleware/     # Express middleware
├── prisma/             # Database schema and migrations
└── scripts/            # Database migration scripts
```

## Key Features Implementation

### Random Movie Selection
- Uses TMDB's popular movies endpoint with random page selection
- Maintains history of recent picks
- Beautiful card-based display with movie information

### Advanced Search
- Real-time search with debouncing
- Multiple filter criteria (genre, year, rating)
- Pagination support for large result sets
- Clean, intuitive filter interface

### User Preferences
- Simplified registration (email + password only)
- Location-based content recommendations
- Dynamic streaming service management via TMDB
- Personal statistics tracking

### TMDB Integration
- Real-time streaming availability data
- Regional content filtering
- Watch providers API integration
- Automatic service discovery based on location

## Future Enhancements

### 🤖 AI Chat Helper (Coming Soon)
- **Smart Recommendations**: AI-powered movie suggestions based on preferences
- **Conversational Interface**: Chat with AI to discover movies
- **Mood-Based Picking**: Find movies based on your current mood
- **Personalized Insights**: Learn about your watching patterns

### Additional Features
- **Offline Support**: Cache movies for offline viewing
- **Push Notifications**: Get notified about new releases
- **Social Features**: Share watchlists with friends
- **Advanced Analytics**: Detailed viewing statistics
- **Multi-language Support**: International movie discovery

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Movie Picking! 🍿**
