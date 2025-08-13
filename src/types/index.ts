export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBStreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface Subscription {
  id: string;
  tmdbId: number;
  name: string;
  logo: string; // URL to streaming service logo
  isActive: boolean;
}

export interface UserPreferences {
  origin: string;
  subscriptions: Subscription[];
  favoriteGenres: number[];
  watchlist: Movie[];
}

export interface MovieSearchParams {
  query?: string;
  genre?: number;
  year?: number;
  rating?: number;
  subscription?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Blender: undefined;
  History: undefined;
  MovieDetail: { movie: Movie };
  Profile: undefined;
  Search: undefined;
  Watchlist: undefined;
};
