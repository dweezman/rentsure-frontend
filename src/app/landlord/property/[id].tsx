import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PhotoCarousel } from '@/components/property/photo-carousel';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  EmptyState,
  InfoRow,
  ListRow,
  Screen,
  SectionHeader,
  VerificationBadge,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useProperty, useStore } from '@/store/app-store';
import { confirm } from '@/utils/dialog';
import { formatMoney, periodLabel } from '@/utils/format';
import { applicationMeta, listingMeta, propertyTypeLabel } from '@/utils/labels';

export default function LandlordPropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = useProperty(id);
  const { state, actions } = useStore();

  if (!property) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Property not found" />
      </Screen>
    );
  }

  const apps = state.applications.filter((a) => a.propertyId === property.id && a.status !== 'draft');
  const tenancy = state.tenancies.find((t) => t.propertyId === property.id && t.agreementStatus !== 'ended');
  const canSubmit = ['not_submitted', 'rejected', 'more_info'].includes(property.verificationStatus);

  const toggleListing = async () => {
    if (property.listingStatus === 'listed') {
      if (await confirm('Unlist property?', 'Tenants will no longer see it. Existing applications are kept.', 'Unlist')) {
        actions.setListingStatus(property.id, 'draft');
      }
    } else {
      actions.setListingStatus(property.id, 'listed');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: property.area || 'Property' }} />
      <Screen
        footer={
          canSubmit ? (
            <Button title="Submit for verification" icon="shield-checkmark-outline" onPress={() => actions.submitPropertyForVerification(property.id)} />
          ) : property.listingStatus === 'listed' || property.listingStatus === 'draft' ? (
            <Button
              title={property.listingStatus === 'listed' ? 'Unlist property' : 'List property'}
              variant={property.listingStatus === 'listed' ? 'outline' : 'primary'}
              onPress={toggleListing}
            />
          ) : undefined
        }>
        {property.photos.length > 0 && (
          <View style={{ marginHorizontal: -Spacing.lg, marginTop: -Spacing.lg }}>
            <PhotoCarousel photos={property.photos} title={property.title} />
          </View>
        )}

        <View style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <VerificationBadge status={property.verificationStatus} subject="property" />
            <Badge {...listingMeta[property.listingStatus]} />
          </View>
          <AppText variant="title">{property.title}</AppText>
          <AppText variant="caption">
            {[property.address, property.area, property.city].filter(Boolean).join(', ')}
          </AppText>
        </View>

        {property.verificationStatus === 'pending' && (
          <Banner tone="warning" icon="time-outline" title="Verification in progress" message="RentSure is checking this listing. Tenants can see it, marked as pending." />
        )}
        {property.verificationStatus === 'not_submitted' && (
          <Banner tone="info" icon="shield-outline" title="Not submitted for verification" message="Submit it so tenants see the verified badge." />
        )}
        {(property.verificationStatus === 'rejected' || property.verificationStatus === 'more_info') && (
          <Banner
            tone={property.verificationStatus === 'rejected' ? 'danger' : 'info'}
            icon="alert-circle-outline"
            title={property.verificationStatus === 'rejected' ? 'Verification rejected' : 'More information needed'}
            message={property.verificationNote ?? 'Check the reason from the RentSure team and resubmit.'}
          />
        )}

        {tenancy && (
          <Card>
            <ListRow
              icon="key-outline"
              iconTone="success"
              title="Current tenancy"
              subtitle={state.users.find((u) => u.id === tenancy.tenantId)?.fullName}
              onPress={() => router.push(`/landlord/tenancy/${tenancy.id}`)}
            />
          </Card>
        )}

        <Card>
          <SectionHeader title={`Applicants (${apps.length})`} actionLabel={apps.length > 1 ? 'Compare' : undefined} onAction={() => router.push(`/landlord/compare/${property.id}`)} />
          {apps.length === 0 ? (
            <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
              No applications yet.
            </AppText>
          ) : (
            apps.map((a, i) => (
              <View key={a.id}>
                {i > 0 && <Divider />}
                <ListRow
                  title={a.fullName}
                  subtitle={`${a.occupants} ${a.occupants > 1 ? 'people' : 'person'}${a.monthlyIncome ? ` · ${formatMoney(a.monthlyIncome)}/mo` : ''}`}
                  right={<Badge {...applicationMeta[a.status]} />}
                  onPress={() => router.push(`/landlord/application/${a.id}`)}
                />
              </View>
            ))
          )}
        </Card>

        <Card>
          <SectionHeader title="Listing details" />
          <InfoRow label="Type" value={propertyTypeLabel[property.type]} />
          <InfoRow label="Rooms" value={`${property.bedrooms} bed · ${property.bathrooms} bath`} />
          <InfoRow label="Rent" value={`${formatMoney(property.rent)}${periodLabel(property.rentPeriod)}`} strong />
          <InfoRow label="Deposit" value={formatMoney(property.deposit)} />
          {property.otherCharges.map((c) => (
            <InfoRow key={c.label} label={c.label} value={formatMoney(c.amount)} />
          ))}
          <Divider />
          <AppText variant="caption">{property.description}</AppText>
        </Card>

        <Banner
          tone="neutral"
          icon="information-circle-outline"
          title="Need to change something?"
          message="To change prices or photos after verification, contact RentSure support so the listing can be checked again."
        />
      </Screen>
    </>
  );
}
