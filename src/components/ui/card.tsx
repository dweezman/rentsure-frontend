import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ onPress, padded = true, style, children, ...rest }: CardProps) {
  const content = [styles.card, padded && styles.padded, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [content, pressed && styles.pressed]}
        {...rest}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={content} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow,
  },
  padded: { padding: Spacing.lg },
  pressed: { opacity: 0.9 },
});
