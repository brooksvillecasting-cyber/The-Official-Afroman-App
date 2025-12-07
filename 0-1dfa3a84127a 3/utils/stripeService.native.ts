
import { Alert } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a payment intent using Supabase Edge Function
 * This keeps the Stripe secret key secure on the server side
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  description?: string
): Promise<PaymentIntentResponse | null> {
  try {
    console.log('Creating payment intent for amount:', amount);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
    }
    
    const userId = user?.id || 'anonymous';
    const email = user?.email || undefined;
    
    console.log('User info:', { userId, email });
    
    // Call Supabase Edge Function to create payment intent
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,
        currency,
        description: description || 'Movie purchase',
        userId,
        email,
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data || !data.clientSecret) {
      console.error('Invalid response from payment service:', data);
      throw new Error('Invalid response from payment service');
    }

    console.log('Payment intent created successfully:', data.paymentIntentId);

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    Alert.alert(
      'Payment Error',
      'Unable to initialize payment. Please check your connection and try again.'
    );
    return null;
  }
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting amount:', error);
    return `$${amount.toFixed(2)}`;
  }
}
