
import * as SecureStore from 'expo-secure-store';
import { Purchase } from '@/types/Movie';

const PURCHASES_KEY = 'movie_purchases';

export async function getPurchases(): Promise<Purchase[]> {
  try {
    const stored = await SecureStore.getItemAsync(PURCHASES_KEY);
    if (stored) {
      const purchases = JSON.parse(stored);
      console.log('Retrieved purchases:', purchases.length);
      return purchases;
    }
    console.log('No purchases found');
    return [];
  } catch (error) {
    console.error('Error getting purchases:', error);
    return [];
  }
}

export async function purchaseMovie(movieId: string, price: number, paymentIntentId?: string): Promise<void> {
  try {
    const purchases = await getPurchases();
    const exists = purchases.find(p => p.movieId === movieId);
    
    if (!exists) {
      const newPurchase: Purchase = {
        movieId,
        purchaseDate: new Date().toISOString(),
        price,
        paymentIntentId,
      };
      purchases.push(newPurchase);
      await SecureStore.setItemAsync(PURCHASES_KEY, JSON.stringify(purchases));
      console.log('Purchase recorded successfully:', newPurchase);
    } else {
      console.log('Movie already purchased:', movieId);
    }
  } catch (error) {
    console.error('Error purchasing movie:', error);
    throw error;
  }
}

export async function isMoviePurchased(movieId: string): Promise<boolean> {
  try {
    const purchases = await getPurchases();
    const isPurchased = purchases.some(p => p.movieId === movieId);
    console.log(`Movie ${movieId} purchase status:`, isPurchased);
    return isPurchased;
  } catch (error) {
    console.error('Error checking if movie is purchased:', error);
    return false;
  }
}

export async function clearAllPurchases(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PURCHASES_KEY);
    console.log('All purchases cleared');
  } catch (error) {
    console.error('Error clearing purchases:', error);
    throw error;
  }
}

export async function getPurchaseDetails(movieId: string): Promise<Purchase | null> {
  try {
    const purchases = await getPurchases();
    const purchase = purchases.find(p => p.movieId === movieId) || null;
    console.log(`Purchase details for ${movieId}:`, purchase);
    return purchase;
  } catch (error) {
    console.error('Error getting purchase details:', error);
    return null;
  }
}
