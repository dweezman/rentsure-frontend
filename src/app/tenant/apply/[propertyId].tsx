import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  ChipSelect,
  DocumentList,
  EmptyState,
  Screen,
  SectionHeader,
  Stepper,
  TextField,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useProperty, useStore } from '@/store/app-store';
import type { AttachedFile, EmploymentStatus } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { addDays, addMonths, formatDate, isEmail, isPhone, isValidISODate, todayISO } from '@/utils/format';
import { employmentLabel } from '@/utils/labels';

const EMPLOYMENT_OPTIONS = (Object.keys(employmentLabel) as EmploymentStatus[]).map((v) => ({
  value: v,
  label: employmentLabel[v],
}));

export default function Apply() {
  const { propertyId, draftId } = useLocalSearchParams<{ propertyId: string; draftId?: string }>();
  const property = useProperty(propertyId);
  const me = useCurrentUser();
  const { state, actions } = useStore();
  const draft = state.applications.find((a) => a.id === draftId);

  const [fullName, setFullName] = useState(draft?.fullName ?? me.fullName);
  const [email, setEmail] = useState(draft?.email ?? me.email);
  const [phone, setPhone] = useState(draft?.phone ?? me.phone);
  const [employment, setEmployment] = useState<EmploymentStatus | null>(draft?.employmentStatus ?? null);
  const [employer, setEmployer] = useState(draft?.employer ?? '');
  const [jobTitle, setJobTitle] = useState(draft?.jobTitle ?? me.occupation ?? '');
  const [income, setIncome] = useState(draft?.monthlyIncome ? String(draft.monthlyIncome) : '');
  const [moveIn, setMoveIn] = useState(draft?.moveInDate ?? addMonths(todayISO(), 1));
  const [occupants, setOccupants] = useState(draft?.occupants ?? 1);
  const [message, setMessage] = useState(draft?.message ?? '');
  const [documents, setDocuments] = useState<AttachedFile[]>(draft?.documents ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!property) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Property not found" />
      </Screen>
    );
  }

  const working = employment === 'employed' || employment === 'self_employed';

  const buildInput = () => ({
    propertyId: property.id,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    employmentStatus: employment ?? 'employed',
    employer: working ? employer.trim() || undefined : undefined,
    jobTitle: working ? jobTitle.trim() || undefined : undefined,
    monthlyIncome: income ? Number(income) : undefined,
    moveInDate: moveIn,
    occupants,
    message: message.trim() || undefined,
    documents,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Enter your full name.';
    if (!isEmail(email)) e.email = 'Enter a valid email.';
    if (!isPhone(phone)) e.phone = 'Enter a valid phone number.';
    if (!employment) e.employment = 'Choose your employment status.';
    if (working && !employer.trim()) e.employer = 'Enter your employer or business name.';
    if (!isValidISODate(moveIn)) e.moveIn = 'Use the format YYYY-MM-DD.';
    else if (moveIn < todayISO()) e.moveIn = 'Move-in date must be in the future.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveDraft = () => {
    actions.saveApplication(buildInput(), false, draft?.id);
    router.back();
  };

  const submit = async () => {
    if (!validate()) return;
    const ok = await confirm(
      'Submit application?',
      `Your details will be sent to the landlord of ${property.title}. You can withdraw at any time before a decision.`,
      'Submit',
    );
    if (!ok) return;
    const id = actions.saveApplication(buildInput(), true, draft?.id);
    router.dismissTo('/tenant/applications');
    router.push(`/tenant/application/${id}`);
  };

  const quickDates = [
    { label: 'In 2 weeks', value: addDays(todayISO(), 14) },
    { label: 'In 1 month', value: addMonths(todayISO(), 1) },
    { label: 'In 2 months', value: addMonths(todayISO(), 2) },
  ];

  return (
    <Screen
      footer={
        <>
          <Button title="Save draft" variant="outline" fullWidth={false} onPress={saveDraft} />
          <Button title="Submit application" style={{ flex: 1 }} onPress={submit} />
        </>
      }>
      <View style={{ gap: 2 }}>
        <AppText variant="caption">Applying for</AppText>
        <AppText variant="heading">{property.title}</AppText>
      </View>

      {me.verificationStatus !== 'verified' && (
        <Banner
          tone="info"
          icon="id-card-outline"
          title="Verify your identity to stand out"
          message="Landlords are more likely to approve applicants with a verified ID."
          actionLabel="Verify now"
          onAction={() => router.push('/tenant/verify-identity')}
        />
      )}

      <Card style={{ gap: Spacing.sm }}>
        <SectionHeader title="The landlord asks for" />
        {property.requirements.map((r) => (
          <AppText key={r} variant="caption">
            • {r}
          </AppText>
        ))}
      </Card>

      <SectionHeader title="Your details" />
      <TextField label="Full name" required value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <TextField label="Email" required value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <TextField label="Phone" required value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />

      <SectionHeader title="Work & income" />
      <View style={{ gap: 6 }}>
        <ChipSelect options={EMPLOYMENT_OPTIONS} value={employment} onChange={setEmployment} />
        {errors.employment && <AppText variant="caption" color={Colors.danger}>{errors.employment}</AppText>}
      </View>
      {working && (
        <>
          <TextField label="Employer / business" required value={employer} onChangeText={setEmployer} error={errors.employer} />
          <TextField label="Job title" value={jobTitle} onChangeText={setJobTitle} />
        </>
      )}
      <TextField
        label="Monthly income (optional)"
        money
        value={income}
        onChangeText={setIncome}
        placeholder="e.g. 450000"
        hint="Only shared with this landlord."
      />

      <SectionHeader title="Move-in" />
      <TextField
        label="Move-in date"
        required
        value={moveIn}
        onChangeText={setMoveIn}
        placeholder="YYYY-MM-DD"
        error={errors.moveIn}
        hint={isValidISODate(moveIn) ? formatDate(moveIn) : undefined}
      />
      <ChipRow>
        {quickDates.map((d) => (
          <Chip key={d.label} label={d.label} selected={moveIn === d.value} onPress={() => setMoveIn(d.value)} />
        ))}
      </ChipRow>
      <Stepper label="Number of people moving in" value={occupants} onChange={setOccupants} max={12} />

      <TextField
        label="Message to the landlord (optional)"
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="Tell the landlord a little about yourself."
      />

      <DocumentList
        label="Supporting documents"
        value={documents}
        onChange={setDocuments}
        hint="For example an employment letter, payslips or a bank statement. PDF or image."
      />
    </Screen>
  );
}
