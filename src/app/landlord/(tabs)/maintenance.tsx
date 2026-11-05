import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Badge, Card, EmptyState, Screen, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';
import { useLandlordData } from '@/store/landlord';
import type { MaintenanceUrgency } from '@/types/models';
import { formatDate } from '@/utils/format';
import { maintenanceMeta, urgencyMeta } from '@/utils/labels';

const URGENCY_ORDER: Record<MaintenanceUrgency, number> = { emergency: 0, high: 1, medium: 2, low: 3 };

export default function LandlordMaintenance() {
  const { state } = useStore();
  const { maintenance } = useLandlordData();
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  const list = maintenance
    .filter((m) => (tab === 'open' ? !['resolved', 'rejected'].includes(m.status) : ['resolved', 'rejected'].includes(m.status)))
    .sort((a, b) => (tab === 'open' ? URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] : 0));

  return (
    <Screen>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title={tab === 'open' ? 'No open requests' : 'Nothing closed yet'}
          message="Repair requests from your tenants appear here."
        />
      ) : (
        list.map((m) => {
          const property = state.properties.find((p) => p.id === m.propertyId);
          const tenant = state.users.find((u) => u.id === m.tenantId);
          return (
            <Card key={m.id} onPress={() => router.push(`/landlord/maintenance/${m.id}`)} style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Badge {...maintenanceMeta[m.status]} />
                <Badge label={urgencyMeta[m.urgency].label} tone={urgencyMeta[m.urgency].tone} icon="alert-circle-outline" />
              </View>
              <AppText variant="bodyStrong">{m.title}</AppText>
              <AppText variant="caption" numberOfLines={2}>
                {m.description}
              </AppText>
              <AppText variant="tiny">
                {property?.title} · {tenant?.fullName} · {formatDate(m.createdAt)}
              </AppText>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
