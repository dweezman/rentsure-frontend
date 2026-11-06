import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Divider } from '@/components/ui';
import { WideBreakpoint } from '@/constants/tabs';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';

const POINTS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'shield-checkmark', title: 'Verified landlords', text: 'Landlords prove who they are and that they can let the property.' },
  { icon: 'home', title: 'Real, checked listings', text: 'Properties get a badge only after RentSure reviews them.' },
  { icon: 'document-text', title: 'Tenancy in one place', text: 'Applications, agreements, rent and repairs, all tracked.' },
];

export default function Welcome() {
  const { width } = useWindowDimensions();
  const wide = width >= WideBreakpoint;
  const insets = useSafeAreaInsets();

  // On big screens the page splits in two: the words and buttons on the left, the green panel on the right.
  if (wide) {
    return (
      <View style={styles.split}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.splitContent}>
          <View style={styles.splitInner}>
            <Content />
          </View>
        </ScrollView>
        <View style={styles.splitPanel}>
          <GreenPanel size="large" />
        </View>
      </View>
    );
  }

  // On phones the green panel sits at the top like a banner, and the rest scrolls below it.
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      <View style={[styles.phonePanel, { paddingTop: insets.top + Spacing.lg }]}>
        <GreenPanel size="small" />
      </View>
      <View style={styles.phoneInner}>
        <Content />
      </View>
    </ScrollView>
  );
}

/** The logo, headline, feature list and buttons. Same on every screen size. */
function Content() {
  const { actions } = useStore();
  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={styles.hero}>
        <AppText variant="display" style={styles.headline}>
          Rent safely, straight from verified landlords.
        </AppText>
        <AppText variant="body" color={Colors.textSecondary}>
          Find a home, sign your agreement and keep track of rent and repairs, all in one place.
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
    </View>
  );
}

/** The green area with the RentSure logo large in the middle. */
function GreenPanel({ size }: { size: 'large' | 'small' }) {
  const large = size === 'large';
  const tile = large ? 96 : 60;

  return (
    <View style={[styles.panel, large ? styles.panelLarge : styles.panelSmall]}>
      {/* Two big soft circles in the background. */}
      <View style={[styles.blob, { width: 420, height: 420, borderRadius: 210, top: -140, right: -120 }]} />
      <View style={[styles.blob, { width: 300, height: 300, borderRadius: 150, bottom: -120, left: -90 }]} />

      <View style={styles.mark}>
        <View style={[styles.markTile, { width: tile, height: tile, borderRadius: tile * 0.28 }]}>
          <Ionicons name="key" size={tile * 0.5} color={Colors.primary} />
        </View>
        <AppText style={[styles.markName, { fontSize: large ? 36 : 26, lineHeight: large ? 44 : 32 }]}>
          RentSure
        </AppText>
        <AppText style={[styles.markLine, { fontSize: large ? 16 : 14 }]}>Rent with confidence.</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  split: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  splitPanel: { width: '34%', maxWidth: 480, padding: Spacing.lg },
  splitContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl * 2 },
  splitInner: { width: '100%', maxWidth: 480, alignSelf: 'center' },

  phonePanel: { padding: Spacing.lg, paddingBottom: 0 },
  phoneInner: { padding: Spacing.lg, paddingTop: Spacing.xl },

  panel: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  panelLarge: { flex: 1 },
  panelSmall: { paddingVertical: Spacing.xl },
  blob: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },

  mark: { alignItems: 'center', gap: Spacing.md },
  markTile: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  markName: { color: Colors.textInverse, fontWeight: '800', letterSpacing: -0.5 },
  markLine: { color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  hero: { gap: Spacing.sm },
  headline: { fontSize: 32, lineHeight: 39 },
  points: { gap: Spacing.lg, paddingVertical: Spacing.xs },
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
