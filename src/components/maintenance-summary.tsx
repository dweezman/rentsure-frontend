import { Image } from 'expo-image';
import { photoSource } from '@/utils/photos';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, InfoRow, SectionHeader, Timeline } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import type { MaintenanceRequest, Role } from '@/types/models';
import { formatDate, formatDateTime } from '@/utils/format';
import { maintenanceCategoryLabel, maintenanceMeta, urgencyMeta } from '@/utils/labels';

/** Request details + photos + history. Shared by tenant and landlord screens. */
export function MaintenanceSummary({ request, viewer }: { request: MaintenanceRequest; viewer: Role }) {
  const who = (by: Role) => (by === viewer ? 'you' : by);
  return (
    <>
      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.badges}>
          <Badge {...maintenanceMeta[request.status]} />
          <Badge label={`${urgencyMeta[request.urgency].label} urgency`} tone={urgencyMeta[request.urgency].tone} />
        </View>
        <AppText variant="title">{request.title}</AppText>
        <AppText variant="caption">
          {maintenanceCategoryLabel[request.category]} · reported {formatDate(request.createdAt)}
        </AppText>
        <AppText>{request.description}</AppText>
        {request.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
            {request.photos.map((uri, i) => (
              <Image key={uri + i} source={photoSource(uri)} style={styles.photo} contentFit="cover" accessibilityLabel={`Photo ${i + 1}`} />
            ))}
          </ScrollView>
        )}
      </Card>

      {request.assignee && (
        <Card>
          <SectionHeader title="Repair assigned" />
          <InfoRow label="Who" value={request.assignee.name} />
          <InfoRow label="Phone" value={request.assignee.phone} />
          {request.assignee.scheduledFor && <InfoRow label="Visit date" value={formatDate(request.assignee.scheduledFor)} />}
        </Card>
      )}

      <Card style={{ gap: Spacing.md }}>
        <SectionHeader title="Progress" />
        <Timeline
          items={request.updates.map((u) => ({
            title: maintenanceMeta[u.status].label,
            subtitle: `${formatDateTime(u.at)} · by ${who(u.by)}`,
            note: u.note,
            tone: maintenanceMeta[u.status].tone,
          }))}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  photo: { width: 140, height: 105, borderRadius: Radius.md },
});
