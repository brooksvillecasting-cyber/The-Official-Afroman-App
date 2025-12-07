
import { Movie } from '@/types/Movie';
import * as SecureStore from 'expo-secure-store';

const DOWNLOADS_KEY = 'downloaded_movies';

export async function getDownloadedMovies(): Promise<Movie[]> {
  try {
    const stored = await SecureStore.getItemAsync(DOWNLOADS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error getting downloaded movies:', error);
    return [];
  }
}

export async function saveDownload(movie: Movie): Promise<void> {
  try {
    const downloads = await getDownloadedMovies();
    const exists = downloads.find(m => m.id === movie.id);
    
    if (!exists) {
      const updatedMovie = {
        ...movie,
        downloadedPath: `local://downloads/${movie.id}`,
      };
      downloads.push(updatedMovie);
      await SecureStore.setItemAsync(DOWNLOADS_KEY, JSON.stringify(downloads));
    }
  } catch (error) {
    console.error('Error saving download:', error);
    throw error;
  }
}

export async function deleteDownload(movieId: string): Promise<void> {
  try {
    const downloads = await getDownloadedMovies();
    const filtered = downloads.filter(m => m.id !== movieId);
    await SecureStore.setItemAsync(DOWNLOADS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting download:', error);
    throw error;
  }
}

export async function isMovieDownloaded(movieId: string): Promise<boolean> {
  try {
    const downloads = await getDownloadedMovies();
    return downloads.some(m => m.id === movieId);
  } catch (error) {
    console.error('Error checking if movie is downloaded:', error);
    return false;
  }
}

export async function clearAllDownloads(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DOWNLOADS_KEY);
  } catch (error) {
    console.error('Error clearing downloads:', error);
    throw error;
  }
}
