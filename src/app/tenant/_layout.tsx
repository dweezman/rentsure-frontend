import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

/** All the tenant screens: the main tabs, plus the pages you open from them. */
export default function TenantLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ title: 'Property' }} />
      <Stack.Screen name="apply/[propertyId]" options={{ title: 'Apply to rent' }} />
      <Stack.Screen name="application/[id]" options={{ title: 'Application' }} />
      <Stack.Screen name="agreement" options={{ title: 'Tenancy agreement' }} />
      <Stack.Screen name="payments" options={{ title: 'Rent & payments' }} />
      <Stack.Screen name="receipt/[id]" options={{ title: 'Receipt' }} />
      <Stack.Screen name="maintenance/new" options={{ title: 'New request' }} />
      <Stack.Screen name="maintenance/[id]" options={{ title: 'Request details' }} />
      <Stack.Screen name="report" options={{ title: 'Report a concern' }} />
      <Stack.Screen name="reports" options={{ title: 'My reports' }} />
      <Stack.Screen name="verify-identity" options={{ title: 'Verify your identity' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
