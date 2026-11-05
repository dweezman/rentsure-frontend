import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PropertyCard } from '@/components/property/property-card';
import { AppText, Chip, ChipRow, ChipSelect, EmptyState, Screen, TextField } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import type { Property, PropertyType } from '@/types/models';
import { propertyTypeLabel } from '@/utils/labels';

type PriceBand = 'any' | 'lt500' | '500to2m' | '2mto5m' | 'gt5m';

const PRICE_BANDS: { value: PriceBand; label: string; test: (yearly: number) => boolean }[] = [
  { value: 'any', label: 'Any price', test: () => true },
  { value: 'lt500', label: 'Under ₦500k', test: (y) => y < 500_000 },
  { value: '500to2m', label: '₦500k – ₦2M', test: (y) => y >= 500_000 && y <= 2_000_000 },
  { value: '2mto5m', label: '₦2M – ₦5M', test: (y) => y > 2_000_000 && y <= 5_000_000 },
  { value: 'gt5m', label: 'Above ₦5M', test: (y) => y > 5_000_000 },
];

const TYPE_OPTIONS = [
  { value: 'all' as const, label: 'All types' },
  ...(Object.keys(propertyTypeLabel) as PropertyType[]).map((t) => ({ value: t, label: propertyTypeLabel[t] })),
];

const yearly = (p: Property) => (p.rentPeriod === 'month' ? p.rent * 12 : p.rent);

export default function Explore() {
  const user = useCurrentUser();
  const { state } = useStore();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [price, setPrice] = useState<PriceBand>('any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const landlordStatus = (id: string) => state.users.find((u) => u.id === id)?.verificationStatus;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const band = PRICE_BANDS.find((b) => b.value === price)!;
    // Let properties are shown too (marked "Let", no Apply button), listed after the available ones.
    return state.properties.filter(
      (p) =>
        (p.listingStatus === 'listed' || p.listingStatus === 'let') &&
        (!q || [p.title, p.area, p.city, p.state, p.address].some((f) => f.toLowerCase().includes(q))) &&
        (type === 'all' || p.type === type) &&
        band.test(yearly(p)) &&
        (!verifiedOnly || p.verificationStatus === 'verified'),
    ).sort((a, b) => Number(a.listingStatus === 'let') - Number(b.listingStatus === 'let'));
  }, [state.properties, query, type, price, verifiedOnly]);

  const twoCol = width >= 640;
  // Laptops/desktops: wider page and three columns (the sidebar takes ~220px).
  const threeCol = width >= 1280;
  const firstName = user.fullName.split(' ')[0];
  const filtered = query || type !== 'all' || price !== 'any' || verifiedOnly;

  return (
    <Screen contentStyle={threeCol ? styles.wide : undefined}>
      <View style={{ gap: 2 }}>
        <AppText variant="title">Hi {firstName} 👋</AppText>
        <AppText variant="caption">Find a verified place to rent.</AppText>
      </View>

      <TextField
        icon="search"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by area, city or street"
        returnKeyType="search"
        accessibilityLabel="Search properties"
      />

      <View style={{ gap: Spacing.sm }}>
        <ChipSelect scroll options={TYPE_OPTIONS} value={type} onChange={setType} />
        <ChipRow scroll>
          <Chip
            label="Verified only"
            icon="shield-checkmark-outline"
            selected={verifiedOnly}
            onPress={() => setVerifiedOnly((v) => !v)}
          />
          {PRICE_BANDS.map((b) => (
            <Chip key={b.value} label={b.label} selected={price === b.value} onPress={() => setPrice(b.value)} />
          ))}
        </ChipRow>
      </View>

      <View style={styles.resultsHeader}>
        <AppText variant="label">
          {results.length} {results.length === 1 ? 'property' : 'properties'}
        </AppText>
        {filtered && (
          <AppText
            variant="label"
            color={Colors.primary}
            onPress={() => {
              setQuery('');
              setType('all');
              setPrice('any');
              setVerifiedOnly(false);
            }}>
            Clear filters
          </AppText>
        )}
      </View>

      {results.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="No properties match"
          message="Try a different area or widen your price range."
        />
      ) : (
        <View style={[styles.grid, twoCol && styles.gridTwo]}>
          {results.map((p) => (
            <View key={p.id} style={threeCol ? styles.cellThree : twoCol ? styles.cellTwo : undefined}>
              <PropertyCard
                property={p}
                landlordStatus={landlordStatus(p.landlordId)}
                onPress={() => router.push(`/tenant/property/${p.id}`)}
              />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { gap: Spacing.lg },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  cellTwo: { width: '48.5%' },
  cellThree: { width: '32%' },
  wide: { maxWidth: 1100 },
});
