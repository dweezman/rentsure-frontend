import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Badge, Banner, Card, Divider, EmptyState, ListRow, Screen, SectionHeader, StatCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { installmentStatus, rentTotals, useActiveTenancy, useTenancyInstallments } from '@/store/app-store';
import { formatDate, formatMoney, relativeDays } from '@/utils/format';
import { installmentMeta } from '@/utils/labels';

export default function Payments() {
  const tenancy = useActiveTenancy();
  const installments = useTenancyInstallments(tenancy?.id);

  if (!tenancy) {
    return (
      <Screen>
        <EmptyState icon="wallet-outline" title="No payments yet" message="Rent payments appear here once you have a tenancy." />
      </Screen>
    );
  }

  const totals = rentTotals(installments);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <StatCard icon="checkmark-done-outline" tone="success" label="Paid" value={formatMoney(totals.received)} />
        <StatCard icon="alert-circle-outline" tone={totals.overdue ? 'danger' : 'warning'} label={totals.overdue ? 'Overdue' : 'Due soon'} value={formatMoney(totals.outstanding)} />
      </View>

      {totals.next && (
        <Banner
          tone={installmentStatus(totals.next) === 'overdue' ? 'danger' : 'info'}
          icon="calendar-outline"
          title={`Next payment ${relativeDays(totals.next.dueDate)}`}
          message={`${formatMoney(totals.next.amount)} due on ${formatDate(totals.next.dueDate)}. Pay only into the account in your agreement, then your landlord will record it here.`}
        />
      )}

      <Card>
        <SectionHeader title="Payment schedule" />
        {installments.map((i, idx) => {
          const st = installmentStatus(i);
          return (
            <View key={i.id}>
              {idx > 0 && <Divider />}
              <ListRow
                icon={st === 'paid' ? 'receipt-outline' : 'time-outline'}
                iconTone={installmentMeta[st].tone}
                title={formatMoney(i.amount)}
                subtitle={st === 'paid' ? `Paid ${formatDate(i.paidAt!)} · tap for receipt` : `Due ${formatDate(i.dueDate)}`}
                right={<Badge {...installmentMeta[st]} />}
                onPress={st === 'paid' ? () => router.push(`/tenant/receipt/${i.id}`) : undefined}
              />
            </View>
          );
        })}
      </Card>
      <AppText variant="caption" align="center">
        Online rent payment will be added once the payments service is connected.
      </AppText>
    </Screen>
  );
}
