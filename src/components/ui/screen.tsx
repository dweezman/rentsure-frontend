import { Fragment, isValidElement, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  /** Sticky content pinned to the bottom, e.g. the main action button. */
  footer?: ReactNode;
  /** Add the top safe-area inset (only for screens without a header). */
  safeTop?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Standard page wrapper: grey background, padding, a max width on big
 * screens, keyboard avoidance and an optional sticky footer.
 */
export function Screen({ children, footer, safeTop, scroll = true, contentStyle, refreshControl }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const inner = (
    <View style={[styles.inner, contentStyle]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView
      style={[styles.root, safeTop && { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{inner}</View>
      )}
      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.footerInner}>
            {/* A single button fills the footer; a group (fragment) lays out its own widths. */}
            {isValidElement(footer) && footer.type !== Fragment ? <View style={styles.flex}>{footer}</View> : footer}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.xxl },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  footerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
