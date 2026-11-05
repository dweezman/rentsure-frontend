import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Banner, Button, Card, DocumentList, Screen, TextField } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useProperty, useStore } from '@/store/app-store';
import type { AttachedFile, FraudReason, FraudReport } from '@/types/models';
import { fraudReasonMeta } from '@/utils/labels';

export default function ReportConcern() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const property = useProperty(propertyId);
  const { actions } = useStore();
  const [reason, setReason] = useState<FraudReason | null>(null);
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<AttachedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<FraudReport | null>(null);

  const submit = () => {
    if (!reason) return setError('Choose what you want to report.');
    if (description.trim().length < 20) return setError('Please describe what happened (at least 20 characters).');
    setError(null);
    setSubmitted(
      actions.submitFraudReport({
        reason,
        description: description.trim(),
        evidence,
        propertyId: property?.id,
        landlordId: property?.landlordId,
      }),
    );
  };

  if (submitted) {
    return (
      <Screen footer={<Button title="Done" onPress={() => router.back()} />}>
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <Ionicons name="shield-checkmark" size={34} color={Colors.primary} />
          </View>
          <AppText variant="title" align="center">
            Thanks for reporting
          </AppText>
          <AppText align="center" color={Colors.textSecondary}>
            Your reference is <AppText variant="bodyStrong">{submitted.reference}</AppText>. The RentSure trust team will
            review it and may contact you for more details.
          </AppText>
        </View>
        <Button title="View my reports" variant="secondary" onPress={() => router.replace('/tenant/reports')} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Submit report" icon="flag-outline" onPress={submit} />}>
      {property && (
        <Card style={{ gap: 2 }}>
          <AppText variant="caption">Reporting</AppText>
          <AppText variant="bodyStrong">{property.title}</AppText>
          <AppText variant="caption">
            {property.area}, {property.city}
          </AppText>
        </Card>
      )}

      <Banner
        tone="info"
        icon="lock-closed-outline"
        title="Reports are confidential"
        message="The person you report won't see your name. A report starts a review; it doesn't mean anyone is guilty."
      />

      <AppText variant="label">What&apos;s the concern?</AppText>
      <View style={{ gap: Spacing.sm }}>
        {(Object.keys(fraudReasonMeta) as FraudReason[]).map((r) => {
          const selected = reason === r;
          return (
            <Pressable
              key={r}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setReason(r)}
              style={[styles.option, selected && styles.optionOn]}>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? Colors.primary : Colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{fraudReasonMeta[r].label}</AppText>
                <AppText variant="caption">{fraudReasonMeta[r].hint}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <TextField
        label="What happened?"
        required
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Include dates, names, phone numbers or account numbers you were given."
      />
      <DocumentList
        label="Evidence (optional)"
        value={evidence}
        onChange={setEvidence}
        hint="Screenshots of chats, payment requests or adverts."
      />
      {error && <Banner tone="danger" icon="alert-circle" title={error} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  done: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
