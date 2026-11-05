import { router } from 'expo-router';
import { View } from 'react-native';

import { PropertyCard } from '@/components/property/property-card';
import { AppText, Badge, Button, EmptyState, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useLandlordData } from '@/store/landlord';
import { listingMeta } from '@/utils/labels';

export default function LandlordProperties() {
  const { properties, applications } = useLandlordData();

  return (
    <Screen footer={<Button title="Add property" icon="add" onPress={() => router.push('/landlord/property/new')} />}>
      {properties.length === 0 ? (
        <EmptyState
          icon="business-outline"
          title="No properties yet"
          message="Add your first property. It will be checked by RentSure before it gets a verified badge."
        />
      ) : (
        properties.map((p) => {
          const count = applications.filter((a) => a.propertyId === p.id && ['submitted', 'under_review', 'info_requested'].includes(a.status)).length;
          return (
            <PropertyCard
              key={p.id}
              compact
              property={p}
              onPress={() => router.push(`/landlord/property/${p.id}`)}
              footer={
                <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge {...listingMeta[p.listingStatus]} />
                  {count > 0 && <AppText variant="tiny">{count} to review</AppText>}
                </View>
              }
            />
          );
        })
      )}
    </Screen>
  );
}
