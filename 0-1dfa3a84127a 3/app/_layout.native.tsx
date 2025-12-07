
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Only import Stripe on native platforms (iOS/Android)
// This file should only be loaded on native platforms, but we add a safety check
let StripeProvider: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const stripe = require('@stripe/stripe-react-native');
  StripeProvider = stripe.StripeProvider;
}

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // If somehow this file is loaded on web, fall back to basic layout
  if (Platform.OS === 'web' || !StripeProvider) {
    console.warn('Native layout loaded on web platform - this should not happen');
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin/index" options={{ title: 'Admin Panel' }} />
          <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />
          <Stack.Screen
            name="formsheet"
            options={{
              presentation: 'formSheet',
              title: 'Form Sheet',
            }}
          />
          <Stack.Screen
            name="transparent-modal"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              title: 'Transparent Modal',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // Get the proper URL scheme for Stripe redirects
  const urlScheme = Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL('');

  // Stripe publishable key (test mode)
  // Note: In production, use environment variables
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SHylYRqxjczpVGKcTokGBe96PKVOVdI3txXTrXedWEBhkJKp3A2TASqmb5pNatoqXVtj9zBT561MxajvuELjrRn00q0i61PA9';

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme={urlScheme}
      merchantIdentifier="merchant.com.afroman.tv"
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin/index" options={{ title: 'Admin Panel' }} />
          <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />
          <Stack.Screen
            name="formsheet"
            options={{
              presentation: 'formSheet',
              title: 'Form Sheet',
            }}
          />
          <Stack.Screen
            name="transparent-modal"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              title: 'Transparent Modal',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}
