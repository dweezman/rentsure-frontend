import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Divider, Screen } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';

const POINTS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'shield-checkmark', title: 'Verified landlords', text: 'Landlords prove who they are and that they can let the property.' },
  { icon: 'home', title: 'Real, checked listings', text: 'Properties get a badge only after RentSure reviews them.' },
  { icon: 'document-text', title: 'Tenancy in one place', text: 'Applications, agreements, rent and repairs, all tracked.' },
];

export default function Welcome() {
  const { actions } = useStore();

  return (
    <Screen safeTop>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="key" size={30} color={Colors.textInverse} />
        </View>
        <AppText variant="display" align="center">
          RentSure
        </AppText>
        <AppText variant="body" align="center" color={Colors.textSecondary} style={{ maxWidth: 320 }}>
          Rent directly from verified landlords and manage your tenancy safely.
        </AppText>
      </View>

      <View style={styles.points}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.pointIcon}>
              <Ionicons name={p.icon} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{p.title}</AppText>
              <AppText variant="caption">{p.text}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: Spacing.md }}>
        <Button
          title="I'm looking for a place"
          icon="search"
          onPress={() => router.push({ pathname: '/register', params: { role: 'tenant' } })}
        />
        <Button
          title="I'm a landlord"
          icon="business"
          variant="secondary"
          onPress={() => router.push({ pathname: '/register', params: { role: 'landlord' } })}
        />
        <Button title="I already have an account" variant="ghost" onPress={() => router.push('/login')} />
      </View>

      <Card style={{ gap: Spacing.sm }}>
        <AppText variant="label">Demo accounts</AppText>
        <AppText variant="caption">
          For testing before the backend is connected. Signs you straight in with sample data.
        </AppText>
        <Divider />
        <View style={styles.demoRow}>
          <Button title="Tenant demo" size="sm" variant="outline" icon="person" onPress={() => actions.loginAsDemo('tenant')} style={{ flex: 1 }} />
          <Button title="Landlord demo" size="sm" variant="outline" icon="business" onPress={() => actions.loginAsDemo('landlord')} style={{ flex: 1 }} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xxl, paddingBottom: Spacing.md },
  logo: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  points: { gap: Spacing.lg, paddingVertical: Spacing.md },
  point: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoRow: { flexDirection: 'row', gap: Spacing.sm },
});
