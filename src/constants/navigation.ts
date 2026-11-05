import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

import { Colors, FontFamily } from './theme';

type StackOptions = Extract<ComponentProps<typeof Stack>['screenOptions'], object>;

/** How the top bar looks on every screen. */
export const stackScreenOptions: StackOptions = {
  headerTintColor: Colors.primary,
  headerTitleStyle: { color: Colors.text, fontFamily: FontFamily, fontWeight: '600' },
  headerStyle: { backgroundColor: Colors.surface },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: Colors.background },
};
