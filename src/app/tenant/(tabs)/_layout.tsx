import { Tabs } from 'expo-router';

import { HeaderActions } from '@/components/header-buttons';
import { tabIcon, useTabScreenOptions } from '@/constants/tabs';

export default function TenantTabs() {
  const tabOptions = useTabScreenOptions();
  return (
    <Tabs
      screenOptions={{
        ...tabOptions,
        headerRight: () => <HeaderActions profileHref="/tenant/profile" />,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen name="applications" options={{ title: 'Applications', tabBarIcon: tabIcon('document-text') }} />
      <Tabs.Screen name="home" options={{ title: 'My Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
