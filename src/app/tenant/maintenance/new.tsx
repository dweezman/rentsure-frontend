import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Banner, Button, ChipSelect, EmptyState, PhotoPicker, Screen, TextField } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useActiveTenancy, useStore } from '@/store/app-store';
import type { MaintenanceCategory, MaintenanceUrgency } from '@/types/models';
import { maintenanceCategoryLabel, urgencyMeta } from '@/utils/labels';

const CATEGORY_OPTIONS = (Object.keys(maintenanceCategoryLabel) as MaintenanceCategory[]).map((v) => ({
  value: v,
  label: maintenanceCategoryLabel[v],
}));
const URGENCY_OPTIONS = (Object.keys(urgencyMeta) as MaintenanceUrgency[]).map((v) => ({
  value: v,
  label: urgencyMeta[v].label,
}));

export default function NewMaintenance() {
  const params = useLocalSearchParams<{ category?: MaintenanceCategory }>();
  const tenancy = useActiveTenancy();
  const { actions } = useStore();
  const [category, setCategory] = useState<MaintenanceCategory | null>(params.category ?? null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!tenancy) {
    return (
      <Screen>
        <EmptyState icon="construct-outline" title="No active tenancy" message="You can request repairs once you have a tenancy." />
      </Screen>
    );
  }

  const submit = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Choose what the problem is about.';
    if (title.trim().length < 4) e.title = 'Give the problem a short title.';
    if (description.trim().length < 10) e.description = 'Describe the problem in a bit more detail.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = actions.createMaintenance(tenancy.id, {
      category: category!,
      title: title.trim(),
      description: description.trim(),
      urgency,
      photos,
    });
    router.replace(`/tenant/maintenance/${id}`);
  };

  const isIssue = params.category === 'other';

  return (
    <Screen footer={<Button title="Send to landlord" icon="send-outline" onPress={submit} />}>
      <AppText variant="title">{isIssue ? 'Report a tenancy issue' : 'Request a repair'}</AppText>
      {urgency === 'emergency' && (
        <Banner
          tone="danger"
          icon="warning-outline"
          title="In danger right now?"
          message="For fire, gas leaks or electrical danger, leave the property and call emergency services on 112 first."
        />
      )}
      <View style={{ gap: 6 }}>
        <AppText variant="label">What is it about?</AppText>
        <ChipSelect options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        {errors.category && <AppText variant="caption" color={Colors.danger}>{errors.category}</AppText>}
      </View>
      <TextField label="Title" required value={title} onChangeText={setTitle} placeholder="e.g. Leaking kitchen tap" error={errors.title} />
      <TextField
        label="Describe the problem"
        required
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Where is it, when did it start, what have you tried?"
        error={errors.description}
      />
      <View style={{ gap: 6 }}>
        <AppText variant="label">How urgent is it?</AppText>
        <ChipSelect options={URGENCY_OPTIONS} value={urgency} onChange={setUrgency} />
      </View>
      <PhotoPicker label="Photos" value={photos} onChange={setPhotos} max={6} hint="Clear photos help your landlord act faster." />
    </Screen>
  );
}
