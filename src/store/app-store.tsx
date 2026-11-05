/**
 * This file holds all the app's data and everything the app can do with it,
 * like logging in, applying for a place or recording a payment.
 *
 * For now the data starts from the sample data in src/data/mock.ts.
 * Backend team: each action below is where a call to your API should go. Keep the
 * names and inputs the same, and the screens won't need to change.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as mock from '@/data/mock';
import type {
  AppNotification,
  AttachedFile,
  FraudReport,
  Installment,
  InstallmentStatus,
  MaintenanceRequest,
  MaintenanceStatus,
  PaymentMethod,
  Property,
  RentalApplication,
  ApplicationStatus,
  Role,
  Tenancy,
  User,
} from '@/types/models';
import { daysUntil, newId, todayISO } from '@/utils/format';

interface State {
  currentUserId: string | null;
  users: User[];
  properties: Property[];
  applications: RentalApplication[];
  tenancies: Tenancy[];
  installments: Installment[];
  maintenance: MaintenanceRequest[];
  fraudReports: FraudReport[];
  notifications: AppNotification[];
}

const initialState: State = {
  currentUserId: null,
  users: mock.users,
  properties: mock.properties,
  applications: mock.applications,
  tenancies: mock.tenancies,
  installments: mock.installments,
  maintenance: mock.maintenance,
  fraudReports: mock.fraudReports,
  notifications: mock.notifications,
};

export type ApplicationInput = Omit<
  RentalApplication,
  'id' | 'status' | 'history' | 'createdAt' | 'updatedAt' | 'tenantId'
>;

export type PropertyInput = Omit<
  Property,
  'id' | 'landlordId' | 'verificationStatus' | 'listingStatus' | 'createdAt' | 'verificationNote'
>;

export type TenancyInput = Pick<
  Tenancy,
  'startDate' | 'endDate' | 'annualRent' | 'schedule' | 'deposit' | 'clauses'
> & { applicationId: string };

export type MaintenanceInput = Pick<
  MaintenanceRequest,
  'category' | 'title' | 'description' | 'urgency' | 'photos'
>;

export type FraudInput = Pick<FraudReport, 'reason' | 'description' | 'evidence' | 'propertyId' | 'landlordId'>;

const now = () => new Date().toISOString();

const STORAGE_KEY = 'rentsure-state-v2';

/**
 * The browser keeps an old copy of the demo data, which may have old photo lists.
 * So the sample houses and repair requests always use the photos from the latest sample data.
 * Anything the user added themselves, like a new listing or repair request, is left as it is.
 */
function withLatestSamplePhotos(s: State): State {
  const propPhotos = new Map(mock.properties.map((p) => [p.id, p.photos]));
  const repairPhotos = new Map(mock.maintenance.map((m) => [m.id, m.photos]));
  return {
    ...s,
    properties: s.properties.map((p) => (propPhotos.has(p.id) ? { ...p, photos: propPhotos.get(p.id)! } : p)),
    maintenance: s.maintenance.map((m) => (repairPhotos.has(m.id) ? { ...m, photos: repairPhotos.get(m.id)! } : m)),
  };
}

function useAppState() {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const update = useCallback((fn: (s: State) => State) => setState(fn), []);

  // Save the data on the device, so the user stays logged in and the demo survives a page reload.
  // Backend team: once the API works, only save the login token here, not all the data.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(withLatestSamplePhotos({ ...initialState, ...(JSON.parse(raw) as State) }));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const notify = (s: State, userId: string, title: string, body: string, href?: string): AppNotification[] => [
    { id: newId('n'), userId, title, body, href, createdAt: now(), read: false },
    ...s.notifications,
  ];

  const actions = useMemo(
    () => ({
      // ---------- Logging in and signing up ----------
      /** Gives back an error message if it fails, or nothing if it worked. */
      login(email: string, _password: string): string | null {
        const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return 'No account found with that email.';
        update((s) => ({ ...s, currentUserId: user.id }));
        return null;
      },
      loginAsDemo(role: Role) {
        const email = role === 'tenant' ? mock.DEMO_TENANT_EMAIL : mock.DEMO_LANDLORD_EMAIL;
        const user = state.users.find((u) => u.email === email);
        if (user) update((s) => ({ ...s, currentUserId: user.id }));
      },
      register(input: { role: Role; fullName: string; email: string; phone: string }): string | null {
        if (state.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return 'An account with this email already exists.';
        }
        const user: User = {
          id: newId('u'),
          ...input,
          email: input.email.trim(),
          contactVerified: false,
          verificationStatus: 'not_submitted',
          createdAt: now(),
        };
        update((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
        return null;
      },
      verifyContact() {
        update((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, contactVerified: true } : u)),
        }));
      },
      logout() {
        update((s) => ({ ...s, currentUserId: null }));
      },
      updateProfile(patch: Partial<Pick<User, 'fullName' | 'phone' | 'occupation'>>) {
        update((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
        }));
      },
      /** Sends the user's ID or landlord documents to the admin team to check. */
      submitVerification() {
        update((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === s.currentUserId ? { ...u, verificationStatus: 'pending', verificationNote: undefined } : u,
          ),
        }));
      },

      // ---------- Tenant applications ----------
      /** Saves a new application or updates an existing one, and gives back its ID. */
      saveApplication(input: ApplicationInput, submit: boolean, existingId?: string): string {
        const id = existingId ?? newId('a');
        update((s) => {
          const status: ApplicationStatus = submit ? 'submitted' : 'draft';
          const existing = s.applications.find((a) => a.id === id);
          const history = submit
            ? [...(existing?.history ?? []), { at: now(), status, by: 'tenant' as const }]
            : existing?.history ?? [];
          const app: RentalApplication = {
            ...input,
            id,
            tenantId: s.currentUserId!,
            status,
            history,
            createdAt: existing?.createdAt ?? now(),
            updatedAt: now(),
          };
          const property = s.properties.find((p) => p.id === input.propertyId);
          return {
            ...s,
            applications: existing
              ? s.applications.map((a) => (a.id === id ? app : a))
              : [app, ...s.applications],
            notifications:
              submit && property
                ? notify(s, property.landlordId, 'New application', `${input.fullName} applied for ${property.title}.`, `/landlord/application/${id}`)
                : s.notifications,
          };
        });
        return id;
      },
      withdrawApplication(id: string) {
        update((s) => ({
          ...s,
          applications: s.applications.map((a) =>
            a.id === id
              ? { ...a, status: 'withdrawn', updatedAt: now(), history: [...a.history, { at: now(), status: 'withdrawn', by: 'tenant' }] }
              : a,
          ),
        }));
      },
      respondToInfoRequest(id: string, response: string, documents: AttachedFile[]) {
        update((s) => ({
          ...s,
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'under_review',
                  infoResponse: response,
                  documents: [...a.documents, ...documents],
                  updatedAt: now(),
                  history: [...a.history, { at: now(), status: 'under_review', by: 'tenant', note: response }],
                }
              : a,
          ),
        }));
      },

      // ---------- Landlord deciding on applications ----------
      setApplicationStatus(id: string, status: ApplicationStatus, note?: string) {
        update((s) => {
          const app = s.applications.find((a) => a.id === id);
          const property = s.properties.find((p) => p.id === app?.propertyId);
          const label = status.replace('_', ' ');
          return {
            ...s,
            applications: s.applications.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status,
                    decisionReason: status === 'rejected' || status === 'waitlisted' ? note : a.decisionReason,
                    infoRequest: status === 'info_requested' ? note : a.infoRequest,
                    infoResponse: status === 'info_requested' ? undefined : a.infoResponse,
                    updatedAt: now(),
                    history: [...a.history, { at: now(), status, by: 'landlord', note }],
                  }
                : a,
            ),
            notifications: app
              ? notify(s, app.tenantId, 'Application update', `${property?.title ?? 'Your application'}: ${label}.`, `/tenant/application/${id}`)
              : s.notifications,
          };
        });
      },

      // ---------- Landlord properties ----------
      addProperty(input: PropertyInput, submitForVerification: boolean): string {
        const id = newId('p');
        update((s) => ({
          ...s,
          properties: [
            {
              ...input,
              id,
              landlordId: s.currentUserId!,
              verificationStatus: submitForVerification ? 'pending' : 'not_submitted',
              listingStatus: submitForVerification ? 'listed' : 'draft',
              createdAt: now(),
            },
            ...s.properties,
          ],
        }));
        return id;
      },
      submitPropertyForVerification(id: string) {
        update((s) => ({
          ...s,
          properties: s.properties.map((p) =>
            p.id === id ? { ...p, verificationStatus: 'pending', listingStatus: 'listed', verificationNote: undefined } : p,
          ),
        }));
      },
      setListingStatus(id: string, listingStatus: Property['listingStatus']) {
        update((s) => ({
          ...s,
          properties: s.properties.map((p) => (p.id === id ? { ...p, listingStatus } : p)),
        }));
      },

      // ---------- Tenancies and rent ----------
      createTenancy(input: TenancyInput, send: boolean): string {
        const id = newId('t');
        update((s) => {
          const app = s.applications.find((a) => a.id === input.applicationId)!;
          const property = s.properties.find((p) => p.id === app.propertyId)!;
          const tenancy: Tenancy = {
            id,
            propertyId: property.id,
            landlordId: property.landlordId,
            tenantId: app.tenantId,
            applicationId: app.id,
            startDate: input.startDate,
            endDate: input.endDate,
            annualRent: input.annualRent,
            schedule: input.schedule,
            deposit: input.deposit,
            clauses: input.clauses,
            agreementStatus: send ? 'sent' : 'draft',
            sentAt: send ? now() : undefined,
            createdAt: now(),
          };
          return {
            ...s,
            tenancies: [tenancy, ...s.tenancies],
            installments: [...s.installments, ...mock.buildInstallments(tenancy)],
            properties: s.properties.map((p) => (p.id === property.id ? { ...p, listingStatus: 'let' } : p)),
            notifications: send
              ? notify(s, app.tenantId, 'Tenancy agreement ready', `Review and sign your agreement for ${property.title}.`, '/tenant/agreement')
              : s.notifications,
          };
        });
        return id;
      },
      sendAgreement(tenancyId: string) {
        update((s) => {
          const t = s.tenancies.find((x) => x.id === tenancyId);
          return {
            ...s,
            tenancies: s.tenancies.map((x) => (x.id === tenancyId ? { ...x, agreementStatus: 'sent', sentAt: now() } : x)),
            notifications: t
              ? notify(s, t.tenantId, 'Tenancy agreement ready', 'Review and sign your tenancy agreement.', '/tenant/agreement')
              : s.notifications,
          };
        });
      },
      signAgreement(tenancyId: string, signature: string) {
        update((s) => {
          const t = s.tenancies.find((x) => x.id === tenancyId);
          return {
            ...s,
            tenancies: s.tenancies.map((x) =>
              x.id === tenancyId ? { ...x, agreementStatus: 'signed', signedAt: now(), tenantSignature: signature } : x,
            ),
            notifications: t
              ? notify(s, t.landlordId, 'Agreement signed', `${signature} signed the tenancy agreement.`, `/landlord/tenancy/${tenancyId}`)
              : s.notifications,
          };
        });
      },
      recordPayment(installmentId: string, input: { paidAt: string; method: PaymentMethod; reference?: string }) {
        update((s) => {
          const receiptNo = `RS-RC-${Math.floor(10000 + Math.random() * 89999)}`;
          const inst = s.installments.find((i) => i.id === installmentId);
          const t = s.tenancies.find((x) => x.id === inst?.tenancyId);
          return {
            ...s,
            installments: s.installments.map((i) =>
              i.id === installmentId ? { ...i, ...input, receiptNo } : i,
            ),
            notifications: t
              ? notify(s, t.tenantId, 'Payment received', `Your landlord recorded a rent payment. Receipt ${receiptNo}.`, `/tenant/receipt/${installmentId}`)
              : s.notifications,
          };
        });
      },

      // ---------- Repairs ----------
      createMaintenance(tenancyId: string, input: MaintenanceInput): string {
        const id = newId('m');
        update((s) => {
          const t = s.tenancies.find((x) => x.id === tenancyId)!;
          const req: MaintenanceRequest = {
            ...input,
            id,
            tenancyId,
            propertyId: t.propertyId,
            tenantId: t.tenantId,
            landlordId: t.landlordId,
            status: 'submitted',
            updates: [{ at: now(), by: 'tenant', status: 'submitted' }],
            createdAt: now(),
          };
          return {
            ...s,
            maintenance: [req, ...s.maintenance],
            notifications: notify(s, t.landlordId, 'New maintenance request', input.title, `/landlord/maintenance/${id}`),
          };
        });
        return id;
      },
      updateMaintenance(
        id: string,
        status: MaintenanceStatus,
        note?: string,
        assignee?: MaintenanceRequest['assignee'],
      ) {
        update((s) => {
          const m = s.maintenance.find((x) => x.id === id);
          return {
            ...s,
            maintenance: s.maintenance.map((x) =>
              x.id === id
                ? {
                    ...x,
                    status,
                    assignee: assignee ?? x.assignee,
                    updates: [...x.updates, { at: now(), by: 'landlord', status, note }],
                  }
                : x,
            ),
            notifications: m
              ? notify(s, m.tenantId, 'Maintenance update', `${m.title}: ${status.replace('_', ' ')}.`, `/tenant/maintenance/${id}`)
              : s.notifications,
          };
        });
      },

      // ---------- Fraud reports ----------
      submitFraudReport(input: FraudInput): FraudReport {
        const report: FraudReport = {
          ...input,
          id: newId('f'),
          reference: `RS-FR-${Math.floor(1000 + Math.random() * 8999)}`,
          reporterId: state.currentUserId!,
          status: 'submitted',
          createdAt: now(),
        };
        update((s) => ({ ...s, fraudReports: [report, ...s.fraudReports] }));
        return report;
      },

      // ---------- Notifications ----------
      markAllNotificationsRead() {
        update((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.userId === s.currentUserId ? { ...n, read: true } : n)),
        }));
      },

      // ---------- Only for the demo ----------
      /** Puts all the sample data back the way it started. You stay logged in. */
      resetDemoData() {
        update((s) => ({ ...initialState, currentUserId: s.currentUserId }));
      },
      /**
       * Pretends the admin team approved the checks, so the demo can carry on.
       * Remove this once the admin dashboard and backend are connected.
       */
      demoApproveVerifications() {
        update((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === s.currentUserId && u.verificationStatus === 'pending' ? { ...u, verificationStatus: 'verified' } : u,
          ),
          properties: s.properties.map((p) =>
            p.landlordId === s.currentUserId && p.verificationStatus === 'pending'
              ? { ...p, verificationStatus: 'verified' }
              : p,
          ),
        }));
      },
    }),
    [state.users, state.currentUserId, update],
  );

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  return { state, currentUser, actions, hydrated };
}

type Store = ReturnType<typeof useAppState>;
const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const store = useAppState();
  // Wait for the saved data to load first, so the welcome screen doesn't flash up on reload.
  if (!store.hydrated) return null;
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}

/** The person who is logged in. Only use this on screens that need a logged-in user. */
export function useCurrentUser(): User {
  const { currentUser } = useStore();
  if (!currentUser) throw new Error('No signed-in user');
  return currentUser;
}

// ---------- Helpers for reading the data ----------

export function installmentStatus(i: Installment): InstallmentStatus {
  if (i.paidAt) return 'paid';
  const d = daysUntil(i.dueDate);
  if (d < 0) return 'overdue';
  if (d <= 30) return 'due_soon';
  return 'upcoming';
}

export function useProperty(id: string | undefined) {
  const { state } = useStore();
  return state.properties.find((p) => p.id === id);
}

export function useUser(id: string | undefined) {
  const { state } = useStore();
  return state.users.find((u) => u.id === id);
}

export function useTenancyInstallments(tenancyId: string | undefined) {
  const { state } = useStore();
  return state.installments
    .filter((i) => i.tenancyId === tenancyId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/**
 * The home the tenant lives in now, if they have one.
 * A signed agreement comes first, so a tenant who is moving keeps seeing their current home,
 * with its rent and repairs, until they sign for the new one.
 */
export function useActiveTenancy() {
  const { state, currentUser } = useStore();
  const mine = state.tenancies.filter((t) => t.tenantId === currentUser?.id && t.agreementStatus !== 'ended');
  const today = todayISO();
  const signed = mine.filter((t) => t.agreementStatus === 'signed');
  return (
    signed.find((t) => t.startDate <= today && t.endDate >= today) ??
    signed.sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ??
    mine[0]
  );
}

/** An agreement the landlord has sent that the tenant still needs to sign, if there is one. */
export function usePendingAgreement() {
  const { state, currentUser } = useStore();
  return state.tenancies.find((t) => t.tenantId === currentUser?.id && t.agreementStatus === 'sent');
}

/** Finds the tenancy to show. If none is asked for, it shows the one waiting to be signed, or else the current home. */
export function useTenantTenancy(id?: string) {
  const { state, currentUser } = useStore();
  const pending = usePendingAgreement();
  const active = useActiveTenancy();
  const byId = id ? state.tenancies.find((t) => t.id === id && t.tenantId === currentUser?.id) : undefined;
  return byId ?? pending ?? active;
}

export function useUnreadCount() {
  const { state, currentUser } = useStore();
  return state.notifications.filter((n) => n.userId === currentUser?.id && !n.read).length;
}

export function rentTotals(installments: Installment[]) {
  let received = 0;
  let outstanding = 0;
  let overdue = 0;
  for (const i of installments) {
    const st = installmentStatus(i);
    if (st === 'paid') received += i.amount;
    else {
      if (st === 'overdue') overdue += i.amount;
      if (st === 'overdue' || st === 'due_soon') outstanding += i.amount;
    }
  }
  const next = installments.find((i) => !i.paidAt);
  return { received, outstanding, overdue, next };
}
