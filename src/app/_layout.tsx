import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppStoreProvider, useStore } from '@/store/app-store';

/**
 * Root navigator. Which screens exist depends on who is signed in:
 *   signed out / unverified contact → (auth) screens
 *   tenant                          → /tenant/...
 *   landlord                        → /landlord/...
 * Changing the signed-in user automatically moves to the right area.
 */
function RootNavigator() {
  const { currentUser } = useStore();
  const signedIn = !!currentUser?.contactVerified;
  const role = currentUser?.role;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && role === 'tenant'}>
        <Stack.Screen name="tenant" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && role === 'landlord'}>
        <Stack.Screen name="landlord" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppStoreProvider>
  );
}
