import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Divider, EmptyState, InfoRow, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';
import { paymentMethodLabel } from '@/utils/labels';

export default function Receipt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const inst = state.installments.find((i) => i.id === id);
  const tenancy = state.tenancies.find((t) => t.id === inst?.tenancyId);
  const property = state.properties.find((p) => p.id === tenancy?.propertyId);
  const tenant = state.users.find((u) => u.id === tenancy?.tenantId);
  const landlord = state.users.find((u) => u.id === tenancy?.landlordId);

  if (!inst?.paidAt || !tenancy || !property || !tenant || !landlord) {
    return (
      <Screen>
        <EmptyState icon="receipt-outline" title="Receipt not available" message="Receipts are created once a payment is recorded." />
      </Screen>
    );
  }

  const text = [
    `RentSure rent receipt ${inst.receiptNo}`,
    `Amount: ${formatMoney(inst.amount)}`,
    `Paid: ${formatDateTime(inst.paidAt)}`,
    `For rent due: ${formatDate(inst.dueDate)}`,
    `Property: ${property.title}, ${property.address}, ${property.city}`,
    `Tenant: ${tenant.fullName}`,
    `Landlord: ${landlord.fullName}`,
    inst.reference ? `Reference: ${inst.reference}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <Screen footer={<Button title="Share / save receipt" icon="share-outline" onPress={() => Share.share({ message: text, title: `Receipt ${inst.receiptNo}` })} />}>
      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.head}>
          <View style={styles.tick}>
            <Ionicons name="checkmark" size={28} color={Colors.textInverse} />
          </View>
          <AppText variant="caption">Payment received</AppText>
          <AppText variant="display">{formatMoney(inst.amount)}</AppText>
          <AppText variant="label" color={Colors.textSecondary}>
            Receipt {inst.receiptNo}
          </AppText>
        </View>
        <Divider />
        <InfoRow label="Paid on" value={formatDateTime(inst.paidAt)} />
        <InfoRow label="Rent due" value={formatDate(inst.dueDate)} />
        <InfoRow label="Method" value={inst.method ? paymentMethodLabel[inst.method] : '—'} />
        {inst.reference && <InfoRow label="Reference" value={inst.reference} />}
        <Divider />
        <InfoRow label="Property" value={property.title} />
        <InfoRow label="Address" value={`${property.address}, ${property.city}`} />
        <InfoRow label="Tenant" value={tenant.fullName} />
        <InfoRow label="Landlord" value={landlord.fullName} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: 4, paddingVertical: Spacing.md },
  tick: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
