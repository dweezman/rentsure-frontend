import { Tabs } from 'expo-router';

import { HeaderActions } from '@/components/header-buttons';
import { tabIcon, useTabScreenOptions } from '@/constants/tabs';
import { useStore } from '@/store/app-store';

export default function LandlordTabs() {
  const tabOptions = useTabScreenOptions();
  const { state, currentUser } = useStore();
  const myProps = new Set(state.properties.filter((p) => p.landlordId === currentUser?.id).map((p) => p.id));
  const newApps = state.applications.filter((a) => myProps.has(a.propertyId) && a.status === 'submitted').length;
  const openRequests = state.maintenance.filter(
    (m) => m.landlordId === currentUser?.id && m.status === 'submitted',
  ).length;

  return (
    <Tabs
      screenOptions={{
        ...tabOptions,
        headerRight: () => <HeaderActions profileHref="/landlord/profile" />,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="properties" options={{ title: 'Properties', tabBarIcon: tabIcon('business') }} />
      <Tabs.Screen
        name="applications"
        options={{ title: 'Applicants', tabBarIcon: tabIcon('people'), tabBarBadge: newApps || undefined }}
      />
      <Tabs.Screen name="rent" options={{ title: 'Rent', tabBarIcon: tabIcon('wallet') }} />
      <Tabs.Screen
        name="maintenance"
        options={{ title: 'Repairs', tabBarIcon: tabIcon('construct'), tabBarBadge: openRequests || undefined }}
      />
    </Tabs>
  );
}
