import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  Divider,
  EmptyState,
  InfoRow,
  Screen,
  SectionHeader,
  TextField,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveTenancy, useCurrentUser, useProperty, useStore, useUser } from '@/store/app-store';
import { confirm } from '@/utils/dialog';
import { formatDate, formatDateTime, formatMoney, scheduleMonths } from '@/utils/format';
import { agreementMeta, scheduleLabel } from '@/utils/labels';

export default function Agreement() {
  const me = useCurrentUser();
  const tenancy = useActiveTenancy();
  const property = useProperty(tenancy?.propertyId);
  const landlord = useUser(tenancy?.landlordId);
  const { actions } = useStore();
  const [signature, setSignature] = useState('');
  const [agree, setAgree] = useState(false);

  if (!tenancy || !property || !landlord) {
    return (
      <Screen>
        <EmptyState icon="document-text-outline" title="No agreement yet" message="Your landlord hasn't sent a tenancy agreement." />
      </Screen>
    );
  }

  const needsSignature = tenancy.agreementStatus === 'sent';
  const signatureMatches = signature.trim().toLowerCase() === me.fullName.toLowerCase();
  const perInstalment = Math.round((tenancy.annualRent * scheduleMonths[tenancy.schedule]) / 12);

  const sign = async () => {
    const ok = await confirm(
      'Sign agreement?',
      'Typing your name counts as your signature. This confirms you agree to the terms of the tenancy.',
      'Sign',
    );
    if (ok) actions.signAgreement(tenancy.id, signature.trim());
  };

  return (
    <Screen
      footer={
        needsSignature ? (
          <Button title="Sign agreement" icon="create-outline" onPress={sign} disabled={!agree || !signatureMatches} />
        ) : undefined
      }>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="title">Tenancy agreement</AppText>
        <Badge {...agreementMeta[tenancy.agreementStatus]} />
      </View>

      {tenancy.agreementStatus === 'signed' && (
        <Banner
          tone="success"
          icon="checkmark-circle"
          title="Signed"
          message={`Signed by ${tenancy.tenantSignature} on ${formatDateTime(tenancy.signedAt!)}.`}
        />
      )}

      <Card>
        <SectionHeader title="Parties" />
        <InfoRow label="Landlord" value={landlord.fullName} />
        <InfoRow label="Tenant" value={me.fullName} />
        <InfoRow label="Property" value={`${property.address}, ${property.area}, ${property.city}`} />
      </Card>

      <Card>
        <SectionHeader title="Term & rent" />
        <InfoRow label="Start date" value={formatDate(tenancy.startDate)} />
        <InfoRow label="End date" value={formatDate(tenancy.endDate)} />
        <Divider />
        <InfoRow label="Rent per year" value={formatMoney(tenancy.annualRent)} strong />
        <InfoRow label="Payment schedule" value={scheduleLabel[tenancy.schedule]} />
        <InfoRow label="Each payment" value={formatMoney(perInstalment)} />
        <InfoRow label="Security deposit" value={formatMoney(tenancy.deposit)} />
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <SectionHeader title="Terms" />
        {tenancy.clauses.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <AppText variant="label" color={Colors.primary}>
              {i + 1}.
            </AppText>
            <AppText style={{ flex: 1 }}>{c}</AppText>
          </View>
        ))}
      </Card>

      {needsSignature && (
        <Card style={{ gap: Spacing.md }}>
          <SectionHeader title="Sign" />
          <TextField
            label="Type your full name to sign"
            value={signature}
            onChangeText={setSignature}
            placeholder={me.fullName}
            error={signature && !signatureMatches ? `Type your name exactly as on your account: ${me.fullName}` : null}
            style={{ fontStyle: 'italic', fontSize: 18 }}
          />
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label="I have read this agreement and agree to its terms."
          />
        </Card>
      )}
    </Screen>
  );
}
