# Database Schema Changes

This document outlines the changes made to the Movie Picker app database schema and how to apply them.

## Changes Made

### 1. User Table Updates
- **Removed fields:**
  - `username` (String, unique) - Email is sufficient for identification
  - `firstName` (String, optional) - Simplified user model
  - `lastName` (String, optional) - Simplified user model

- **Remaining fields:**
  - `id` (String, primary key)
  - `email` (String, unique)
  - `passwordHash` (String)
  - `location` (String, optional)
  - `profileImage` (String, optional)
  - `isActive` (Boolean)
  - `lastLoginAt` (DateTime, optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

### 2. Streaming Service Table Updates
- **Added field:**
  - `tmdbId` (Int, unique) - TMDB provider ID from watch providers API

- **Updated fields:**
  - `name` - Now represents the provider name from TMDB
  - `displayName` - User-friendly display name
  - `logoUrl` - Provider logo URL from TMDB

## How to Apply Changes

### Option 1: Using Prisma Migrations (Recommended)

1. **Generate a new migration:**
   ```bash
   cd backend
   npm run db:migrate
   ```

2. **Apply the migration:**
   ```bash
   npm run db:push
   ```

### Option 2: Using the Migration Script

1. **Run the migration script:**
   ```bash
   cd backend
   node scripts/migrate-schema.js
   ```

### Option 3: Manual Database Changes

If you prefer to make changes manually:

1. **Remove columns from users table:**
   ```sql
   ALTER TABLE users 
   DROP COLUMN IF EXISTS username,
   DROP COLUMN IF EXISTS "firstName",
   DROP COLUMN IF EXISTS "lastName";
   ```

2. **Add tmdb_id column to streaming_services table:**
   ```sql
   ALTER TABLE streaming_services 
   ADD COLUMN IF NOT EXISTS tmdb_id INTEGER UNIQUE;
   ```

3. **Update existing streaming services with TMDB IDs:**
   ```sql
   -- Example updates
   UPDATE streaming_services SET tmdb_id = 8 WHERE name = 'Netflix';
   UPDATE streaming_services SET tmdb_id = 2 WHERE name = 'Disney+';
   UPDATE streaming_services SET tmdb_id = 384 WHERE name = 'HBO Max';
   -- ... continue for other services
   ```

## Frontend Changes

### 1. Registration Form
- Removed username, firstName, and lastName input fields
- Added location input field (optional)
- Simplified registration process

### 2. Profile Screen
- Now fetches streaming services from TMDB API
- Dynamic streaming service list based on user's region
- Real-time streaming availability data

### 3. API Integration
- New endpoints for TMDB streaming services:
  - `GET /streaming/tmdb/services?region={region}`
  - `GET /streaming/tmdb/movie/{movieId}/providers?region={region}`
  - `GET /streaming/tmdb/tv/{tvId}/providers?region={region}`
  - `GET /streaming/tmdb/regions`

## Benefits of These Changes

1. **Simplified User Model**: Removed unnecessary fields, making the app easier to use
2. **Real-time Streaming Data**: Integration with TMDB's watch providers API provides up-to-date streaming availability
3. **Regional Content**: Better support for different countries and regions
4. **Dynamic Service List**: Streaming services are now fetched dynamically based on user's location
5. **Accurate Data**: Direct integration with TMDB ensures streaming service information is current and accurate

## Testing the Changes

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the new endpoints:**
   ```bash
   # Get streaming services for US region
   curl "http://localhost:3001/streaming/tmdb/services?region=US"
   
   # Get streaming providers for a specific movie
   curl "http://localhost:3001/streaming/tmdb/movie/550/providers?region=US"
   ```

3. **Test user registration:**
   - Try registering a new user with only email and password
   - Verify that username, firstName, and lastName are not required

4. **Test streaming services:**
   - Change your location in the app
   - Verify that streaming services update based on the selected region

## Rollback Plan

If you need to rollback these changes:

1. **Restore the removed columns:**
   ```sql
   ALTER TABLE users 
   ADD COLUMN username VARCHAR(255) UNIQUE,
   ADD COLUMN "firstName" VARCHAR(255),
   ADD COLUMN "lastName" VARCHAR(255);
   ```

2. **Remove the tmdb_id column:**
   ```sql
   ALTER TABLE streaming_services 
   DROP COLUMN IF EXISTS tmdb_id;
   ```

3. **Revert the frontend changes** by checking out the previous commit

## Notes

- The TMDB API key is read from the `TMDB_API_KEY` environment variable (see `backend/env.example`)
- Streaming services are fetched from TMDB's watch providers endpoint
- The app now supports JustWatch attribution as required by TMDB's terms of service
- All changes maintain backward compatibility with existing user data
