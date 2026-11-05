import { Text, type TextProps } from 'react-native';

import { Colors, FontFamily, Type } from '@/constants/theme';

export type TextVariant = keyof typeof Type;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  const muted = variant === 'caption' || variant === 'tiny';
  return (
    <Text
      style={[
        Type[variant],
        { color: color ?? (muted ? Colors.textSecondary : Colors.text), fontFamily: FontFamily, textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
