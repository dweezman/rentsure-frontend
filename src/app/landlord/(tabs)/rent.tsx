import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Badge, Card, EmptyState, Screen, SectionHeader, StatCard } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { installmentStatus, rentTotals, useStore } from '@/store/app-store';
import { useLandlordData } from '@/store/landlord';
import { formatDate, formatMoney, formatMoneyShort } from '@/utils/format';
import { agreementMeta, installmentMeta } from '@/utils/labels';

export default function LandlordRent() {
  const { state } = useStore();
  const { tenancies, installments } = useLandlordData();
  const totals = rentTotals(installments);
  const expected = installments.reduce((s, i) => s + i.amount, 0);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <StatCard icon="checkmark-done-outline" tone="success" label="Received" value={formatMoneyShort(totals.received)} />
        <StatCard icon="alert-circle-outline" tone={totals.overdue ? 'danger' : 'warning'} label="Due / overdue" value={formatMoneyShort(totals.outstanding)} />
        <StatCard icon="trending-up-outline" tone="info" label="Expected this term" value={formatMoneyShort(expected)} />
      </View>

      <SectionHeader title="Tenancies" />
      {tenancies.length === 0 ? (
        <EmptyState
          icon="key-outline"
          title="No tenancies yet"
          message="Approve an applicant, then create a tenancy to start tracking rent."
        />
      ) : (
        tenancies.map((t) => {
          const property = state.properties.find((p) => p.id === t.propertyId);
          const tenant = state.users.find((u) => u.id === t.tenantId);
          const own = installments.filter((i) => i.tenancyId === t.id);
          const next = own.find((i) => !i.paidAt);
          const paid = own.filter((i) => i.paidAt).reduce((s, i) => s + i.amount, 0);
          const total = own.reduce((s, i) => s + i.amount, 0) || 1;
          return (
            <Card key={t.id} onPress={() => router.push(`/landlord/tenancy/${t.id}`)} style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {property?.title}
                  </AppText>
                  <AppText variant="caption">{tenant?.fullName}</AppText>
                </View>
                <Badge {...agreementMeta[t.agreementStatus]} />
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round((paid / total) * 100)}%`, height: '100%', backgroundColor: Colors.success }} />
              </View>
              <AppText variant="caption">
                {formatMoney(paid)} of {formatMoney(total)} received
              </AppText>
              {next && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <AppText variant="caption">
                    Next: {formatMoney(next.amount)} on {formatDate(next.dueDate)}
                  </AppText>
                  <Badge {...installmentMeta[installmentStatus(next)]} />
                </View>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
