import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  DocumentList,
  EmptyState,
  InfoRow,
  Screen,
  SectionHeader,
  TextField,
  Timeline,
  VerificationBadge,
} from '@/components/ui';
import { Colors, Radius, Spacing, ToneColors, type Tone } from '@/constants/theme';
import { useProperty, useStore, useUser } from '@/store/app-store';
import type { ApplicationStatus } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';
import { applicationMeta, employmentLabel } from '@/utils/labels';

type Decision = 'approved' | 'waitlisted' | 'rejected' | 'info_requested';

const DECISIONS: { value: Decision; label: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone; noteLabel: string; noteRequired: boolean }[] = [
  { value: 'approved', label: 'Approve', icon: 'checkmark-circle-outline', tone: 'success', noteLabel: 'Message to applicant (optional)', noteRequired: false },
  { value: 'info_requested', label: 'Ask for info', icon: 'chatbubble-ellipses-outline', tone: 'info', noteLabel: 'What do you need from them?', noteRequired: true },
  { value: 'waitlisted', label: 'Waitlist', icon: 'hourglass-outline', tone: 'primary', noteLabel: 'Note (optional)', noteRequired: false },
  { value: 'rejected', label: 'Reject', icon: 'close-circle-outline', tone: 'danger', noteLabel: 'Reason (shared with the applicant)', noteRequired: true },
];

const OPEN: ApplicationStatus[] = ['submitted', 'under_review', 'info_requested', 'waitlisted'];

export default function ReviewApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const app = state.applications.find((a) => a.id === id);
  const property = useProperty(app?.propertyId);
  const applicant = useUser(app?.tenantId);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  if (!app || !property) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Application not found" />
      </Screen>
    );
  }

  const tenancy = state.tenancies.find((t) => t.applicationId === app.id);
  const otherOpen = state.applications.filter(
    (a) => a.propertyId === property.id && a.id !== app.id && ['submitted', 'under_review', 'info_requested'].includes(a.status),
  );
  const alreadyApproved = state.applications.find(
    (a) => a.propertyId === property.id && a.id !== app.id && a.status === 'approved',
  );
  const canDecide = OPEN.includes(app.status);
  const chosen = DECISIONS.find((d) => d.value === decision);
  const monthlyRent = property.rentPeriod === 'year' ? property.rent / 12 : property.rent;

  const applyDecision = async () => {
    if (!chosen) return;
    if (chosen.noteRequired && note.trim().length < 5) {
      setNoteError('Please add a short explanation.');
      return;
    }
    const ok = await confirm(
      `${chosen.label} ${app.fullName}?`,
      chosen.value === 'approved'
        ? 'They will be notified and you can then send a tenancy agreement.'
        : 'The applicant will be notified of this decision.',
      chosen.label,
      chosen.value === 'rejected',
    );
    if (!ok) return;
    actions.setApplicationStatus(app.id, chosen.value, note.trim() || undefined);

    if (chosen.value === 'approved' && otherOpen.length > 0) {
      const waitlist = await confirm(
        'What about the other applicants?',
        `${otherOpen.length} other applicant${otherOpen.length > 1 ? 's are' : ' is'} still waiting. Move them to the waiting list so they know where they stand?`,
        'Waitlist them',
      );
      if (waitlist) {
        otherOpen.forEach((o) =>
          actions.setApplicationStatus(o.id, 'waitlisted', 'The landlord has approved another applicant. You are on the waiting list.'),
        );
      }
    }
    setDecision(null);
    setNote('');
  };

  return (
    <Screen
      footer={
        app.status === 'approved' && !tenancy ? (
          <Button
            title="Create tenancy agreement"
            icon="document-text-outline"
            onPress={() => router.push({ pathname: '/landlord/tenancy/new', params: { applicationId: app.id } })}
          />
        ) : app.status === 'approved' && tenancy ? (
          <Button title="View tenancy" variant="secondary" onPress={() => router.push(`/landlord/tenancy/${tenancy.id}`)} />
        ) : chosen ? (
          <>
            <Button title="Cancel" variant="outline" fullWidth={false} onPress={() => setDecision(null)} />
            <Button title={`Confirm: ${chosen.label}`} variant={chosen.value === 'rejected' ? 'danger' : 'primary'} style={{ flex: 1 }} onPress={applyDecision} />
          </>
        ) : app.status === 'submitted' ? (
          <Button title="Start review" icon="eye-outline" variant="secondary" onPress={() => actions.setApplicationStatus(app.id, 'under_review')} />
        ) : undefined
      }>
      <Card style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
          <Avatar name={app.fullName} size={56} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="heading">{app.fullName}</AppText>
            <VerificationBadge status={applicant?.verificationStatus ?? 'not_submitted'} subject="identity" />
          </View>
          <Badge {...applicationMeta[app.status]} />
        </View>
        <AppText variant="caption">
          For {property.title} · applied {formatDate(app.createdAt)}
        </AppText>
      </Card>

      {alreadyApproved && canDecide && (
        <Banner tone="warning" icon="alert-circle-outline" title={`You already approved ${alreadyApproved.fullName}`} message="Approving another applicant for the same property may cause a conflict." />
      )}

      {app.infoResponse && (
        <Banner tone="info" icon="chatbubble-outline" title="Applicant replied" message={app.infoResponse} />
      )}

      <Card>
        <SectionHeader title="Applicant" />
        <InfoRow label="Phone" value={app.phone} />
        <InfoRow label="Email" value={app.email} />
        <InfoRow label="Employment" value={employmentLabel[app.employmentStatus]} />
        {app.employer && <InfoRow label="Employer" value={app.employer} />}
        {app.jobTitle && <InfoRow label="Job title" value={app.jobTitle} />}
        {app.monthlyIncome !== undefined && (
          <InfoRow
            label="Monthly income"
            value={`${formatMoney(app.monthlyIncome)} (rent is ${Math.round((monthlyRent / app.monthlyIncome) * 100)}%)`}
          />
        )}
        <InfoRow label="Move-in" value={formatDate(app.moveInDate)} />
        <InfoRow label="Occupants" value={String(app.occupants)} />
      </Card>

      {app.message && (
        <Card style={{ gap: Spacing.sm }}>
          <SectionHeader title="Message" />
          <AppText>“{app.message}”</AppText>
        </Card>
      )}

      <Card>
        <DocumentList label="Documents" value={app.documents} readOnly />
      </Card>

      {canDecide && (
        <Card style={{ gap: Spacing.md }}>
          <SectionHeader title="Your decision" />
          <View style={styles.decisions}>
            {DECISIONS.map((d) => {
              const selected = decision === d.value;
              const c = ToneColors[d.tone];
              return (
                <Pressable
                  key={d.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setDecision(d.value);
                    setNoteError(null);
                  }}
                  style={[styles.decision, selected && { borderColor: c.fg, backgroundColor: c.bg }]}>
                  <Ionicons name={d.icon} size={22} color={c.fg} />
                  <AppText variant="label" color={selected ? c.fg : Colors.text}>
                    {d.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {chosen && (
            <TextField
              label={chosen.noteLabel}
              required={chosen.noteRequired}
              value={note}
              onChangeText={(t) => {
                setNote(t);
                setNoteError(null);
              }}
              multiline
              error={noteError}
            />
          )}
        </Card>
      )}

      <Card style={{ gap: Spacing.md }}>
        <SectionHeader title="Decision record" />
        <Timeline
          items={app.history.map((h) => ({
            title: applicationMeta[h.status].label,
            subtitle: `${formatDateTime(h.at)} · by ${h.by === 'landlord' ? 'you' : 'applicant'}`,
            note: h.note,
            tone: applicationMeta[h.status].tone,
          }))}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  decisions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  decision: {
    flexGrow: 1,
    flexBasis: 120,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
