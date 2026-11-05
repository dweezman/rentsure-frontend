import { useMemo } from 'react';

import { useStore } from './app-store';

/** Everything that belongs to the landlord who is logged in. */
export function useLandlordData() {
  const { state, currentUser } = useStore();
  return useMemo(() => {
    const id = currentUser?.id;
    const properties = state.properties.filter((p) => p.landlordId === id);
    const propIds = new Set(properties.map((p) => p.id));
    const applications = state.applications
      .filter((a) => propIds.has(a.propertyId) && a.status !== 'draft')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const tenancies = state.tenancies.filter((t) => t.landlordId === id);
    const tenancyIds = new Set(tenancies.map((t) => t.id));
    const installments = state.installments
      .filter((i) => tenancyIds.has(i.tenancyId))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const maintenance = state.maintenance
      .filter((m) => m.landlordId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { properties, applications, tenancies, installments, maintenance };
  }, [state, currentUser?.id]);
}
