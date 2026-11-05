import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PropertyCard } from '@/components/property/property-card';
import { AppText, Badge, EmptyState, Screen, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import type { ApplicationStatus } from '@/types/models';
import { formatDate } from '@/utils/format';
import { applicationMeta } from '@/utils/labels';

const CLOSED: ApplicationStatus[] = ['rejected', 'withdrawn'];

export default function MyApplications() {
  const me = useCurrentUser();
  const { state } = useStore();
  const [tab, setTab] = useState<'active' | 'closed'>('active');

  const mine = state.applications
    .filter((a) => a.tenantId === me.id)
    .filter((a) => (tab === 'closed' ? CLOSED.includes(a.status) : !CLOSED.includes(a.status)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <Screen>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'closed', label: 'Closed' },
        ]}
      />
      {mine.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title={tab === 'active' ? 'No applications yet' : 'Nothing here'}
          message={tab === 'active' ? 'When you apply for a property, you can follow its progress here.' : 'Rejected and withdrawn applications appear here.'}
          actionLabel={tab === 'active' ? 'Browse properties' : undefined}
          onAction={() => router.navigate('/tenant')}
        />
      ) : (
        mine.map((a) => {
          const p = state.properties.find((x) => x.id === a.propertyId);
          if (!p) return null;
          const open = () =>
            a.status === 'draft'
              ? router.push({ pathname: '/tenant/apply/[propertyId]', params: { propertyId: p.id, draftId: a.id } })
              : router.push(`/tenant/application/${a.id}`);
          return (
            <PropertyCard
              key={a.id}
              compact
              property={p}
              onPress={open}
              footer={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' }}>
                  <Badge {...applicationMeta[a.status]} />
                  <AppText variant="tiny">Updated {formatDate(a.updatedAt)}</AppText>
                </View>
              }
            />
          );
        })
      )}
    </Screen>
  );
}
