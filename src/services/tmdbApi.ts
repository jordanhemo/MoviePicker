import axios from 'axios';
import { Movie, Genre, MovieSearchParams } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/api';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const movieService = {
  // Get popular movies with region support
  getPopularMovies: async (page: number = 1, region?: string): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting popular movies for region:', region);
    const response = await tmdbApi.get('/movie/popular', {
      params: { 
        page,
        ...(region && { region }),
        ...(region && { watch_region: region }), // Alternative region parameter
        'vote_count.gte': 50, // Only movies with some votes
        sort_by: 'popularity.desc',
        include_adult: false,
        include_video: false,
      },
    });
    console.log('TMDB API: Got', response.data.results.length, 'movies for region:', region);
    return response.data;
  },

  // Search movies with enhanced filtering
  searchMovies: async (params: MovieSearchParams, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Searching movies with params:', params);
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query: params.query,
        page,
        ...(params.year && { year: params.year }),
        ...(params.rating && { 'vote_average.gte': params.rating }),
        ...(params.genre && { with_genres: params.genre }),
        'vote_count.gte': 10, // Only movies with some votes
      },
    });
    return response.data;
  },

  // Get movie details with region-specific info
  getMovieDetails: async (movieId: number, region?: string): Promise<Movie> => {
    console.log('TMDB API: Getting movie details for ID:', movieId, 'region:', region);
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        ...(region && { region }),
        append_to_response: 'videos,credits,similar,recommendations',
      },
    });
    return response.data;
  },

  // Get genres
  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  },

  // Get movies by genre with region support
  getMoviesByGenre: async (genreId: number, page: number = 1, region?: string): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting movies by genre:', genreId, 'region:', region);
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
        ...(region && { region }),
        'vote_count.gte': 50, // Only movies with some votes
      },
    });
    return response.data;
  },

  // Get random movie with region support
  getRandomMovie: async (region?: string): Promise<Movie> => {
    console.log('TMDB API: Getting random movie for region:', region);
    // Try to get movies from the first few pages for better quality
    const page = Math.floor(Math.random() * 10) + 1; // First 10 pages for better movies
    const response = await tmdbApi.get('/movie/popular', {
      params: { 
        page,
        ...(region && { region }),
        'vote_count.gte': 100, // Only movies with significant votes
        sort_by: 'popularity.desc',
      },
    });
    const movies = response.data.results;
    const randomIndex = Math.floor(Math.random() * movies.length);
    const selectedMovie = movies[randomIndex];
    console.log('TMDB API: Selected random movie:', selectedMovie.title, 'for region:', region);
    return selectedMovie;
  },

  // Get movies available in specific region
  getRegionalMovies: async (region: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting regional movies for region:', region);
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        page,
        region,
        sort_by: 'popularity.desc',
        'vote_count.gte': 100, // Only movies with significant votes
        'vote_average.gte': 5.0, // Only movies with decent ratings
      },
    });
    return response.data;
  },

  // Get trending movies (daily/weekly)
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'day', region?: string): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting trending movies for region:', region);
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
      params: {
        ...(region && { region }),
        'vote_count.gte': 50,
      },
    });
    return response.data;
  },

  // Get upcoming movies with region support
  getUpcomingMovies: async (region?: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting upcoming movies for region:', region);
    const response = await tmdbApi.get('/movie/upcoming', {
      params: {
        page,
        ...(region && { region }),
        'vote_count.gte': 10,
      },
    });
    return response.data;
  },

  // Mock function for streaming service availability
  getMoviesByStreamingService: async (serviceId: string, region?: string): Promise<{ results: Movie[]; total_pages: number }> => {
    // This would integrate with a real streaming availability API
    console.log('TMDB API: Getting movies for streaming service:', serviceId, 'region:', region);
    // For now, return popular movies as a fallback
    return movieService.getPopularMovies(1, region);
  },

  // Get personalized recommendations based on user preferences
  getPersonalizedRecommendations: async (genres: number[], region?: string): Promise<{ results: Movie[]; total_pages: number }> => {
    console.log('TMDB API: Getting personalized recommendations for genres:', genres, 'region:', region);
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genres.join(','),
        sort_by: 'popularity.desc',
        'vote_count.gte': 100,
        'vote_average.gte': 6.0,
        ...(region && { region }),
        ...(region && { watch_region: region }),
        include_adult: false,
        include_video: false,
      },
    });
    return response.data;
  },

  // Get preference-based random movie for blender mode
  getPreferenceBasedRandomMovie: async (favoriteGenres: number[], region?: string, streamingServices?: string[]): Promise<Movie> => {
    console.log('TMDB API: Getting preference-based random movie for genres:', favoriteGenres, 'region:', region, 'streaming services:', streamingServices);
    
    try {
      let movies: Movie[] = [];
      
      // If user has favorite genres, prioritize those
      if (favoriteGenres && favoriteGenres.length > 0) {
        // Try to get movies from favorite genres first
        const genreResponse = await tmdbApi.get('/discover/movie', {
          params: {
            with_genres: favoriteGenres.join(','),
            sort_by: 'popularity.desc',
            'vote_count.gte': 100,
            'vote_average.gte': 6.0,
            ...(region && { region }),
            ...(region && { watch_region: region }),
            include_adult: false,
            include_video: false,
            page: Math.floor(Math.random() * 5) + 1, // Random page 1-5
          },
        });
        
        if (genreResponse.data.results && genreResponse.data.results.length > 0) {
          movies = genreResponse.data.results;
          console.log('TMDB API: Found', movies.length, 'movies from favorite genres');
        }
      }
      
      // If no movies from favorite genres or fallback needed, get popular movies
      if (movies.length === 0) {
        const popularResponse = await tmdbApi.get('/movie/popular', {
          params: { 
            page: Math.floor(Math.random() * 10) + 1,
            ...(region && { region }),
            ...(region && { watch_region: region }),
            'vote_count.gte': 100,
            sort_by: 'popularity.desc',
            include_adult: false,
            include_video: false,
          },
        });
        movies = popularResponse.data.results;
        console.log('TMDB API: Fallback to popular movies, found:', movies.length);
      }
      
      // Filter out movies that might not be available in the region
      let filteredMovies = movies.filter(movie => 
        movie.overview && 
        movie.overview.length > 50 && // Ensure movie has proper description
        movie.poster_path && // Ensure movie has poster
        movie.vote_average > 0 // Ensure movie has ratings
      );
      
      // If user has streaming services preferences, try to find movies available on those services
      if (streamingServices && streamingServices.length > 0 && region) {
        console.log('TMDB API: Filtering movies by streaming services:', streamingServices);
        
        // Get a sample of movies to check streaming availability
        const moviesToCheck = filteredMovies.slice(0, Math.min(10, filteredMovies.length));
        const moviesWithStreaming: Movie[] = [];
        
        for (const movie of moviesToCheck) {
          try {
            // Get watch providers for this movie
            const watchProvidersResponse = await tmdbApi.get(`/movie/${movie.id}/watch/providers`);
            const watchProviders = watchProvidersResponse.data.results;
            
            // Check if movie is available on user's preferred streaming services
            if (watchProviders[region]) {
              const flatrate = watchProviders[region].flatrate || [];
              const rent = watchProviders[region].rent || [];
              const buy = watchProviders[region].buy || [];
              
              const allProviders = [...flatrate, ...rent, ...buy];
              console.log(`TMDB API: Movie ${movie.title} has ${allProviders.length} providers in ${region}`);
              
              const isAvailableOnPreferredService = allProviders.some(provider => {
                const isAvailable = streamingServices.includes(provider.provider_id.toString());
                if (isAvailable) {
                  console.log(`TMDB API: Found match! Movie ${movie.title} available on ${provider.provider_name} (ID: ${provider.provider_id})`);
                }
                return isAvailable;
              });
              
              if (isAvailableOnPreferredService) {
                moviesWithStreaming.push(movie);
                console.log('TMDB API: Movie', movie.title, 'available on preferred streaming service');
              }
            } else {
              console.log(`TMDB API: No watch providers found for movie ${movie.title} in region ${region}`);
            }
          } catch (error) {
            console.log('TMDB API: Could not check streaming availability for movie:', movie.title, 'Error:', error);
            // Continue with other movies
          }
        }
        
        // If we found movies on preferred streaming services, use those
        if (moviesWithStreaming.length > 0) {
          filteredMovies = moviesWithStreaming;
          console.log('TMDB API: Found', moviesWithStreaming.length, 'movies on preferred streaming services');
        } else {
          console.log('TMDB API: No movies found on preferred streaming services, using all filtered movies');
        }
      }
      
      if (filteredMovies.length === 0) {
        throw new Error('No suitable movies found for preferences');
      }
      
      const randomIndex = Math.floor(Math.random() * filteredMovies.length);
      const selectedMovie = filteredMovies[randomIndex];
      
      console.log('TMDB API: Selected preference-based movie:', selectedMovie.title, 'for region:', region, 'with streaming services:', streamingServices);
      return selectedMovie;
      
    } catch (error) {
      console.error('TMDB API: Error getting preference-based movie:', error);
      // Fallback to basic random movie
      return movieService.getRandomMovie(region);
    }
  },

  // Test function to verify regional content
  testRegionalContent: async (region: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      console.log('TMDB API: Testing regional content for region:', region);
      
      // Test 1: Popular movies with region
      const popularResponse = await tmdbApi.get('/movie/popular', {
        params: { 
          page: 1,
          region,
          watch_region: region,
        },
      });
      
      // Test 2: Discover movies with region
      const discoverResponse = await tmdbApi.get('/discover/movie', {
        params: {
          page: 1,
          region,
          watch_region: region,
          sort_by: 'popularity.desc',
        },
      });
      
      console.log('TMDB API: Regional test results - Popular:', popularResponse.data.results.length, 'Discover:', discoverResponse.data.results.length);
      
      return {
        success: true,
        message: `Regional content test successful. Popular: ${popularResponse.data.results.length}, Discover: ${discoverResponse.data.results.length}`,
        data: {
          popular: popularResponse.data.results.slice(0, 3), // First 3 movies
          discover: discoverResponse.data.results.slice(0, 3),
        }
      };
    } catch (error) {
      console.error('TMDB API: Regional content test failed:', error);
      return {
        success: false,
        message: `Regional content test failed: ${error}`,
      };
    }
  },
};

export default tmdbApi;
