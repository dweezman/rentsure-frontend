import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppStoreProvider, useStore } from '@/store/app-store';

/**
 * This decides which part of the app a person can see.
 * If nobody is logged in, or they haven't confirmed their email or phone yet, they see the sign-in screens.
 * Tenants only see the tenant screens, and landlords only see the landlord screens.
 * When someone logs in or out, the app moves them to the right part on its own.
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
