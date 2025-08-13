# Movie Picker Backend 🚀

A robust Node.js/Express backend API for the Movie Picker app, featuring user authentication, biometric login support, and comprehensive movie watchlist management.

## ✨ Features

- **🔐 User Authentication**: JWT-based login/registration with refresh tokens
- **👆 Biometric Login**: Face ID/Touch ID support for cross-platform authentication
- **👤 User Management**: Profile management, preferences, and account settings
- **📺 Streaming Services**: Manage streaming service subscriptions
- **🎬 Watchlist**: Full CRUD operations for movie watchlists
- **🛡️ Security**: Password hashing, rate limiting, and input validation
- **🗄️ Database**: PostgreSQL with Prisma ORM for type-safe database operations

## 🏗️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/moviepicker"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE moviepicker;
   ```

#### Option B: Free Cloud Database (Railway)

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string to your `.env`

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npx ts-node src/utils/seeder.ts
```

### 5. Start Development Server

```bash
npm run dev
```

Your API will be running at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "location": "United States"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/biometric-login`
Login using biometric authentication (Face ID/Touch ID).

**Request Body:**
```json
{
  "biometricToken": "jwt_token_here",
  "deviceId": "device_identifier"
}
```

#### GET `/api/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

### User Management

#### GET `/api/users/profile`
Get user profile information.

#### PUT `/api/users/profile`
Update user profile.

#### DELETE `/api/users/account`
Delete user account.

### Watchlist Management

#### POST `/api/watchlist`
Add movie to watchlist.

**Request Body:**
```json
{
  "movieId": 550,
  "movieTitle": "Fight Club",
  "moviePoster": "https://example.com/poster.jpg"
}
```

#### GET `/api/watchlist`
Get user's watchlist with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)
- `isWatched`: Filter by watched status (true/false)

#### PUT `/api/watchlist/:id`
Update watchlist item (mark as watched).

#### DELETE `/api/watchlist/:id`
Remove movie from watchlist.

### Streaming Services

#### GET `/api/streaming/services`
Get all available streaming services.

#### GET `/api/streaming/user-services`
Get user's active streaming services.

#### POST `/api/streaming/toggle-service`
Toggle streaming service subscription.

#### GET `/api/streaming/preferences`
Get user preferences.

#### PUT `/api/streaming/preferences`
Update user preferences.

## 🔐 Authentication

### JWT Tokens

The API uses two types of JWT tokens:

1. **Access Token**: Short-lived (15 minutes) for API requests
2. **Refresh Token**: Long-lived (7 days) for getting new access tokens

### Biometric Authentication

For Face ID/Touch ID integration:

1. **Generate Biometric Token**: Use `jwtService.generateBiometricToken()`
2. **Store Securely**: Use react-native-keychain or similar
3. **Verify on Login**: Send token to `/api/auth/biometric-login`

## 🗄️ Database Schema

### Core Models

- **User**: User accounts and profiles
- **StreamingService**: Available streaming platforms
- **UserStreamingService**: User's streaming subscriptions
- **WatchlistItem**: Movies in user's watchlist
- **UserPreferences**: User settings and preferences

### Relationships

```
User (1) ←→ (Many) UserStreamingService (Many) ←→ (1) StreamingService
User (1) ←→ (Many) WatchlistItem
User (1) ←→ (1) UserPreferences
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Free Hosting Options

#### Railway (Recommended)
1. Connect your GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

#### Render
1. Create new Web Service
2. Connect your repository
3. Add PostgreSQL database
4. Set build command: `npm run build`
5. Set start command: `npm start`

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://yourdomain.com
```

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## 📱 Frontend Integration

### React Native Setup

1. **Install dependencies:**
   ```bash
   npm install react-native-keychain
   ```

2. **Configure biometric authentication:**
   ```typescript
   import * as Keychain from 'react-native-keychain';
   
   // Store biometric token
   await Keychain.setInternetCredentials(
     'biometric_token',
     'user_id',
     biometricToken
   );
   
   // Retrieve biometric token
   const credentials = await Keychain.getInternetCredentials('biometric_token');
   ```

3. **API calls with authentication:**
   ```typescript
   const response = await fetch(`${API_BASE}/api/users/profile`, {
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

2. **JWT Errors**
   - Check JWT_SECRET in .env
   - Ensure tokens are properly formatted
   - Check token expiration

3. **CORS Issues**
   - Verify CORS_ORIGIN in .env
   - Check frontend URL matches

### Logs

In development mode, detailed error logs are displayed. Check the console for:
- Database connection status
- API request logs
- Error details and stack traces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the logs
3. Create an issue with detailed information
4. Include your environment details and error messages

---

**Happy Coding! 🎬✨**
