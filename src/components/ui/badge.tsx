import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing, ToneColors, type Tone } from '@/constants/theme';
import type { VerificationStatus } from '@/types/models';
import { verificationMeta } from '@/utils/labels';

import { AppText } from './text';

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const c = ToneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {icon && <Ionicons name={icon} size={12} color={c.fg} />}
      <AppText variant="tiny" color={c.fg}>
        {label}
      </AppText>
    </View>
  );
}

/** A small coloured label for a status. The words and colours come from utils/labels. */
export function StatusBadge({ meta }: { meta: { label: string; tone: Tone } }) {
  return <Badge label={meta.label} tone={meta.tone} />;
}

const verificationIcon: Record<VerificationStatus, keyof typeof Ionicons.glyphMap> = {
  verified: 'shield-checkmark',
  pending: 'time-outline',
  not_submitted: 'shield-outline',
  rejected: 'close-circle-outline',
  more_info: 'alert-circle-outline',
};

/**
 * The badge that shows whether a landlord or property has been checked,
 * for example "Verified landlord" or "Verification pending".
 */
export function VerificationBadge({
  status,
  subject,
}: {
  status: VerificationStatus;
  subject?: 'landlord' | 'property' | 'identity';
}) {
  const meta = verificationMeta[status];
  let label = meta.label;
  if (subject && status === 'verified') {
    label = { landlord: 'Verified landlord', property: 'Verified property', identity: 'ID verified' }[subject];
  } else if (subject === 'property' && status !== 'verified') {
    label = status === 'pending' ? 'Verification pending' : 'Not verified';
  } else if (subject === 'landlord' && status !== 'verified') {
    label = 'Landlord not verified';
  }
  const tone: Tone = status === 'verified' ? 'success' : status === 'pending' ? 'warning' : 'neutral';
  return <Badge label={label} tone={tone} icon={verificationIcon[status]} />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
});
