import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, EmptyState, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';
import { formatDateTime } from '@/utils/format';

/** Shared notifications screen for tenants and landlords. */
export function NotificationsList() {
  const { state, currentUser, actions } = useStore();
  const items = state.notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Mark as read when leaving, so unread dots are visible while the screen is open.
  useEffect(() => () => actions.markAllNotificationsRead(), [actions]);

  if (!items.length) {
    return (
      <Screen>
        <EmptyState icon="notifications-outline" title="No notifications" message="Reminders and updates will show up here." />
      </Screen>
    );
  }

  return (
    <Screen>
      {items.map((n) => (
        <Card key={n.id} onPress={n.href ? () => router.push(n.href as Href) : undefined} style={styles.card}>
          {!n.read && <View style={styles.dot} />}
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyStrong">{n.title}</AppText>
            <AppText variant="body" color={Colors.textSecondary}>
              {n.body}
            </AppText>
            <AppText variant="tiny" color={Colors.textMuted}>
              {formatDateTime(n.createdAt)}
            </AppText>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 7 },
});
