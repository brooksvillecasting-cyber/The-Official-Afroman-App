
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';
import { grantPremiumAccess } from './premiumAccessManager';

// Stripe payment link for premium content
const PREMIUM_PAYMENT_LINK = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';

/**
 * Open Stripe payment link in browser
 * After successful payment, user should manually confirm to grant access
 */
export async function openPremiumPaymentLink(): Promise<void> {
  try {
    console.log('Opening premium payment link...');

    // Show instructions before opening payment link
    Alert.alert(
      'Premium Access Payment',
      'You will be redirected to a secure payment page. After completing your payment, return to the app and tap "I\'ve Completed Payment" to activate your premium access.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue to Payment',
          onPress: async () => {
            // Open payment link in browser
            const result = await WebBrowser.openBrowserAsync(PREMIUM_PAYMENT_LINK, {
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.POPOVER,
              controlsColor: '#3CB371',
              toolbarColor: '#000000',
            });

            console.log('Browser result:', result);

            // After browser closes, ask user to confirm payment
            if (result.type === 'cancel' || result.type === 'dismiss') {
              setTimeout(() => {
                Alert.alert(
                  'Payment Status',
                  'Did you complete the payment successfully?',
                  [
                    {
                      text: 'Not Yet',
                      style: 'cancel',
                    },
                    {
                      text: 'I\'ve Completed Payment',
                      onPress: async () => {
                        try {
                          await grantPremiumAccess('lifetime');
                          Alert.alert(
                            'Premium Access Activated! 🎉',
                            'You now have lifetime access to all premium content. Enjoy!',
                            [{ text: 'Awesome!' }]
                          );
                        } catch (error) {
                          console.error('Error granting access:', error);
                          Alert.alert(
                            'Error',
                            'Failed to activate premium access. Please contact support.'
                          );
                        }
                      },
                    },
                  ]
                );
              }, 500);
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('Error opening payment link:', error);
    Alert.alert(
      'Error',
      'Failed to open payment page. Please try again or contact support.'
    );
  }
}

/**
 * Manual confirmation for users who completed payment outside the app
 */
export async function confirmPaymentManually(): Promise<void> {
  Alert.alert(
    'Confirm Payment',
    'Have you completed the payment at the Stripe checkout page?',
    [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes, I Paid',
        onPress: async () => {
          try {
            await grantPremiumAccess('lifetime');
            Alert.alert(
              'Premium Access Activated! 🎉',
              'You now have lifetime access to all premium content. Enjoy!',
              [{ text: 'Awesome!' }]
            );
          } catch (error) {
            console.error('Error granting access:', error);
            Alert.alert(
              'Error',
              'Failed to activate premium access. Please contact support.'
            );
          }
        },
      },
    ]
  );
}
