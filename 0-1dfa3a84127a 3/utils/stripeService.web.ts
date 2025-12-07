
import { Alert } from 'react-native';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Web version - Stripe payments not supported on web
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  description?: string
): Promise<PaymentIntentResponse | null> {
  console.log('Stripe payments are not supported on web platform');
  Alert.alert(
    'Web Not Supported',
    'Payment processing is only available on iOS and Android. Please use the mobile app to make purchases.'
  );
  return null;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
