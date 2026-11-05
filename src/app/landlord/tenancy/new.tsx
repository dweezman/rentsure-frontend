import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  ChipSelect,
  EmptyState,
  InfoRow,
  Screen,
  SectionHeader,
  TextField,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useProperty, useStore } from '@/store/app-store';
import type { PaymentSchedule } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { addDays, addMonths, formatDate, formatMoney, isValidISODate, scheduleMonths, todayISO } from '@/utils/format';
import { scheduleLabel } from '@/utils/labels';

const SCHEDULE_OPTIONS = (Object.keys(scheduleLabel) as PaymentSchedule[]).map((v) => ({ value: v, label: scheduleLabel[v] }));

const DEFAULT_CLAUSES = [
  'The tenant shall pay rent on or before each due date into the account stated by the landlord.',
  'The tenant shall keep the premises clean and in good condition, fair wear and tear excepted.',
  'The landlord is responsible for structural repairs and repairs not caused by the tenant.',
  'No structural changes or sub-letting without written consent from the landlord.',
  'Either party may end the tenancy with 3 months written notice.',
];

export default function NewTenancy() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const { state, actions } = useStore();
  const app = state.applications.find((a) => a.id === applicationId);
  const property = useProperty(app?.propertyId);

  const defaultStart = app && app.moveInDate > todayISO() ? app.moveInDate : todayISO();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(addDays(addMonths(defaultStart, 12), -1));
  const [annualRent, setAnnualRent] = useState(
    property ? String(property.rentPeriod === 'year' ? property.rent : property.rent * 12) : '',
  );
  const [schedule, setSchedule] = useState<PaymentSchedule>(property?.rentPeriod === 'month' ? 'monthly' : 'annual');
  const [deposit, setDeposit] = useState(property ? String(property.deposit) : '');
  const [clauses, setClauses] = useState<string[]>(DEFAULT_CLAUSES);
  const [newClause, setNewClause] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!app || !property || app.status !== 'approved') {
    return (
      <Screen>
        <EmptyState icon="document-text-outline" title="Approve an applicant first" message="A tenancy can only be created for an approved application." />
      </Screen>
    );
  }

  const rentNum = Number(annualRent) || 0;
  const perPayment = Math.round((rentNum * scheduleMonths[schedule]) / 12);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isValidISODate(startDate)) e.startDate = 'Use YYYY-MM-DD.';
    if (!isValidISODate(endDate)) e.endDate = 'Use YYYY-MM-DD.';
    else if (endDate <= startDate) e.endDate = 'End date must be after the start date.';
    if (!rentNum) e.rent = 'Enter the agreed yearly rent.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (send: boolean) => {
    if (!validate()) return;
    if (send) {
      const ok = await confirm('Send agreement?', `${app.fullName} will be asked to review and sign it.`, 'Send');
      if (!ok) return;
    }
    const id = actions.createTenancy(
      { applicationId: app.id, startDate, endDate, annualRent: rentNum, schedule, deposit: Number(deposit) || 0, clauses },
      send,
    );
    router.replace(`/landlord/tenancy/${id}`);
  };

  return (
    <Screen
      footer={
        <>
          <Button title="Save draft" variant="outline" fullWidth={false} onPress={() => save(false)} />
          <Button title="Send to tenant" icon="send-outline" style={{ flex: 1 }} onPress={() => save(true)} />
        </>
      }>
      <Card>
        <InfoRow label="Tenant" value={app.fullName} />
        <InfoRow label="Property" value={property.title} />
      </Card>

      <SectionHeader title="Term" />
      <View style={{ flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 150 }}>
          <TextField
            label="Start date"
            required
            value={startDate}
            onChangeText={(v) => {
              setStartDate(v);
              if (isValidISODate(v)) setEndDate(addDays(addMonths(v, 12), -1));
            }}
            placeholder="YYYY-MM-DD"
            error={errors.startDate}
            hint={isValidISODate(startDate) ? formatDate(startDate) : undefined}
          />
        </View>
        <View style={{ flex: 1, minWidth: 150 }}>
          <TextField
            label="End date"
            required
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            error={errors.endDate}
            hint={isValidISODate(endDate) ? formatDate(endDate) : undefined}
          />
        </View>
      </View>

      <SectionHeader title="Rent" />
      <TextField label="Agreed rent per year" required money value={annualRent} onChangeText={setAnnualRent} error={errors.rent} />
      <View style={{ gap: 6 }}>
        <AppText variant="label">Payment schedule</AppText>
        <ChipSelect options={SCHEDULE_OPTIONS} value={schedule} onChange={setSchedule} />
        {rentNum > 0 && (
          <AppText variant="caption">
            {12 / scheduleMonths[schedule]} payment{schedule === 'annual' ? '' : 's'} of {formatMoney(perPayment)}
          </AppText>
        )}
      </View>
      <TextField label="Security deposit" money value={deposit} onChangeText={setDeposit} />

      <SectionHeader title="Terms" />
      <Card style={{ gap: Spacing.sm }}>
        {clauses.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
            <AppText variant="label" color={Colors.primary}>
              {i + 1}.
            </AppText>
            <AppText style={{ flex: 1 }}>{c}</AppText>
            <Pressable accessibilityLabel="Remove clause" onPress={() => setClauses((cs) => cs.filter((_, j) => j !== i))} hitSlop={8}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
        ))}
      </Card>
      <TextField label="Add a clause" value={newClause} onChangeText={setNewClause} multiline placeholder="e.g. Pets are allowed with prior consent." />
      <Button
        title="Add clause"
        variant="ghost"
        icon="add"
        size="sm"
        fullWidth={false}
        disabled={!newClause.trim()}
        onPress={() => {
          setClauses((cs) => [...cs, newClause.trim()]);
          setNewClause('');
        }}
      />
    </Screen>
  );
}
