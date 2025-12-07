
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/app/integrations/supabase/client';

const PREMIUM_ACCESS_KEY = 'premium_access';

export interface PremiumAccess {
  userId: string;
  grantedAt: string;
  expiresAt?: string;
  type: 'lifetime' | 'subscription';
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(): Promise<boolean> {
  try {
    // Check local storage first
    const stored = await SecureStore.getItemAsync(PREMIUM_ACCESS_KEY);
    if (stored) {
      const access: PremiumAccess = JSON.parse(stored);
      
      // Check if access has expired
      if (access.expiresAt) {
        const expiryDate = new Date(access.expiresAt);
        if (expiryDate < new Date()) {
          console.log('Premium access expired');
          await SecureStore.deleteItemAsync(PREMIUM_ACCESS_KEY);
          return false;
        }
      }
      
      console.log('User has premium access');
      return true;
    }

    // Check database for user's subscription status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (!error && data && data.subscription_status === 'active') {
        // Store in local cache
        const access: PremiumAccess = {
          userId: user.id,
          grantedAt: new Date().toISOString(),
          type: 'subscription',
        };
        await SecureStore.setItemAsync(PREMIUM_ACCESS_KEY, JSON.stringify(access));
        return true;
      }
    }

    console.log('User does not have premium access');
    return false;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

/**
 * Grant premium access to user
 */
export async function grantPremiumAccess(type: 'lifetime' | 'subscription' = 'lifetime'): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const access: PremiumAccess = {
      userId: user.id,
      grantedAt: new Date().toISOString(),
      type,
    };

    // Store locally
    await SecureStore.setItemAsync(PREMIUM_ACCESS_KEY, JSON.stringify(access));

    // Update database
    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        subscription_status: 'active',
        subscription_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    console.log('Premium access granted successfully');
  } catch (error) {
    console.error('Error granting premium access:', error);
    throw error;
  }
}

/**
 * Revoke premium access
 */
export async function revokePremiumAccess(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PREMIUM_ACCESS_KEY);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    console.log('Premium access revoked');
  } catch (error) {
    console.error('Error revoking premium access:', error);
    throw error;
  }
}
