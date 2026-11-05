import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  ChipSelect,
  Divider,
  EmptyState,
  InfoRow,
  ListRow,
  Screen,
  SectionHeader,
  StatCard,
  TextField,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { installmentStatus, rentTotals, useProperty, useStore, useTenancyInstallments, useUser } from '@/store/app-store';
import type { Installment, PaymentMethod } from '@/types/models';
import { formatDate, formatDateTime, formatMoney, isValidISODate, todayISO } from '@/utils/format';
import { agreementMeta, installmentMeta, paymentMethodLabel, scheduleLabel } from '@/utils/labels';

const METHOD_OPTIONS = (Object.keys(paymentMethodLabel) as PaymentMethod[]).map((v) => ({ value: v, label: paymentMethodLabel[v] }));

export default function LandlordTenancy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const tenancy = state.tenancies.find((t) => t.id === id);
  const property = useProperty(tenancy?.propertyId);
  const tenant = useUser(tenancy?.tenantId);
  const installments = useTenancyInstallments(tenancy?.id);
  const [recording, setRecording] = useState<Installment | null>(null);

  if (!tenancy || !property || !tenant) {
    return (
      <Screen>
        <EmptyState icon="key-outline" title="Tenancy not found" />
      </Screen>
    );
  }

  const totals = rentTotals(installments);

  return (
    <Screen
      footer={
        tenancy.agreementStatus === 'draft' ? (
          <Button title="Send agreement to tenant" icon="send-outline" onPress={() => actions.sendAgreement(tenancy.id)} />
        ) : undefined
      }>
      <Card style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
          <Avatar name={tenant.fullName} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading">{tenant.fullName}</AppText>
            <AppText variant="caption">{property.title}</AppText>
          </View>
        </View>
        <InfoRow label="Phone" value={tenant.phone} />
        <InfoRow label="Email" value={tenant.email} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
          <AppText variant="heading">Agreement</AppText>
          <Badge {...agreementMeta[tenancy.agreementStatus]} />
        </View>
        <InfoRow label="Term" value={`${formatDate(tenancy.startDate)} – ${formatDate(tenancy.endDate)}`} />
        <InfoRow label="Rent per year" value={formatMoney(tenancy.annualRent)} />
        <InfoRow label="Schedule" value={scheduleLabel[tenancy.schedule]} />
        <InfoRow label="Deposit" value={formatMoney(tenancy.deposit)} />
        {tenancy.sentAt && <InfoRow label="Sent" value={formatDateTime(tenancy.sentAt)} />}
        {tenancy.signedAt && <InfoRow label="Signed" value={`${formatDateTime(tenancy.signedAt)} by ${tenancy.tenantSignature}`} />}
      </Card>

      {tenancy.agreementStatus === 'sent' && (
        <Banner tone="warning" icon="time-outline" title="Waiting for the tenant to sign" message="We'll notify you as soon as they do." />
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <StatCard icon="checkmark-done-outline" tone="success" label="Received" value={formatMoney(totals.received)} />
        <StatCard icon="alert-circle-outline" tone={totals.overdue ? 'danger' : 'warning'} label="Due / overdue" value={formatMoney(totals.outstanding)} />
      </View>

      {recording && (
        <RecordPayment
          installment={recording}
          onCancel={() => setRecording(null)}
          onSave={(input) => {
            actions.recordPayment(recording.id, input);
            setRecording(null);
          }}
        />
      )}

      <Card>
        <SectionHeader title="Rent schedule" />
        {installments.map((i, idx) => {
          const st = installmentStatus(i);
          return (
            <View key={i.id}>
              {idx > 0 && <Divider />}
              <ListRow
                icon={st === 'paid' ? 'checkmark-circle-outline' : 'calendar-outline'}
                iconTone={installmentMeta[st].tone}
                title={formatMoney(i.amount)}
                subtitle={
                  st === 'paid'
                    ? `Paid ${formatDate(i.paidAt!)} · ${i.receiptNo}`
                    : `Due ${formatDate(i.dueDate)}`
                }
                right={
                  st === 'paid' ? (
                    <Badge {...installmentMeta[st]} />
                  ) : (
                    <Button title="Record" size="sm" variant="secondary" fullWidth={false} onPress={() => setRecording(i)} />
                  )
                }
              />
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

function RecordPayment({
  installment,
  onCancel,
  onSave,
}: {
  installment: Installment;
  onCancel: () => void;
  onSave: (input: { paidAt: string; method: PaymentMethod; reference?: string }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const valid = isValidISODate(date) && date <= todayISO();

  return (
    <Card style={{ gap: Spacing.md }}>
      <SectionHeader title={`Record ${formatMoney(installment.amount)}`} />
      <AppText variant="caption">For rent due {formatDate(installment.dueDate)}. A receipt will be sent to the tenant.</AppText>
      <TextField label="Date received" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" error={valid ? null : 'Enter a date in the past, as YYYY-MM-DD.'} />
      <ChipSelect options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      <TextField label="Reference (optional)" value={reference} onChangeText={setReference} placeholder="Bank transfer reference" />
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button title="Cancel" variant="outline" fullWidth={false} onPress={onCancel} />
        <Button
          title="Save payment"
          style={{ flex: 1 }}
          disabled={!valid}
          onPress={() => onSave({ paidAt: `${date}T12:00:00`, method, reference: reference.trim() || undefined })}
        />
      </View>
    </Card>
  );
}
