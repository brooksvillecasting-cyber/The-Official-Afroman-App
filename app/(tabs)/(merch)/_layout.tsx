
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function MerchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
