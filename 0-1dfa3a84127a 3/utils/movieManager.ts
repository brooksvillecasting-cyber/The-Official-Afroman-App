
import { Movie } from '@/types/Movie';
import * as SecureStore from 'expo-secure-store';

const MOVIES_KEY = 'app_movies';

export async function getAllMovies(): Promise<Movie[]> {
  try {
    const stored = await SecureStore.getItemAsync(MOVIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error getting movies:', error);
    return [];
  }
}

export async function addMovie(movieData: Omit<Movie, 'id' | 'uploadDate'>): Promise<void> {
  try {
    const movies = await getAllMovies();
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    movies.unshift(newMovie);
    await SecureStore.setItemAsync(MOVIES_KEY, JSON.stringify(movies));
  } catch (error) {
    console.error('Error adding movie:', error);
    throw error;
  }
}

export async function deleteMovie(movieId: string): Promise<void> {
  try {
    const movies = await getAllMovies();
    const filtered = movies.filter(m => m.id !== movieId);
    await SecureStore.setItemAsync(MOVIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
}

export async function getMovieById(movieId: string): Promise<Movie | undefined> {
  try {
    const movies = await getAllMovies();
    return movies.find(m => m.id === movieId);
  } catch (error) {
    console.error('Error getting movie by id:', error);
    return undefined;
  }
}
