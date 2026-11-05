import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useStore, useUnreadCount } from '@/store/app-store';

/** The bell and profile picture in the top right corner. */
export function HeaderActions({ profileHref }: { profileHref: Href }) {
  const unread = useUnreadCount();
  const { currentUser } = useStore();
  const base = currentUser?.role === 'landlord' ? '/landlord' : '/tenant';
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Notifications, ${unread} unread`}
        onPress={() => router.push(`${base}/notifications` as Href)}
        hitSlop={8}
        style={styles.bell}>
        <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        {unread > 0 && (
          <View style={styles.dot}>
            <AppText variant="tiny" color="#fff">
              {unread > 9 ? '9+' : unread}
            </AppText>
          </View>
        )}
      </Pressable>
      {currentUser && (
        <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push(profileHref)}>
          <Avatar name={currentUser.fullName} size={32} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginRight: Spacing.lg },
  bell: { padding: 2 },
  dot: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
