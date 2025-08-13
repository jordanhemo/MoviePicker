import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function MovieCard({ movie, onPress, size = 'medium' }: MovieCardProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 120, height: 200 },
          poster: { width: 120, height: 180 },
          title: { fontSize: 12 },
          year: { fontSize: 10 },
          rating: { fontSize: 10 },
        };
      case 'large':
        return {
          container: { width: 200, height: 320 },
          poster: { width: 200, height: 300 },
          title: { fontSize: 16 },
          year: { fontSize: 14 },
          rating: { fontSize: 14 },
        };
      default: // medium
        return {
          container: { width: 160, height: 260 },
          poster: { width: 160, height: 240 },
          title: { fontSize: 14 },
          year: { fontSize: 12 },
          rating: { fontSize: 12 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles.container]}
      onPress={() => onPress(movie)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
        }}
        style={[styles.poster, sizeStyles.poster]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.title, sizeStyles.title]} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={[styles.year, sizeStyles.year]}>
          {new Date(movie.release_date).getFullYear()}
        </Text>
        <Text style={[styles.rating, sizeStyles.rating]}>
          ⭐ {movie.vote_average}/10
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  poster: {
    borderRadius: 10,
  },
  info: {
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  year: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 2,
  },
  rating: {
    color: '#ffd700',
    textAlign: 'center',
    fontWeight: '500',
  },
});
