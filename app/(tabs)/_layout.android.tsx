
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'movie',
      iosIcon: 'film.fill',
      label: 'Movies',
    },
    {
      name: '(merch)',
      route: '/(tabs)/(merch)/',
      icon: 'shopping_bag',
      iosIcon: 'bag.fill',
      label: 'Merch',
    },
    {
      name: '(cart)',
      route: '/(tabs)/(cart)/',
      icon: 'shopping_cart',
      iosIcon: 'cart.fill',
      label: 'Cart',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(merch)" />
        <Stack.Screen name="(cart)" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
