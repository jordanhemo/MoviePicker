import axios from 'axios';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'REDACTED'; // Fallback for development

export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TMDBWatchProvidersResponse {
  results: {
    [countryCode: string]: {
      flatrate?: TMDBProvider[];
      rent?: TMDBProvider[];
      buy?: TMDBProvider[];
    };
  };
}

export const streamingService = {
  // Get available streaming providers for a specific country
  async getAvailableProviders(countryCode: string = 'US'): Promise<TMDBProvider[]> {
    try {
      console.log(`StreamingService: Fetching available providers for country ${countryCode}`);
      
      // Try multiple popular shows/movies to get a comprehensive list of providers
      const popularContentIds = [
        1396,   // Breaking Bad (TV)
        1399,   // Game of Thrones (TV)
        550,    // Fight Club (Movie)
        13,     // Forrest Gump (Movie)
        238,    // The Godfather (Movie)
        278,    // The Shawshank Redemption (Movie)
        680,    // Pulp Fiction (Movie)
        497,    // The Green Mile (Movie)
        637,    // Life is Beautiful (Movie)
        122,    // The Lord of the Rings (Movie)
      ];
      
      const allProviders = new Map<number, TMDBProvider>();
      
      // Try each content ID to get providers
      for (const contentId of popularContentIds) {
        try {
          // Try TV show first
          let response = await axios.get(`${TMDB_API_BASE}/tv/${contentId}/watch/providers`, {
            params: {
              api_key: TMDB_API_KEY,
            }
          });
          
          let data = response.data;
          let countryData = data.results[countryCode];
          
          // If no TV data, try movie
          if (!countryData) {
            response = await axios.get(`${TMDB_API_BASE}/movie/${contentId}/watch/providers`, {
              params: {
                api_key: TMDB_API_KEY,
              }
            });
            data = response.data;
            countryData = data.results[countryCode];
          }
          
          if (countryData) {
            // Add flatrate providers (subscription services)
            if (countryData.flatrate) {
              countryData.flatrate.forEach((provider: TMDBProvider) => {
                allProviders.set(provider.provider_id, provider);
              });
            }
            
            // Add rent providers
            if (countryData.rent) {
              countryData.rent.forEach((provider: TMDBProvider) => {
                allProviders.set(provider.provider_id, provider);
              });
            }
            
            // Add buy providers
            if (countryData.buy) {
              countryData.buy.forEach((provider: TMDBProvider) => {
                allProviders.set(provider.provider_id, provider);
              });
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          console.log(`StreamingService: Skipping content ID ${contentId} for country ${countryCode}:`, error.message);
          continue;
        }
      }
      
      const result = Array.from(allProviders.values());
      console.log(`StreamingService: Found ${result.length} unique providers for country ${countryCode}:`, 
        result.map(p => p.provider_name));
      
      return result;
    } catch (error) {
      console.error('Error fetching streaming providers:', error);
      return [];
    }
  },

  // Get streaming providers for a specific movie
  async getMovieProviders(movieId: number, countryCode: string = 'US'): Promise<TMDBProvider[]> {
    try {
      console.log(`StreamingService: Fetching providers for movie ${movieId} in country ${countryCode}`);
      
      const response = await axios.get(`${TMDB_API_BASE}/movie/${movieId}/watch/providers`, {
        params: {
          api_key: TMDB_API_KEY,
        }
      });

      const data: TMDBWatchProvidersResponse = response.data;
      const countryData = data.results[countryCode];

      if (!countryData) {
        console.log(`StreamingService: No data found for country ${countryCode}`);
        return [];
      }

      console.log(`StreamingService: Found data for country ${countryCode}:`, {
        flatrate: countryData.flatrate?.length || 0,
        rent: countryData.rent?.length || 0,
        buy: countryData.buy?.length || 0
      });

      // Combine all provider types and remove duplicates
      const allProviders = new Map<number, TMDBProvider>();
      
      if (countryData.flatrate) {
        countryData.flatrate.forEach(provider => {
          allProviders.set(provider.provider_id, provider);
        });
      }
      
      if (countryData.rent) {
        countryData.rent.forEach(provider => {
          allProviders.set(provider.provider_id, provider);
        });
      }
      
      if (countryData.buy) {
        countryData.buy.forEach(provider => {
          allProviders.set(provider.provider_id, provider);
        });
      }

      const result = Array.from(allProviders.values());
      console.log(`StreamingService: Returning ${result.length} unique providers for movie ${movieId}`);
      return result;
    } catch (error) {
      console.error('Error fetching movie providers:', error);
      return [];
    }
  },

  // Get streaming providers for a specific TV show
  async getTVShowProviders(tvId: number, countryCode: string = 'US'): Promise<TMDBProvider[]> {
    try {
      const response = await axios.get(`${TMDB_API_BASE}/tv/${tvId}/watch/providers`, {
        params: {
          api_key: TMDB_API_KEY,
        }
      });

      const data: TMDBWatchProvidersResponse = response.data;
      const countryData = data.results[countryCode];

      if (!countryData || !countryData.flatrate) {
        return [];
      }

      return countryData.flatrate;
    } catch (error) {
      console.error('Error fetching TV show providers:', error);
      return [];
    }
  },

  // Get available regions/countries
  async getAvailableRegions(): Promise<string[]> {
    try {
      const response = await axios.get(`${TMDB_API_BASE}/watch/providers/regions`, {
        params: {
          api_key: TMDB_API_KEY,
        }
      });

      return response.data.results.map((region: any) => region.iso_3166_1);
    } catch (error) {
      console.error('Error fetching available regions:', error);
      return ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'KR', 'IN', 'BR', 'MX'];
    }
  }
};
