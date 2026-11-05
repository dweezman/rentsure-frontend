import { useLocalSearchParams } from 'expo-router';

import { MaintenanceSummary } from '@/components/maintenance-summary';
import { Banner, EmptyState, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

export default function TenantMaintenanceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const request = state.maintenance.find((m) => m.id === id);

  if (!request) {
    return (
      <Screen>
        <EmptyState icon="construct-outline" title="Request not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      {request.status === 'rejected' && (
        <Banner
          tone="danger"
          icon="close-circle-outline"
          title="Your landlord declined this request"
          message={request.updates.at(-1)?.note ?? 'No reason was given.'}
        />
      )}
      {request.status === 'resolved' && (
        <Banner tone="success" icon="checkmark-circle" title="Marked as resolved" message="If the problem comes back, submit a new request." />
      )}
      <MaintenanceSummary request={request} viewer="tenant" />
    </Screen>
  );
}
