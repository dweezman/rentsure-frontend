import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Badge, Button, Card, EmptyState, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import { formatDate } from '@/utils/format';
import { fraudReasonMeta, fraudStatusMeta } from '@/utils/labels';

export default function MyReports() {
  const me = useCurrentUser();
  const { state } = useStore();
  const reports = state.fraudReports.filter((r) => r.reporterId === me.id);

  return (
    <Screen footer={<Button title="Report a new concern" icon="flag-outline" variant="outline" onPress={() => router.push('/tenant/report')} />}>
      {reports.length === 0 ? (
        <EmptyState icon="shield-outline" title="No reports" message="If something about a listing or landlord seems wrong, report it and our team will review it." />
      ) : (
        reports.map((r) => {
          const property = state.properties.find((p) => p.id === r.propertyId);
          return (
            <Card key={r.id} style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="label" color={Colors.textSecondary}>
                  {r.reference}
                </AppText>
                <Badge {...fraudStatusMeta[r.status]} />
              </View>
              <AppText variant="bodyStrong">{fraudReasonMeta[r.reason].label}</AppText>
              {property && <AppText variant="caption">{property.title}</AppText>}
              <AppText variant="caption" numberOfLines={3}>
                {r.description}
              </AppText>
              {r.outcome && (
                <View style={{ backgroundColor: Colors.surfaceAlt, padding: Spacing.md, borderRadius: 10 }}>
                  <AppText variant="caption" color={Colors.text}>
                    Outcome: {r.outcome}
                  </AppText>
                </View>
              )}
              <AppText variant="tiny" color={Colors.textMuted}>
                Submitted {formatDate(r.createdAt)}
              </AppText>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
