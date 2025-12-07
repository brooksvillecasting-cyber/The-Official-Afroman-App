
import * as SecureStore from 'expo-secure-store';

const SUBSCRIPTION_KEY = 'user_subscription';

export async function getSubscriptionStatus(): Promise<'free' | 'premium'> {
  try {
    const status = await SecureStore.getItemAsync(SUBSCRIPTION_KEY);
    return (status as 'free' | 'premium') || 'free';
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return 'free';
  }
}

export async function upgradeSubscription(): Promise<void> {
  try {
    await SecureStore.setItemAsync(SUBSCRIPTION_KEY, 'premium');
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
}

export async function downgradeSubscription(): Promise<void> {
  try {
    await SecureStore.setItemAsync(SUBSCRIPTION_KEY, 'free');
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    throw error;
  }
}

export async function clearSubscription(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SUBSCRIPTION_KEY);
  } catch (error) {
    console.error('Error clearing subscription:', error);
    throw error;
  }
}
