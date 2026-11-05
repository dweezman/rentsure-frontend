import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PhotoCarousel } from '@/components/property/photo-carousel';
import {
  AppText,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  Divider,
  EmptyState,
  InfoRow,
  Screen,
  SectionHeader,
  VerificationBadge,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useProperty, useStore, useUser } from '@/store/app-store';
import { formatDate, formatMoney, periodLabel } from '@/utils/format';
import { applicationMeta, propertyTypeLabel } from '@/utils/labels';

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = useProperty(id);
  const landlord = useUser(property?.landlordId);
  const me = useCurrentUser();
  const { state } = useStore();

  if (!property || !landlord) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Property not found" message="It may have been removed." />
      </Screen>
    );
  }

  const myApp = state.applications.find(
    (a) => a.propertyId === property.id && a.tenantId === me.id && a.status !== 'withdrawn',
  );
  const upfront = property.rent + property.deposit + property.otherCharges.reduce((s, c) => s + c.amount, 0);
  const verified = property.verificationStatus === 'verified';

  return (
    <>
      <Stack.Screen options={{ title: property.area }} />
      <Screen
        footer={
          <>
            <Button
              title="Report"
              icon="flag-outline"
              variant="outline"
              fullWidth={false}
              onPress={() =>
                router.push({ pathname: '/tenant/report', params: { propertyId: property.id } })
              }
            />
            {myApp ? (
              <Button
                title={myApp.status === 'draft' ? 'Continue application' : 'View my application'}
                style={{ flex: 1 }}
                onPress={() =>
                  myApp.status === 'draft'
                    ? router.push({ pathname: '/tenant/apply/[propertyId]', params: { propertyId: property.id, draftId: myApp.id } })
                    : router.push(`/tenant/application/${myApp.id}`)
                }
              />
            ) : property.listingStatus === 'let' ? (
              <Button title="Already let" icon="key-outline" style={{ flex: 1 }} disabled onPress={() => {}} />
            ) : (
              <Button
                title="Apply to rent"
                style={{ flex: 1 }}
                onPress={() => router.push(`/tenant/apply/${property.id}`)}
              />
            )}
          </>
        }>
        <View style={styles.bleed}>
          <PhotoCarousel photos={property.photos} title={property.title} />
        </View>

        <View style={{ gap: Spacing.sm }}>
          <View style={styles.badges}>
            <VerificationBadge status={property.verificationStatus} subject="property" />
            <VerificationBadge status={landlord.verificationStatus} subject="landlord" />
            <Badge label={propertyTypeLabel[property.type]} />
          </View>
          <AppText variant="title">{property.title}</AppText>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <AppText variant="caption">
              {property.address}, {property.area}, {property.city}
            </AppText>
          </View>
          <AppText variant="title" color={Colors.primaryDark}>
            {formatMoney(property.rent)}
            <AppText variant="body" color={Colors.textSecondary}>
              {periodLabel(property.rentPeriod)}
            </AppText>
          </AppText>
          {myApp && (
            <View style={styles.row}>
              <AppText variant="caption">Your application:</AppText>
              <Badge {...applicationMeta[myApp.status]} />
            </View>
          )}
        </View>

        {!verified && (
          <Banner
            tone="warning"
            icon="shield-outline"
            title="This listing hasn't been verified yet"
            message="RentSure is still checking this property. Don't pay any money until you've inspected it and the listing is verified."
          />
        )}

        <View style={styles.facts}>
          <Fact icon="bed-outline" label={`${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}`} />
          <Fact icon="water-outline" label={`${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}`} />
          <Fact icon="calendar-outline" label={`Listed ${formatDate(property.createdAt)}`} />
        </View>

        <Card>
          <SectionHeader title="About this place" />
          <AppText style={{ marginTop: Spacing.sm }}>{property.description}</AppText>
        </Card>

        <Card>
          <SectionHeader title="Costs to move in" />
          <AppText variant="caption" style={{ marginBottom: Spacing.sm }}>
            Every charge the landlord has disclosed. You shouldn&apos;t be asked for anything else.
          </AppText>
          <InfoRow label={`Rent (${property.rentPeriod === 'year' ? '1 year' : '1 month'})`} value={formatMoney(property.rent)} />
          <InfoRow label="Refundable deposit" value={formatMoney(property.deposit)} />
          {property.otherCharges.map((c) => (
            <InfoRow key={c.label} label={c.label} value={formatMoney(c.amount)} />
          ))}
          <Divider />
          <InfoRow label="Total up front" value={formatMoney(upfront)} strong />
        </Card>

        <Card>
          <SectionHeader title="Amenities" />
          <View style={{ marginTop: Spacing.sm }}>
            <ChipRow>
              {property.amenities.map((a) => (
                <Chip key={a} label={a} icon="checkmark-circle-outline" />
              ))}
            </ChipRow>
          </View>
        </Card>

        <Card style={{ gap: Spacing.sm }}>
          <SectionHeader title="Requirements" />
          {property.requirements.map((r) => (
            <View key={r} style={styles.row}>
              <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              <AppText style={{ flex: 1 }}>{r}</AppText>
            </View>
          ))}
        </Card>

        <Card style={{ gap: Spacing.sm }}>
          <SectionHeader title="Inspection" />
          <View style={styles.row}>
            <Ionicons name="eye-outline" size={16} color={Colors.primary} />
            <AppText style={{ flex: 1 }}>{property.inspection}</AppText>
          </View>
          <AppText variant="caption">
            Always inspect in person before paying. Never pay an &quot;inspection fee&quot; to a stranger.
          </AppText>
        </Card>

        <Card style={{ gap: Spacing.md }}>
          <SectionHeader title="Landlord" />
          <View style={styles.row}>
            <Avatar name={landlord.fullName} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodyStrong">{landlord.fullName}</AppText>
              <VerificationBadge status={landlord.verificationStatus} subject="landlord" />
              <AppText variant="caption">On RentSure since {formatDate(landlord.createdAt)}</AppText>
            </View>
          </View>
          <AppText variant="caption">
            Contact details are shared once your application is approved, so you only deal with the real landlord.
          </AppText>
        </Card>
      </Screen>
    </>
  );
}

function Fact({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <AppText variant="caption" color={Colors.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -Spacing.lg, marginTop: -Spacing.lg },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
});
