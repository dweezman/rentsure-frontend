import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  DocumentList,
  EmptyState,
  InfoRow,
  ProgressSteps,
  Screen,
  SectionHeader,
  TextField,
  Timeline,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useProperty, useStore } from '@/store/app-store';
import type { ApplicationStatus, AttachedFile } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';
import { applicationMeta, employmentLabel } from '@/utils/labels';

const STEPS = ['Submitted', 'Under review', 'Decision'];
const stepIndex = (s: ApplicationStatus) =>
  s === 'submitted' ? 0 : s === 'under_review' || s === 'info_requested' ? 1 : s === 'draft' ? -1 : 2;

export default function TenantApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const app = state.applications.find((a) => a.id === id);
  const property = useProperty(app?.propertyId);
  const [reply, setReply] = useState('');
  const [replyDocs, setReplyDocs] = useState<AttachedFile[]>([]);

  if (!app || !property) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Application not found" />
      </Screen>
    );
  }

  const canWithdraw = ['submitted', 'under_review', 'info_requested', 'waitlisted'].includes(app.status);
  const tenancy = state.tenancies.find((t) => t.applicationId === app.id);

  const withdraw = async () => {
    const ok = await confirm('Withdraw application?', 'The landlord will no longer consider you for this property.', 'Withdraw', true);
    if (ok) actions.withdrawApplication(app.id);
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    actions.respondToInfoRequest(app.id, reply.trim(), replyDocs);
    setReply('');
    setReplyDocs([]);
  };

  return (
    <Screen footer={canWithdraw ? <Button title="Withdraw application" variant="danger" onPress={withdraw} /> : undefined}>
      <Card onPress={() => router.push(`/tenant/property/${property.id}`)} style={{ gap: 4 }}>
        <AppText variant="caption">Property</AppText>
        <AppText variant="heading">{property.title}</AppText>
        <AppText variant="caption">
          {property.area}, {property.city} · {formatMoney(property.rent)}/{property.rentPeriod}
        </AppText>
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="heading">Status</AppText>
          <Badge {...applicationMeta[app.status]} />
        </View>
        {stepIndex(app.status) >= 0 && <ProgressSteps steps={STEPS} current={stepIndex(app.status)} />}
      </Card>

      {app.status === 'info_requested' && (
        <Card style={{ gap: Spacing.md }}>
          <Banner tone="info" icon="chatbubble-ellipses-outline" title="The landlord needs more information" message={app.infoRequest} />
          <TextField label="Your reply" value={reply} onChangeText={setReply} multiline placeholder="Write your answer…" />
          <DocumentList value={replyDocs} onChange={setReplyDocs} />
          <Button title="Send reply" onPress={sendReply} disabled={!reply.trim()} />
        </Card>
      )}

      {app.status === 'approved' && (
        <Banner
          tone="success"
          icon="checkmark-circle"
          title="Approved! 🎉"
          message={
            tenancy
              ? 'Your landlord has prepared your tenancy agreement.'
              : 'Your landlord will send you a tenancy agreement to review and sign.'
          }
          actionLabel={tenancy ? 'Go to My Home' : undefined}
          onAction={() => router.navigate('/tenant/home')}
        />
      )}
      {app.status === 'waitlisted' && (
        <Banner tone="primary" icon="hourglass-outline" title="You're on the waiting list" message="If the property becomes available again, the landlord may contact you." />
      )}
      {app.status === 'rejected' && (
        <Banner tone="danger" icon="close-circle-outline" title="Not successful this time" message={app.decisionReason ?? 'The landlord chose another applicant.'} />
      )}

      <Card>
        <SectionHeader title="What you sent" />
        <InfoRow label="Name" value={app.fullName} />
        <InfoRow label="Phone" value={app.phone} />
        <InfoRow label="Email" value={app.email} />
        <InfoRow label="Employment" value={employmentLabel[app.employmentStatus]} />
        {app.employer && <InfoRow label="Employer" value={app.employer} />}
        {app.monthlyIncome !== undefined && <InfoRow label="Monthly income" value={formatMoney(app.monthlyIncome)} />}
        <InfoRow label="Move-in" value={formatDate(app.moveInDate)} />
        <InfoRow label="Occupants" value={String(app.occupants)} />
        {app.message && <InfoRow label="Message" value={app.message} />}
      </Card>

      <Card>
        <DocumentList label="Documents" value={app.documents} readOnly />
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <SectionHeader title="History" />
        <Timeline
          items={app.history.map((h) => ({
            title: applicationMeta[h.status].label,
            subtitle: `${formatDateTime(h.at)} · by ${h.by === 'tenant' ? 'you' : 'landlord'}`,
            note: h.note,
            tone: applicationMeta[h.status].tone,
          }))}
        />
      </Card>
    </Screen>
  );
}
