import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { PropertyCard } from '@/components/property/property-card';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  EmptyState,
  InfoRow,
  ListRow,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  installmentStatus,
  useActiveTenancy,
  usePendingAgreement,
  useProperty,
  useStore,
  useTenancyInstallments,
} from '@/store/app-store';
import { daysUntil, formatDate, formatMoney, relativeDays } from '@/utils/format';
import { installmentMeta, maintenanceMeta } from '@/utils/labels';

export default function MyHome() {
  const tenancy = useActiveTenancy();
  const pending = usePendingAgreement();
  const property = useProperty(tenancy?.propertyId);
  const pendingProperty = useProperty(pending?.propertyId);
  const installments = useTenancyInstallments(tenancy?.id);
  const { state } = useStore();

  if (!tenancy || !property) {
    return (
      <Screen>
        <EmptyState
          icon="home-outline"
          title="No tenancy yet"
          message="Once a landlord approves your application and you sign the agreement, your home, rent and repairs will be managed here."
          actionLabel="Find a place"
          onAction={() => router.navigate('/tenant')}
        />
      </Screen>
    );
  }

  const next = installments.find((i) => !i.paidAt);
  const nextStatus = next ? installmentStatus(next) : null;
  const requests = state.maintenance
    .filter((m) => m.tenancyId === tenancy.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openRequests = requests.filter((m) => m.status !== 'resolved' && m.status !== 'rejected');
  const daysLeft = daysUntil(tenancy.endDate);

  const actions: { icon: keyof typeof Ionicons.glyphMap; label: string; href: Href }[] = [
    { icon: 'document-text-outline', label: 'Agreement', href: { pathname: '/tenant/agreement', params: { id: tenancy.id } } },
    { icon: 'receipt-outline', label: 'Payments', href: '/tenant/payments' },
    { icon: 'construct-outline', label: 'Request repair', href: '/tenant/maintenance/new' },
    { icon: 'chatbox-ellipses-outline', label: 'Report issue', href: { pathname: '/tenant/maintenance/new', params: { category: 'other' } } },
  ];

  return (
    <Screen>
      <PropertyCard compact property={property} onPress={() => router.push(`/tenant/property/${property.id}`)} />

      {pending && (
        <Banner
          tone="warning"
          icon="create-outline"
          title="Your tenancy agreement is ready"
          message={
            pending.id === tenancy.id
              ? 'Please review and sign it to confirm your tenancy.'
              : `Your new agreement for ${pendingProperty?.title ?? 'a new home'} is waiting. Review and sign it to confirm.`
          }
          actionLabel="Review & sign"
          onAction={() => router.push({ pathname: '/tenant/agreement', params: { id: pending.id } })}
        />
      )}

      {next && nextStatus && (
        <Card style={{ gap: Spacing.sm }}>
          <View style={styles.between}>
            <AppText variant="label" color={Colors.textSecondary}>
              Next rent payment
            </AppText>
            <Badge {...installmentMeta[nextStatus]} />
          </View>
          <AppText variant="display">{formatMoney(next.amount)}</AppText>
          <AppText variant="caption">
            Due {formatDate(next.dueDate)} ({relativeDays(next.dueDate)})
          </AppText>
          <Button title="View payments & receipts" variant="secondary" onPress={() => router.push('/tenant/payments')} />
        </Card>
      )}

      <View style={styles.actions}>
        {actions.map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            onPress={() => router.push(a.href)}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.8 }]}>
            <View style={styles.actionIcon}>
              <Ionicons name={a.icon} size={22} color={Colors.primary} />
            </View>
            <AppText variant="label" align="center">
              {a.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <Card>
        <SectionHeader
          title={`Repairs${openRequests.length ? ` (${openRequests.length} open)` : ''}`}
          actionLabel="New"
          onAction={() => router.push('/tenant/maintenance/new')}
        />
        {requests.length === 0 ? (
          <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
            No maintenance requests yet.
          </AppText>
        ) : (
          requests.map((m, i) => (
            <View key={m.id}>
              {i > 0 && <Divider />}
              <ListRow
                icon="construct-outline"
                iconTone={maintenanceMeta[m.status].tone}
                title={m.title}
                subtitle={`Reported ${formatDate(m.createdAt)}`}
                right={<Badge {...maintenanceMeta[m.status]} />}
                onPress={() => router.push(`/tenant/maintenance/${m.id}`)}
              />
            </View>
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title="Tenancy" />
        <InfoRow label="Start" value={formatDate(tenancy.startDate)} />
        <InfoRow label="End" value={formatDate(tenancy.endDate)} />
        <InfoRow label="Time left" value={daysLeft > 0 ? `${daysLeft} days` : 'Ended'} />
        <InfoRow
          label="Paid so far"
          value={formatMoney(installments.filter((i) => i.paidAt).reduce((s, i) => s + i.amount, 0))}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  action: {
    flexGrow: 1,
    flexBasis: 140,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
