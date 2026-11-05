import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { AppText } from './text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Colors.primary, fg: Colors.textInverse, border: Colors.primary },
  secondary: { bg: Colors.primarySoft, fg: Colors.primaryDark, border: Colors.primarySoft },
  outline: { bg: Colors.surface, fg: Colors.text, border: Colors.border },
  ghost: { bg: 'transparent', fg: Colors.primary, border: 'transparent' },
  danger: { bg: Colors.surface, fg: Colors.danger, border: Colors.danger },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  loading,
  fullWidth = true,
  style,
}: ButtonProps) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: p.bg, borderColor: p.border },
        fullWidth ? styles.full : styles.auto,
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} />}
          <AppText variant={size === 'sm' ? 'label' : 'bodyStrong'} color={p.fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { minHeight: 50, paddingHorizontal: Spacing.lg },
  sm: { minHeight: 36, paddingHorizontal: Spacing.md },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
});
