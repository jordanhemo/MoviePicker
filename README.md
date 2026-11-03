# 🎬 Movie Picker

**Can't decide what to watch?** Movie Picker is a cross-platform mobile app that picks a movie for you, filtered by what's actually available on *your* streaming services in *your* country.

Built with React Native (Expo) + TypeScript on the frontend and a Node.js / Express / PostgreSQL backend, powered by [TMDB](https://www.themoviedb.org/) data.

---

## ✨ Features

### 🎲 Blender — random movie picker
Hit the blender and get a random movie suggestion, shown as a poster card with rating, year and overview. Every pick is saved to your **History** so you can come back to it.

### 🔍 Search & filter
- Search by title
- Filter by genre, release year and rating, all at once
- Infinite scroll through results

### 📺 Streaming availability
- See **where each movie is streaming** in your region (TMDB watch providers / JustWatch data)
- Pick your country and toggle the streaming services you subscribe to

### 🎭 Movie details
Full details, ratings and overview, plus add to watchlist, mark as favorite and share with friends.

### 📋 Watchlist & profile
- Personal watchlist synced to the backend, with stats
- Profile with region, subscriptions and preferences
- Dark theme

### 🔐 Accounts
Simple email + password registration, JWT authentication with refresh tokens, and biometric login support.

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Mobile app** | React Native 0.79, Expo 53, TypeScript, React Navigation, Axios |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| **Auth & security** | JWT, bcrypt, Helmet, rate limiting, request validation |
| **Data** | TMDB API (movies, genres, watch providers) |

---

## 🏗 Architecture

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────┐
│  Expo / React Native │ ─────▶ │  Express API (/api)  │ ─────▶ │  PostgreSQL  │
│        app           │        │  auth · watchlist ·  │        │   (Prisma)   │
│                      │        │  users · streaming   │        └──────────────┘
└──────────┬───────────┘        └──────────┬───────────┘
           │                               │
           └──────────────┬────────────────┘
                          ▼
                   ┌─────────────┐
                   │  TMDB API   │
                   └─────────────┘
```

### API endpoints

| Area | Endpoints |
|------|-----------|
| **Auth** `/api/auth` | `POST /register`, `POST /login`, `POST /biometric-login`, `POST /refresh-token`, `POST /logout`, `GET /me`, `POST /change-password` |
| **Users** `/api/users` | `GET /profile`, `PUT /profile`, `DELETE /account` |
| **Watchlist** `/api/watchlist` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `GET /stats/summary` |
| **Streaming** `/api/streaming` | `GET /tmdb/services`, `GET /tmdb/movie/:movieId/providers`, `GET /tmdb/tv/:tvId/providers`, `GET /tmdb/regions`, `GET /services`, `GET /user-services`, `POST /toggle-service`, `GET`/`PUT /preferences` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- Expo Go on your phone, or an iOS Simulator / Android Emulator

### 1. Clone and install

```bash
git clone https://github.com/jordanhemo/MoviePicker.git
cd MoviePicker
npm install
cd backend && npm install
```

### 2. Configure environment variables

API keys are **never** committed. Each part of the app has an example file to copy:

```bash
# Backend
cp backend/env.example backend/.env

# Frontend (from the project root)
cp .env.example .env
```

Then fill in:

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `backend/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `backend/.env` | Long random string used to sign tokens |
| `TMDB_API_KEY` | `backend/.env` | Your TMDB API key |
| `EXPO_PUBLIC_TMDB_API_KEY` | `.env` | Your TMDB API key (used by the app) |
| `EXPO_PUBLIC_API_BASE_URL` | `.env` | Backend URL. On a physical phone, use your computer's LAN IP, e.g. `http://192.168.1.10:3001/api` |

### 3. Set up the database

```bash
cd backend
npm run db:generate
npm run db:push
```

### 4. Run

```bash
# Terminal 1: backend
cd backend
npm run dev
```

```bash
# Terminal 2: app (from the project root)
npm start
```

Press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

---

## 📁 Project Structure

```
MoviePicker/
├── App.tsx                 # Navigation & providers
├── src/
│   ├── screens/            # Blender, Search, MovieDetail, Watchlist, History, Profile, Login, Register
│   ├── components/         # MovieCard, Logo, AnimatedLogo, HamburgerMenu
│   ├── context/            # Auth, Theme, UserPreferences
│   ├── services/           # TMDB client, backend API client, subscriptions
│   ├── config/             # API configuration (reads env vars)
│   └── types/              # Shared TypeScript types
└── backend/
    ├── src/
    │   ├── controllers/    # auth, user, watchlist, streaming
    │   ├── routes/         # Express routers
    │   ├── services/       # JWT, TMDB streaming service
    │   └── middleware/     # auth, validation, error handling
    ├── prisma/             # Database schema
    └── scripts/            # Migration & deploy scripts
```

More details: [backend/README.md](backend/README.md) · [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md) · [DATABASE_CHANGES.md](DATABASE_CHANGES.md)

---

## 🙏 Credits

Movie data and streaming availability are provided by [TMDB](https://www.themoviedb.org/) and JustWatch.
This product uses the TMDB API but is not endorsed or certified by TMDB.

---

**Happy movie picking! 🍿**
