import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Card,
  ChipSelect,
  DocumentList,
  PhotoPicker,
  ProgressSteps,
  Screen,
  SectionHeader,
  TextField,
  VerificationBadge,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import type { AttachedFile } from '@/types/models';
import { confirm } from '@/utils/dialog';

const ID_TYPES = [
  { value: 'nin', label: 'NIN slip / card' },
  { value: 'passport', label: 'International passport' },
  { value: 'drivers', label: "Driver's licence" },
  { value: 'voters', label: "Voter's card" },
] as const;
type IdType = (typeof ID_TYPES)[number]['value'];

const AUTHORITY_TYPES = [
  { value: 'owner', label: 'I own the property' },
  { value: 'agent', label: "I'm the owner's agent / manager" },
] as const;
type Authority = (typeof AUTHORITY_TYPES)[number]['value'];

const STATUS_STEP = { not_submitted: 0, more_info: 0, rejected: 0, pending: 1, verified: 2 } as const;

/**
 * Identity verification (tenants) and landlord verification (landlords).
 * Landlords also prove they own or are authorised to let their property.
 */
export function VerificationForm({ mode }: { mode: 'identity' | 'landlord' }) {
  const me = useCurrentUser();
  const { actions } = useStore();
  const [idType, setIdType] = useState<IdType | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [idPhotos, setIdPhotos] = useState<string[]>([]);
  const [selfie, setSelfie] = useState<string[]>([]);
  const [authority, setAuthority] = useState<Authority | null>(null);
  const [address, setAddress] = useState('');
  const [proof, setProof] = useState<AttachedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const status = me.verificationStatus;
  const canSubmit = status === 'not_submitted' || status === 'rejected' || status === 'more_info';
  const landlord = mode === 'landlord';

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!idType) e.idType = 'Choose an ID type.';
    if (idNumber.trim().length < 6) e.idNumber = 'Enter the number on your ID.';
    if (idPhotos.length === 0) e.idPhotos = 'Add a photo of your ID.';
    if (selfie.length === 0) e.selfie = 'Add a selfie so we can match it to your ID.';
    if (landlord) {
      if (!authority) e.authority = 'Tell us your relationship to the property.';
      if (address.trim().length < 8) e.address = 'Enter the property address.';
      if (proof.length === 0) e.proof = 'Attach at least one document.';
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    const ok = await confirm(
      'Submit for review?',
      'The RentSure team will check your documents. This usually takes 1–2 working days.',
      'Submit',
    );
    if (!ok) return;
    actions.submitVerification();
    router.back();
  };

  return (
    <Screen footer={canSubmit ? <Button title="Submit for review" icon="shield-checkmark-outline" onPress={submit} /> : undefined}>
      <Card style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="heading">Your status</AppText>
          <VerificationBadge status={status} subject={landlord ? 'landlord' : 'identity'} />
        </View>
        <ProgressSteps steps={['Submit', 'In review', 'Verified']} current={STATUS_STEP[status]} />
        {me.verificationNote && <AppText variant="caption">{me.verificationNote}</AppText>}
      </Card>

      {status === 'verified' && (
        <Banner
          tone="success"
          icon="shield-checkmark"
          title={landlord ? "You're a verified landlord" : 'Your identity is verified'}
          message={landlord ? 'Your listings show the verified landlord badge.' : 'Landlords can see you are a verified renter.'}
        />
      )}
      {status === 'pending' && (
        <>
          <Banner tone="warning" icon="time-outline" title="We're reviewing your documents" message="We'll notify you when the review is complete." />
          {__DEV__ && (
            <Button
              title="Demo: simulate admin approval"
              variant="outline"
              size="sm"
              onPress={() => {
                actions.demoApproveVerifications();
                router.back();
              }}
            />
          )}
        </>
      )}
      {status === 'rejected' && (
        <Banner tone="danger" icon="close-circle-outline" title="Verification was not approved" message="Check the note above, then submit clearer or corrected documents." />
      )}
      {status === 'more_info' && (
        <Banner tone="info" icon="alert-circle-outline" title="We need a little more" message="See the note above, then submit again." />
      )}

      {canSubmit && (
        <>
          <AppText color={Colors.textSecondary}>
            {landlord
              ? 'Show tenants they can trust you. We check your identity and that you have the right to let your property.'
              : 'A verified ID helps landlords trust your application.'}
          </AppText>

          <SectionHeader title="1. Government ID" />
          <View style={{ gap: 6 }}>
            <ChipSelect options={ID_TYPES} value={idType} onChange={setIdType} />
            {errors.idType && <AppText variant="caption" color={Colors.danger}>{errors.idType}</AppText>}
          </View>
          <TextField label="ID number" required value={idNumber} onChangeText={setIdNumber} autoCapitalize="characters" error={errors.idNumber} />
          <PhotoPicker label="Photo of your ID (front and back)" value={idPhotos} onChange={setIdPhotos} max={2} error={errors.idPhotos} />
          <PhotoPicker label="Selfie" value={selfie} onChange={setSelfie} max={1} hint="Face the camera in good light, no glasses or hat." error={errors.selfie} />

          {landlord && (
            <>
              <SectionHeader title="2. Right to let" />
              <View style={{ gap: 6 }}>
                <ChipSelect options={AUTHORITY_TYPES} value={authority} onChange={setAuthority} />
                {errors.authority && <AppText variant="caption" color={Colors.danger}>{errors.authority}</AppText>}
              </View>
              <TextField label="Property address" required value={address} onChangeText={setAddress} error={errors.address} />
              <DocumentList
                label={authority === 'agent' ? "Letter of authority from the owner + owner's ID" : 'Proof of ownership'}
                value={proof}
                onChange={setProof}
                hint={
                  authority === 'agent'
                    ? 'A signed letter from the owner authorising you to let the property.'
                    : 'e.g. Certificate of Occupancy, Deed of Assignment, Governor’s Consent or a recent utility bill in your name.'
                }
              />
              {errors.proof && <AppText variant="caption" color={Colors.danger}>{errors.proof}</AppText>}
              <AppText variant="caption">
                Documents alone don&apos;t prove ownership. RentSure may run extra checks, such as a land registry search or an
                inspection, before approving.
              </AppText>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
