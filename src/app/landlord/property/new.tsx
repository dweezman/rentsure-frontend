import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  ChipMultiSelect,
  ChipSelect,
  PhotoPicker,
  Screen,
  SectionHeader,
  Stepper,
  TextField,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import type { Charge, PropertyType, RentPeriod } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { AMENITIES, NIGERIAN_STATES, propertyTypeLabel } from '@/utils/labels';

const TYPE_OPTIONS = (Object.keys(propertyTypeLabel) as PropertyType[]).map((v) => ({ value: v, label: propertyTypeLabel[v] }));
const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: s }));
const AMENITY_OPTIONS = AMENITIES.map((a) => ({ value: a, label: a }));

type ChargeDraft = { label: string; amount: string };

export default function NewProperty() {
  const me = useCurrentUser();
  const { actions } = useStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType | null>(null);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState<string | null>(null);
  const [rent, setRent] = useState('');
  const [period, setPeriod] = useState<RentPeriod>('year');
  const [deposit, setDeposit] = useState('');
  const [charges, setCharges] = useState<ChargeDraft[]>([]);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [requirements, setRequirements] = useState('Valid government ID\nProof of income or employment letter');
  const [inspection, setInspection] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const input = () => ({
    title: title.trim(),
    type: type ?? 'apartment',
    description: description.trim(),
    address: address.trim(),
    area: area.trim(),
    city: city.trim(),
    state: stateName ?? '',
    rent: Number(rent) || 0,
    rentPeriod: period,
    deposit: Number(deposit) || 0,
    otherCharges: charges
      .filter((c) => c.label.trim() && Number(c.amount))
      .map<Charge>((c) => ({ label: c.label.trim(), amount: Number(c.amount) })),
    bedrooms,
    bathrooms,
    amenities,
    requirements: requirements.split('\n').map((r) => r.trim()).filter(Boolean),
    inspection: inspection.trim(),
    photos,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 5) e.title = 'Give the listing a clear title.';
    if (!type) e.type = 'Choose a property type.';
    if (!address.trim()) e.address = 'Enter the street address.';
    if (!area.trim()) e.area = 'Enter the area or neighbourhood.';
    if (!city.trim()) e.city = 'Enter the city.';
    if (!stateName) e.state = 'Choose a state.';
    if (!Number(rent)) e.rent = 'Enter the rent.';
    if (description.trim().length < 30) e.description = 'Describe the property (at least 30 characters).';
    if (!inspection.trim()) e.inspection = 'Say how tenants can inspect the property.';
    if (photos.length < 3) e.photos = 'Add at least 3 photos of the actual property.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveDraft = () => {
    if (!title.trim()) {
      setErrors({ title: 'Add a title before saving a draft.' });
      return;
    }
    const id = actions.addProperty(input(), false);
    router.replace(`/landlord/property/${id}`);
  };

  const submit = async () => {
    if (!validate()) return;
    const ok = await confirm(
      'Submit for verification?',
      'Your listing will go live marked "Verification pending" until RentSure has checked it.',
      'Submit',
    );
    if (!ok) return;
    const id = actions.addProperty(input(), true);
    router.replace(`/landlord/property/${id}`);
  };

  const updateCharge = (i: number, patch: Partial<ChargeDraft>) =>
    setCharges((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <Screen
      footer={
        <>
          <Button title="Save draft" variant="outline" fullWidth={false} onPress={saveDraft} />
          <Button title="Submit for verification" style={{ flex: 1 }} onPress={submit} />
        </>
      }>
      {me.verificationStatus !== 'verified' && (
        <Banner
          tone="info"
          icon="shield-outline"
          title="Your account isn't verified yet"
          message="You can add properties now, but they won't get a verified badge until your landlord verification is approved."
          actionLabel="Verify my account"
          onAction={() => router.push('/landlord/verification')}
        />
      )}

      <SectionHeader title="Basics" />
      <TextField label="Listing title" required value={title} onChangeText={setTitle} placeholder="e.g. 2-Bedroom Flat in Yaba" error={errors.title} />
      <Field label="Property type" error={errors.type}>
        <ChipSelect options={TYPE_OPTIONS} value={type} onChange={setType} />
      </Field>
      <View style={{ flexDirection: 'row', gap: Spacing.lg, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Stepper label="Bedrooms" value={bedrooms} onChange={setBedrooms} max={10} />
        </View>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Stepper label="Bathrooms" value={bathrooms} onChange={setBathrooms} max={10} />
        </View>
      </View>

      <SectionHeader title="Location" />
      <TextField label="Street address" required value={address} onChangeText={setAddress} placeholder="House number and street" error={errors.address} />
      <TextField label="Area / neighbourhood" required value={area} onChangeText={setArea} placeholder="e.g. Yaba" error={errors.area} />
      <TextField label="City" required value={city} onChangeText={setCity} placeholder="e.g. Lagos" error={errors.city} />
      <Field label="State" error={errors.state}>
        <ChipSelect options={STATE_OPTIONS} value={stateName} onChange={setStateName} />
      </Field>

      <SectionHeader title="Price & charges" />
      <Field label="Rent is paid per">
        <ChipSelect
          options={[
            { value: 'year', label: 'Year' },
            { value: 'month', label: 'Month' },
          ]}
          value={period}
          onChange={setPeriod}
        />
      </Field>
      <TextField label={`Rent per ${period}`} required money value={rent} onChangeText={setRent} error={errors.rent} />
      <TextField label="Refundable deposit" money value={deposit} onChangeText={setDeposit} placeholder="0" />
      <Field label="Other charges" hint="List every other fee (agency, legal, service charge). Tenants see all of them up front.">
        {charges.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
            <View style={{ flex: 3 }}>
              <TextField value={c.label} onChangeText={(t) => updateCharge(i, { label: t })} placeholder="e.g. Agency fee" />
            </View>
            <View style={{ flex: 2 }}>
              <TextField money value={c.amount} onChangeText={(t) => updateCharge(i, { amount: t })} placeholder="Amount" />
            </View>
            <Pressable
              accessibilityLabel="Remove charge"
              onPress={() => setCharges((cs) => cs.filter((_, j) => j !== i))}
              style={{ paddingTop: 14 }}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
        ))}
        <Button
          title="Add a charge"
          icon="add"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => setCharges((cs) => [...cs, { label: '', amount: '' }])}
        />
      </Field>

      <SectionHeader title="Details" />
      <TextField label="Description" required multiline value={description} onChangeText={setDescription} placeholder="What makes this place great? Mention the condition, layout and nearby landmarks." error={errors.description} />
      <Field label="Amenities">
        <ChipMultiSelect options={AMENITY_OPTIONS} values={amenities} onChange={setAmenities} />
      </Field>
      <TextField label="Tenant requirements" multiline value={requirements} onChangeText={setRequirements} hint="One per line." />
      <TextField label="Inspection arrangements" required multiline value={inspection} onChangeText={setInspection} placeholder="e.g. Weekdays 10am–4pm, book through the app." error={errors.inspection} />

      <SectionHeader title="Photos" />
      <PhotoPicker value={photos} onChange={setPhotos} max={10} hint="Use real, recent photos. Misleading photos can get a listing suspended." error={errors.photos} />
    </Screen>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label">{label}</AppText>
      {children}
      {error ? (
        <AppText variant="caption" color={Colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
}
