import Ionicons from '@expo/vector-icons/Ionicons';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useWindowDimensions, type ColorValue } from 'react-native';

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

/** Screens at least this wide (laptops, desktops) get a sidebar instead of bottom tabs. */
export const WideBreakpoint = 1024;

/** Tab options for the current screen size: bottom tabs on phones, a left sidebar on wide screens. */
export function useTabScreenOptions(): TabOptions {
  const { width } = useWindowDimensions();
  if (width < WideBreakpoint) return tabScreenOptions;
  return {
    ...tabScreenOptions,
    tabBarPosition: 'left',
    tabBarVariant: 'material',
    tabBarLabelPosition: 'beside-icon',
    tabBarStyle: { backgroundColor: Colors.surface, borderRightColor: Colors.border, width: 220, paddingTop: 12 },
    tabBarLabelStyle: { fontFamily: FontFamily, fontSize: 15, fontWeight: '600' },
    tabBarItemStyle: { justifyContent: 'flex-start', paddingHorizontal: 8, borderRadius: 10, marginHorizontal: 8 },
    tabBarActiveBackgroundColor: Colors.primarySoft,
  };
}

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
