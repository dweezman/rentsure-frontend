import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, EmptyState, Screen, VerificationBadge } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useProperty, useStore } from '@/store/app-store';
import { formatDate, formatMoney } from '@/utils/format';
import { applicationMeta, employmentLabel } from '@/utils/labels';

/** Side-by-side view of every applicant for one property. */
export default function CompareApplicants() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const property = useProperty(propertyId);
  const { state } = useStore();

  const apps = state.applications.filter(
    (a) => a.propertyId === propertyId && !['draft', 'withdrawn'].includes(a.status),
  );

  if (!property || apps.length === 0) {
    return (
      <Screen>
        <EmptyState icon="people-outline" title="No applicants to compare" />
      </Screen>
    );
  }

  // Rent as a share of monthly income — a common affordability check.
  const monthlyRent = property.rentPeriod === 'year' ? property.rent / 12 : property.rent;
  const highestIncome = Math.max(...apps.map((a) => a.monthlyIncome ?? 0));

  const rows: { label: string; render: (a: (typeof apps)[number]) => React.ReactNode }[] = [
    { label: 'Status', render: (a) => <Badge {...applicationMeta[a.status]} /> },
    {
      label: 'ID check',
      render: (a) => (
        <VerificationBadge status={state.users.find((u) => u.id === a.tenantId)?.verificationStatus ?? 'not_submitted'} subject="identity" />
      ),
    },
    { label: 'Employment', render: (a) => <AppText variant="caption" color={Colors.text}>{employmentLabel[a.employmentStatus]}{a.employer ? `\n${a.employer}` : ''}</AppText> },
    {
      label: 'Monthly income',
      render: (a) =>
        a.monthlyIncome ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <AppText variant="bodyStrong">{formatMoney(a.monthlyIncome)}</AppText>
            {a.monthlyIncome === highestIncome && <Ionicons name="trophy-outline" size={14} color={Colors.accent} />}
          </View>
        ) : (
          <AppText variant="caption">Not shared</AppText>
        ),
    },
    {
      label: 'Rent / income',
      render: (a) => {
        if (!a.monthlyIncome) return <AppText variant="caption">—</AppText>;
        const pct = Math.round((monthlyRent / a.monthlyIncome) * 100);
        const tone = pct <= 30 ? 'success' : pct <= 45 ? 'warning' : 'danger';
        return <Badge label={`${pct}%`} tone={tone} />;
      },
    },
    { label: 'Move-in', render: (a) => <AppText variant="caption" color={Colors.text}>{formatDate(a.moveInDate)}</AppText> },
    { label: 'Occupants', render: (a) => <AppText variant="caption" color={Colors.text}>{a.occupants}</AppText> },
    { label: 'Documents', render: (a) => <AppText variant="caption" color={Colors.text}>{a.documents.length} attached</AppText> },
    { label: 'Applied', render: (a) => <AppText variant="caption" color={Colors.text}>{formatDate(a.createdAt)}</AppText> },
  ];

  return (
    <Screen>
      <View>
        <AppText variant="heading">{property.title}</AppText>
        <AppText variant="caption">
          {apps.length} applicants · rent ≈ {formatMoney(monthlyRent)}/month
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.row}>
            <View style={styles.labelCell} />
            {apps.map((a) => (
              <View key={a.id} style={[styles.cell, styles.headCell]}>
                <Avatar name={a.fullName} size={40} />
                <AppText variant="bodyStrong" align="center" numberOfLines={2}>
                  {a.fullName}
                </AppText>
              </View>
            ))}
          </View>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i % 2 === 0 && styles.striped]}>
              <View style={styles.labelCell}>
                <AppText variant="label">{r.label}</AppText>
              </View>
              {apps.map((a) => (
                <View key={a.id} style={styles.cell}>
                  {r.render(a)}
                </View>
              ))}
            </View>
          ))}
          <View style={styles.row}>
            <View style={styles.labelCell} />
            {apps.map((a) => (
              <View key={a.id} style={styles.cell}>
                <Button title="Review" size="sm" onPress={() => router.push(`/landlord/application/${a.id}`)} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <AppText variant="caption">
        Rent / income under 30% is generally considered affordable. Treat applicants fairly: decide on affordability and
        references, not on personal characteristics.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  striped: { backgroundColor: Colors.surface, borderRadius: Radius.sm },
  labelCell: { width: 110, paddingVertical: Spacing.md, paddingRight: Spacing.sm, justifyContent: 'center' },
  cell: { width: 150, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, justifyContent: 'center' },
  headCell: { alignItems: 'center', gap: 6 },
});
