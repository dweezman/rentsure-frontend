import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card, ChipSelect, EmptyState, Screen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useLandlordData } from '@/store/landlord';
import type { ApplicationStatus } from '@/types/models';
import { formatDate, formatMoney } from '@/utils/format';
import { applicationMeta, employmentLabel } from '@/utils/labels';

type Filter = 'to_review' | 'decided' | 'all';

const TO_REVIEW: ApplicationStatus[] = ['submitted', 'under_review', 'info_requested'];

export default function LandlordApplications() {
  const { properties, applications } = useLandlordData();
  const [filter, setFilter] = useState<Filter>('to_review');

  const visible = applications.filter((a) =>
    filter === 'all' ? true : filter === 'to_review' ? TO_REVIEW.includes(a.status) : !TO_REVIEW.includes(a.status),
  );
  const groups = properties
    .map((p) => ({ property: p, apps: visible.filter((a) => a.propertyId === p.id) }))
    .filter((g) => g.apps.length > 0);

  return (
    <Screen>
      <ChipSelect
        scroll
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'to_review', label: 'To review' },
          { value: 'decided', label: 'Decided' },
          { value: 'all', label: 'All' },
        ]}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={filter === 'to_review' ? "You're all caught up" : 'No applications'}
          message="New applications for your properties will appear here."
        />
      ) : (
        groups.map(({ property, apps }) => (
          <View key={property.id} style={{ gap: Spacing.sm }}>
            <SectionHeader
              title={property.title}
              actionLabel={apps.length > 1 ? `Compare ${apps.length}` : undefined}
              onAction={() => router.push(`/landlord/compare/${property.id}`)}
            />
            {apps.map((a) => (
              <Card key={a.id} onPress={() => router.push(`/landlord/application/${a.id}`)} style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
                  <Avatar name={a.fullName} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyStrong">{a.fullName}</AppText>
                    <AppText variant="caption" numberOfLines={1}>
                      {employmentLabel[a.employmentStatus]}
                      {a.monthlyIncome ? ` · ${formatMoney(a.monthlyIncome)}/mo` : ''} · {a.occupants}{' '}
                      {a.occupants > 1 ? 'people' : 'person'}
                    </AppText>
                  </View>
                  <Badge {...applicationMeta[a.status]} />
                </View>
                <AppText variant="tiny">
                  Applied {formatDate(a.createdAt)} · wants to move in {formatDate(a.moveInDate)}
                </AppText>
              </Card>
            ))}
          </View>
        ))
      )}
      {properties.length === 0 && (
        <Button title="Add your first property" variant="secondary" onPress={() => router.push('/landlord/property/new')} />
      )}
    </Screen>
  );
}
