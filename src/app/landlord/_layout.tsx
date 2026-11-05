import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

/** Landlord area: bottom tabs plus the detail screens they open. */
export default function LandlordLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="verification" options={{ title: 'Landlord verification' }} />
      <Stack.Screen name="property/new" options={{ title: 'Add property' }} />
      <Stack.Screen name="property/[id]" options={{ title: 'Property' }} />
      <Stack.Screen name="compare/[propertyId]" options={{ title: 'Compare applicants' }} />
      <Stack.Screen name="application/[id]" options={{ title: 'Review application' }} />
      <Stack.Screen name="tenancy/new" options={{ title: 'Create tenancy' }} />
      <Stack.Screen name="tenancy/[id]" options={{ title: 'Tenancy' }} />
      <Stack.Screen name="maintenance/[id]" options={{ title: 'Maintenance request' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
