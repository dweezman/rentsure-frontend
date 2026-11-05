import Ionicons from '@expo/vector-icons/Ionicons';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { Colors, FontFamily } from './theme';

type TabOptions = Extract<ComponentProps<typeof Tabs>['screenOptions'], object>;

export const tabScreenOptions: TabOptions = {
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textMuted,
  tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
  tabBarLabelStyle: { fontFamily: FontFamily, fontSize: 11, fontWeight: '600' },
  headerStyle: { backgroundColor: Colors.surface },
  headerShadowVisible: false,
  headerTitleStyle: { color: Colors.text, fontFamily: FontFamily, fontWeight: '700', fontSize: 20 },
  headerTitleAlign: 'left',
  sceneStyle: { backgroundColor: Colors.background },
};

/** Filled icon when the tab is active, outline otherwise. */
export function tabIcon(name: string) {
  const TabIcon = ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons
      name={(focused ? name : `${name}-outline`) as keyof typeof Ionicons.glyphMap}
      size={size - 2}
      color={color as string}
    />
  );
  return TabIcon;
}
