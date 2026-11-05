/**
 * Small layout pieces used across screens.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing, ToneColors, type Tone } from '@/constants/theme';
import { initials } from '@/utils/format';

import { Button } from './button';
import { AppText } from './text';

type IconName = keyof typeof Ionicons.glyphMap;

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <AppText variant="label" color={Colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

/** Label on the left, value on the right. */
export function InfoRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" style={styles.infoLabel}>
        {label}
      </AppText>
      {typeof value === 'string' || typeof value === 'number' ? (
        <AppText variant={strong ? 'bodyStrong' : 'body'} style={styles.infoValue}>
          {value}
        </AppText>
      ) : (
        value
      )}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function ListRow({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: IconName;
  iconTone?: Tone;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const tone = ToneColors[iconTone];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.7 }]}>
      {icon && (
        <View style={[styles.listIcon, { backgroundColor: tone.bg }]}>
          <Ionicons name={icon} size={20} color={tone.fg} />
        </View>
      )}
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" numberOfLines={2}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />}
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={Colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="caption" align="center" style={{ maxWidth: 320 }}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: Spacing.sm }} />
      )}
    </View>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  onPress,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  tone?: Tone;
  onPress?: () => void;
}) {
  const c = ToneColors[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.85 }]}>
      <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
        <Ionicons name={icon} size={18} color={c.fg} />
      </View>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Avatar({ name, uri, size = 44 }: { name: string; uri?: string; size?: number }) {
  if (uri) {
    return <Image source={uri} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <AppText variant={size > 50 ? 'title' : 'bodyStrong'} color={Colors.primaryDark}>
        {initials(name)}
      </AppText>
    </View>
  );
}

/** A coloured call-out box for warnings, tips and next steps. */
export function Banner({
  tone = 'info',
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  tone?: Tone;
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const c = ToneColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: c.bg, borderColor: c.fg + '33' }]}>
      <Ionicons name={icon ?? 'information-circle'} size={22} color={c.fg} />
      <View style={[styles.flex, { gap: 2 }]}>
        <AppText variant="bodyStrong" color={c.fg}>
          {title}
        </AppText>
        {message && <AppText variant="caption" color={Colors.text}>{message}</AppText>}
        {actionLabel && onAction && (
          <Pressable onPress={onAction} accessibilityRole="button" style={{ marginTop: 6 }} hitSlop={6}>
            <AppText variant="label" color={c.fg}>
              {actionLabel} →
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** − 2 + number stepper. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <View style={styles.stepperRow}>
      {label && <AppText variant="label" style={styles.flex}>{label}</AppText>}
      <View style={styles.stepper}>
        <Pressable
          accessibilityLabel="Decrease"
          onPress={() => onChange(Math.max(min, value - 1))}
          style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color={Colors.text} />
        </Pressable>
        <AppText variant="bodyStrong" style={{ minWidth: 28 }} align="center">
          {value}
        </AppText>
        <Pressable
          accessibilityLabel="Increase"
          onPress={() => onChange(Math.min(max, value + 1))}
          style={styles.stepBtn}>
          <Ionicons name="add" size={18} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

/** Two or three equal tabs inside a screen, e.g. Active / Closed. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}>
            <AppText variant="label" color={active ? Colors.text : Colors.textSecondary}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Ionicons name="checkmark" size={16} color={Colors.textInverse} />}
      </View>
      <View style={styles.flex}>{typeof label === 'string' ? <AppText variant="caption" color={Colors.text}>{label}</AppText> : label}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  infoLabel: { flexShrink: 0, maxWidth: '45%' },
  infoValue: { flex: 1, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  listIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 140,
    gap: 4,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  statIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatar: { backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 4,
  },
  stepBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, backgroundColor: Colors.surfaceAlt },
  segmented: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: 4 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.sm },
  segmentActive: { backgroundColor: Colors.surface },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
