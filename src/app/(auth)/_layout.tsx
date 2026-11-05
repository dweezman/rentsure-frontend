import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Log in' }} />
      <Stack.Screen name="register" options={{ title: 'Create account' }} />
      <Stack.Screen name="verify" options={{ title: 'Verify your account' }} />
    </Stack>
  );
}
