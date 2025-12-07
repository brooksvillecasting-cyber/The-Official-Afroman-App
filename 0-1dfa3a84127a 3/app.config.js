
const IS_WEB = process.env.EXPO_PUBLIC_PLATFORM === 'web';

const config = {
  expo: {
    name: 'Afroman Official App',
    slug: 'Afroman Official App',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/final_quest_240x240.png',
    scheme: 'afroman-tv',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/final_quest_240x240.png',
      resizeMode: 'contain',
      backgroundColor: '#F5F5DC',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.afroman.tv',
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        CFBundleLocalizations: ['en'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/final_quest_240x240.png',
        backgroundColor: '#F5F5DC',
      },
      package: 'com.afroman.tv',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/final_quest_240x240.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-video',
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
      // Only include Stripe plugin for native platforms
      ...(!IS_WEB
        ? [
            [
              '@stripe/stripe-react-native',
              {
                merchantIdentifier: 'merchant.com.afroman.tv',
                enableGooglePay: true,
              },
            ],
          ]
        : []),
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};

module.exports = config;
