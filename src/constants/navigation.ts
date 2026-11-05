import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

import { Colors, FontFamily } from './theme';

type StackOptions = Extract<ComponentProps<typeof Stack>['screenOptions'], object>;

/** Shared header look for every stack. */
export const stackScreenOptions: StackOptions = {
  headerTintColor: Colors.primary,
  headerTitleStyle: { color: Colors.text, fontFamily: FontFamily, fontWeight: '600' },
  headerStyle: { backgroundColor: Colors.surface },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: Colors.background },
};
