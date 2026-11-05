import { StyleSheet, View } from 'react-native';

import { Colors, Spacing, ToneColors, type Tone } from '@/constants/theme';

import { AppText } from './text';

export interface TimelineItem {
  title: string;
  subtitle?: string;
  note?: string;
  tone?: Tone;
}

/** A list of what happened, from oldest to newest. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <View>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const c = ToneColors[item.tone ?? 'primary'];
        return (
          <View key={i} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: c.fg, borderColor: c.bg }]} />
              {!last && <View style={styles.line} />}
            </View>
            <View style={[styles.body, !last && { paddingBottom: Spacing.lg }]}>
              <AppText variant="bodyStrong">{item.title}</AppText>
              {item.subtitle && <AppText variant="caption">{item.subtitle}</AppText>}
              {item.note && (
                <View style={styles.note}>
                  <AppText variant="caption" color={Colors.text}>
                    {item.note}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** A progress bar that shows which step something is on. */
export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={styles.steps}>
      {steps.map((s, i) => {
        const done = i <= current;
        return (
          <View key={s} style={styles.step}>
            <View style={[styles.bar, { backgroundColor: done ? Colors.primary : Colors.border }]} />
            <AppText variant="tiny" color={done ? Colors.primaryDark : Colors.textMuted} numberOfLines={1}>
              {s}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  rail: { alignItems: 'center', width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2 },
  body: { flex: 1, gap: 2 },
  note: { marginTop: 6, padding: Spacing.md, backgroundColor: Colors.surfaceAlt, borderRadius: 10 },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2 },
});
