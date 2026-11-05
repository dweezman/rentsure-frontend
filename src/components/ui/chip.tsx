import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { AppText } from './text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      {selected && onPress ? (
        <Ionicons name="checkmark" size={14} color={Colors.primaryDark} />
      ) : icon ? (
        <Ionicons name={icon} size={14} color={Colors.textSecondary} />
      ) : null}
      <AppText variant="label" color={selected ? Colors.primaryDark : Colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: readonly Option<T>[];
  /** Put the options in one row you can scroll sideways, instead of wrapping onto new lines. */
  scroll?: boolean;
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  scroll,
}: ChipGroupProps<T> & { value: T | null; onChange: (v: T) => void }) {
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} selected={value === o.value} onPress={() => onChange(o.value)} />
  ));
  return <ChipRow scroll={scroll}>{chips}</ChipRow>;
}

export function ChipMultiSelect<T extends string>({
  options,
  values,
  onChange,
  scroll,
}: ChipGroupProps<T> & { values: T[]; onChange: (v: T[]) => void }) {
  const toggle = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} selected={values.includes(o.value)} onPress={() => toggle(o.value)} />
  ));
  return <ChipRow scroll={scroll}>{chips}</ChipRow>;
}

export function ChipRow({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.wrap]}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  pressed: { opacity: 0.8 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  wrap: { flexWrap: 'wrap' },
});
