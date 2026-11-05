import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { MaintenanceSummary } from '@/components/maintenance-summary';
import { AppText, Button, Card, EmptyState, InfoRow, Screen, SectionHeader, TextField } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';
import type { MaintenanceStatus } from '@/types/models';
import { confirm } from '@/utils/dialog';
import { isPhone, isValidISODate } from '@/utils/format';

type Mode = null | 'reject' | 'assign' | 'progress';

export default function LandlordMaintenanceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const request = state.maintenance.find((m) => m.id === id);
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visit, setVisit] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!request) {
    return (
      <Screen>
        <EmptyState icon="construct-outline" title="Request not found" />
      </Screen>
    );
  }

  const property = state.properties.find((p) => p.id === request.propertyId);
  const tenant = state.users.find((u) => u.id === request.tenantId);

  const reset = () => {
    setMode(null);
    setNote('');
    setError(null);
  };

  const move = (status: MaintenanceStatus, n?: string) => {
    actions.updateMaintenance(request.id, status, n);
    reset();
  };

  const submitMode = async () => {
    if (mode === 'reject') {
      if (note.trim().length < 5) return setError('Explain why you are declining.');
      if (await confirm('Decline request?', 'The tenant will see your explanation.', 'Decline', true)) move('rejected', note.trim());
    } else if (mode === 'assign') {
      if (!name.trim()) return setError('Enter who will do the repair.');
      if (!isPhone(phone)) return setError('Enter a valid phone number.');
      if (visit && !isValidISODate(visit)) return setError('Visit date must be YYYY-MM-DD.');
      actions.updateMaintenance(request.id, 'assigned', note.trim() || `${name.trim()} will handle this.`, {
        name: name.trim(),
        phone: phone.trim(),
        scheduledFor: visit || undefined,
      });
      reset();
    } else if (mode === 'progress') {
      if (!note.trim()) return setError('Add a short update for the tenant.');
      move('in_progress', note.trim());
    }
  };

  const s = request.status;
  const closed = s === 'resolved' || s === 'rejected';

  let footer: React.ReactNode;
  if (mode) {
    footer = (
      <>
        <Button title="Cancel" variant="outline" fullWidth={false} onPress={reset} />
        <Button title={mode === 'reject' ? 'Decline' : 'Save'} variant={mode === 'reject' ? 'danger' : 'primary'} style={{ flex: 1 }} onPress={submitMode} />
      </>
    );
  } else if (s === 'submitted') {
    footer = (
      <>
        <Button title="Decline" variant="danger" fullWidth={false} onPress={() => setMode('reject')} />
        <Button title="Accept" style={{ flex: 1 }} onPress={() => move('accepted', 'Request accepted. I will arrange a repair.')} />
      </>
    );
  } else if (s === 'accepted') {
    footer = <Button title="Assign repair" icon="person-add-outline" onPress={() => setMode('assign')} />;
  } else if (s === 'assigned' || s === 'in_progress') {
    footer = (
      <>
        <Button title="Post update" variant="outline" fullWidth={false} onPress={() => setMode('progress')} />
        <Button
          title="Mark resolved"
          icon="checkmark-done"
          style={{ flex: 1 }}
          onPress={async () => {
            if (await confirm('Mark as resolved?', 'The tenant will be notified that the issue is fixed.', 'Resolve')) move('resolved', 'Issue fixed.');
          }}
        />
      </>
    );
  }

  return (
    <Screen footer={closed ? undefined : footer}>
      <Card>
        <InfoRow label="Property" value={property?.title ?? ''} />
        <InfoRow label="Tenant" value={tenant?.fullName ?? ''} />
        <InfoRow label="Tenant phone" value={tenant?.phone ?? ''} />
      </Card>

      {mode && (
        <Card style={{ gap: Spacing.md }}>
          <SectionHeader title={mode === 'reject' ? 'Decline request' : mode === 'assign' ? 'Assign repair' : 'Progress update'} />
          {mode === 'assign' && (
            <>
              <TextField label="Artisan / company" required value={name} onChangeText={setName} placeholder="e.g. Emeka (Plumber)" />
              <TextField label="Their phone" required value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextField label="Visit date (optional)" value={visit} onChangeText={setVisit} placeholder="YYYY-MM-DD" />
            </>
          )}
          <TextField
            label={mode === 'reject' ? 'Reason' : 'Message to tenant'}
            required={mode !== 'assign'}
            value={note}
            onChangeText={(t) => {
              setNote(t);
              setError(null);
            }}
            multiline
            placeholder={mode === 'reject' ? "e.g. This is the tenant's responsibility under clause 2." : 'e.g. Parts ordered, fix scheduled for Thursday.'}
          />
          {error && (
            <AppText variant="caption" color={Colors.danger}>
              {error}
            </AppText>
          )}
        </Card>
      )}

      <View style={{ gap: Spacing.lg }}>
        <MaintenanceSummary request={request} viewer="landlord" />
      </View>
    </Screen>
  );
}
