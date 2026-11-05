import { router } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  ListRow,
  Screen,
  SectionHeader,
  StatCard,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { installmentStatus, rentTotals, useCurrentUser, useStore } from '@/store/app-store';
import { useLandlordData } from '@/store/landlord';
import { formatDate, formatMoney, formatMoneyShort, relativeDays } from '@/utils/format';
import { applicationMeta, installmentMeta } from '@/utils/labels';

export default function LandlordDashboard() {
  const me = useCurrentUser();
  const { state } = useStore();
  const { properties, applications, tenancies, installments, maintenance } = useLandlordData();

  const totals = rentTotals(installments);
  const pendingApps = applications.filter((a) => ['submitted', 'under_review', 'info_requested'].includes(a.status));
  const openRepairs = maintenance.filter((m) => !['resolved', 'rejected'].includes(m.status));
  const upcoming = installments.filter((i) => !i.paidAt).slice(0, 4);
  const awaitingSignature = tenancies.filter((t) => t.agreementStatus === 'sent');
  const propertyTitle = (id: string) => state.properties.find((p) => p.id === id)?.title ?? '';
  const tenantName = (tenancyId: string) => {
    const t = tenancies.find((x) => x.id === tenancyId);
    return state.users.find((u) => u.id === t?.tenantId)?.fullName ?? '';
  };

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <AppText variant="title">Welcome, {me.fullName.split(' ')[0]}</AppText>
        <AppText variant="caption">Here’s what’s happening with your properties.</AppText>
      </View>

      {me.verificationStatus !== 'verified' && (
        <Banner
          tone={me.verificationStatus === 'pending' ? 'warning' : 'info'}
          icon="shield-outline"
          title={me.verificationStatus === 'pending' ? 'Verification in review' : 'Get verified to build trust'}
          message={
            me.verificationStatus === 'pending'
              ? "We're checking your documents. Your listings will show the verified landlord badge once approved."
              : 'Tenants prefer verified landlords. It only takes a few minutes.'
          }
          actionLabel={me.verificationStatus === 'pending' ? 'View status' : 'Start verification'}
          onAction={() => router.push('/landlord/verification')}
        />
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <StatCard icon="business-outline" label="Properties" value={properties.length} onPress={() => router.navigate('/landlord/properties')} />
        <StatCard icon="key-outline" label="Active tenancies" value={tenancies.filter((t) => t.agreementStatus !== 'ended').length} tone="success" onPress={() => router.navigate('/landlord/rent')} />
        <StatCard icon="people-outline" label="Applications to review" value={pendingApps.length} tone="info" onPress={() => router.navigate('/landlord/applications')} />
        <StatCard icon="construct-outline" label="Open repairs" value={openRepairs.length} tone={openRepairs.length ? 'warning' : 'neutral'} onPress={() => router.navigate('/landlord/maintenance')} />
        <StatCard icon="wallet-outline" label="Rent received" value={formatMoneyShort(totals.received)} tone="success" onPress={() => router.navigate('/landlord/rent')} />
        <StatCard icon="alert-circle-outline" label="Rent due / overdue" value={formatMoneyShort(totals.outstanding)} tone={totals.overdue ? 'danger' : 'warning'} onPress={() => router.navigate('/landlord/rent')} />
      </View>

      {awaitingSignature.length > 0 && (
        <Banner
          tone="warning"
          icon="create-outline"
          title={`${awaitingSignature.length} agreement${awaitingSignature.length > 1 ? 's' : ''} awaiting tenant signature`}
          actionLabel="View"
          onAction={() => router.push(`/landlord/tenancy/${awaitingSignature[0]!.id}`)}
        />
      )}

      <Card>
        <SectionHeader title="New applications" actionLabel="See all" onAction={() => router.navigate('/landlord/applications')} />
        {pendingApps.length === 0 ? (
          <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
            No applications waiting for you.
          </AppText>
        ) : (
          pendingApps.slice(0, 4).map((a, i) => (
            <View key={a.id}>
              {i > 0 && <Divider />}
              <ListRow
                icon="person-outline"
                title={a.fullName}
                subtitle={propertyTitle(a.propertyId)}
                right={<Badge {...applicationMeta[a.status]} />}
                onPress={() => router.push(`/landlord/application/${a.id}`)}
              />
            </View>
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title="Upcoming rent" />
        {upcoming.length === 0 ? (
          <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
            No rent payments scheduled.
          </AppText>
        ) : (
          upcoming.map((inst, i) => {
            const st = installmentStatus(inst);
            return (
              <View key={inst.id}>
                {i > 0 && <Divider />}
                <ListRow
                  icon="calendar-outline"
                  iconTone={installmentMeta[st].tone}
                  title={`${formatMoney(inst.amount)} · ${tenantName(inst.tenancyId)}`}
                  subtitle={`Due ${formatDate(inst.dueDate)} (${relativeDays(inst.dueDate)})`}
                  right={<Badge {...installmentMeta[st]} />}
                  onPress={() => router.push(`/landlord/tenancy/${inst.tenancyId}`)}
                />
              </View>
            );
          })
        )}
      </Card>

      <Button title="Add a property" icon="add" onPress={() => router.push('/landlord/property/new')} />
    </Screen>
  );
}
