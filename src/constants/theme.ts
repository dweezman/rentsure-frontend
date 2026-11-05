/**
 * RentSure design tokens. Change colours, spacing and type here, not in screens.
 */
import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  primary: '#0E7C66',
  primaryDark: '#095C4B',
  primarySoft: '#E3F3EF',
  accent: '#F2A33A',

  text: '#14201C',
  textSecondary: '#5B6763',
  textMuted: '#8A9591',
  textInverse: '#FFFFFF',

  background: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F0',
  border: '#DCE3E0',

  success: '#1F8A4C',
  successSoft: '#E2F4E9',
  warning: '#B26A00',
  warningSoft: '#FFF2DC',
  danger: '#C6372F',
  dangerSoft: '#FCE6E4',
  info: '#2563A8',
  infoSoft: '#E3EDF9',
  neutral: '#5B6763',
  neutralSoft: '#EBEFED',
} as const;

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export const ToneColors: Record<Tone, { fg: string; bg: string }> = {
  success: { fg: Colors.success, bg: Colors.successSoft },
  warning: { fg: Colors.warning, bg: Colors.warningSoft },
  danger: { fg: Colors.danger, bg: Colors.dangerSoft },
  info: { fg: Colors.info, bg: Colors.infoSoft },
  neutral: { fg: Colors.neutral, bg: Colors.neutralSoft },
  primary: { fg: Colors.primary, bg: Colors.primarySoft },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const FontFamily = Platform.select({
  web: 'var(--font-display)',
  default: undefined,
});

export const Type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
} as const;

/** Content never stretches wider than this on tablets and the web. */
export const MaxContentWidth = 720;

export const Shadow = Platform.select({
  web: { boxShadow: '0 1px 3px rgba(20, 32, 28, 0.08)' },
  default: {
    shadowColor: '#14201C',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
