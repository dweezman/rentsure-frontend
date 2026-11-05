import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { photoSource } from '@/utils/photos';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, VerificationBadge } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Property, VerificationStatus } from '@/types/models';
import { formatMoney, periodLabel } from '@/utils/format';
import { propertyTypeLabel } from '@/utils/labels';

export function PropertyCard({
  property,
  landlordStatus,
  onPress,
  compact,
  footer,
}: {
  property: Property;
  landlordStatus?: VerificationStatus;
  onPress?: () => void;
  compact?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Card padded={false} onPress={onPress} style={styles.card}>
      <View style={compact ? styles.rowLayout : undefined}>
        <Image
          source={photoSource(property.photos[0])}
          style={compact ? styles.thumb : styles.image}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Photo of ${property.title}`}
        />
        <View style={[styles.body, compact && styles.flex]}>
          {!compact && (
            <View style={styles.badges}>
              <VerificationBadge status={property.verificationStatus} subject="property" />
              {landlordStatus === 'verified' && <VerificationBadge status="verified" subject="landlord" />}
              {property.listingStatus === 'let' && <Badge label="Let" icon="key-outline" />}
            </View>
          )}
          <AppText variant="heading" numberOfLines={1}>
            {property.title}
          </AppText>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <AppText variant="caption" numberOfLines={1} style={styles.flex}>
              {property.area}, {property.city}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="bodyStrong" color={Colors.primaryDark}>
              {formatMoney(property.rent)}
              <AppText variant="caption">{periodLabel(property.rentPeriod)}</AppText>
            </AppText>
            {!compact && (
              <View style={styles.meta}>
                <Badge label={propertyTypeLabel[property.type]} />
                <AppText variant="caption">
                  {property.bedrooms} bd · {property.bathrooms} ba
                </AppText>
              </View>
            )}
          </View>
          {compact && <VerificationBadge status={property.verificationStatus} subject="property" />}
          {footer}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1 },
  flex: { flex: 1 },
  rowLayout: { flexDirection: 'row' },
  image: { width: '100%', aspectRatio: 16 / 10, backgroundColor: Colors.surfaceAlt },
  thumb: { width: 110, minHeight: 120, backgroundColor: Colors.surfaceAlt },
  body: { padding: Spacing.md, gap: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
});
