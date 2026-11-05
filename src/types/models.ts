/**
 * The shape of every piece of data in the app: users, properties, applications, rent and so on.
 *
 * Backend team: please send data from the API in these shapes. If you need to change one,
 * let the frontend team know, because the screens rely on them.
 *
 * Dates are written as text. Plain dates look like '2026-11-25'. Exact times include the time of day too.
 * Money is a whole number of Naira, with no kobo.
 */

export type Role = 'tenant' | 'landlord';

/** The steps a verification goes through, for a person or a property. */
export type VerificationStatus =
  | 'not_submitted'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'more_info';

export interface User {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  contactVerified: boolean;
  /** For tenants this is their ID check. For landlords it is their landlord check. */
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  avatarUrl?: string;
  occupation?: string;
  createdAt: string;
}

export type PropertyType =
  | 'apartment'
  | 'self_contain'
  | 'mini_flat'
  | 'duplex'
  | 'bungalow'
  | 'shared';

export type RentPeriod = 'month' | 'year';

export interface Charge {
  label: string;
  amount: number;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  type: PropertyType;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  rent: number;
  rentPeriod: RentPeriod;
  deposit: number;
  /** Any other fees the tenant pays at the start, such as agency, legal or service charges. */
  otherCharges: Charge[];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  requirements: string[];
  inspection: string;
  photos: string[];
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  /** Whether tenants can see this listing. Only the landlord can see a draft. */
  listingStatus: 'draft' | 'listed' | 'let' | 'suspended';
  createdAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'info_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'waitlisted';

export type EmploymentStatus = 'employed' | 'self_employed' | 'student' | 'unemployed' | 'retired';

export interface AttachedFile {
  id: string;
  name: string;
  uri: string;
  kind: 'image' | 'document';
}

export interface ApplicationEvent {
  at: string;
  status: ApplicationStatus;
  by: Role;
  note?: string;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  tenantId: string;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  phone: string;
  employmentStatus: EmploymentStatus;
  employer?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  moveInDate: string;
  occupants: number;
  message?: string;
  documents: AttachedFile[];
  /** The landlord's most recent request for more information, if there is one. */
  infoRequest?: string;
  infoResponse?: string;
  decisionReason?: string;
  history: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentSchedule = 'monthly' | 'quarterly' | 'biannual' | 'annual';

export type AgreementStatus = 'draft' | 'sent' | 'signed' | 'ended';

export interface Tenancy {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  applicationId: string;
  startDate: string;
  endDate: string;
  /** The rent for a whole year. Each payment amount is worked out from this. */
  annualRent: number;
  schedule: PaymentSchedule;
  deposit: number;
  clauses: string[];
  agreementStatus: AgreementStatus;
  sentAt?: string;
  signedAt?: string;
  /** The tenant signs by typing their full name. */
  tenantSignature?: string;
  createdAt: string;
}

export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'other';

/** One rent payment in a tenancy. Whether it is paid, due or late is worked out from its dates. */
export interface Installment {
  id: string;
  tenancyId: string;
  dueDate: string;
  amount: number;
  paidAt?: string;
  method?: PaymentMethod;
  reference?: string;
  receiptNo?: string;
}

export type InstallmentStatus = 'paid' | 'overdue' | 'due_soon' | 'upcoming';

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'structural'
  | 'appliance'
  | 'security'
  | 'pest'
  | 'other';

export type MaintenanceUrgency = 'low' | 'medium' | 'high' | 'emergency';

export type MaintenanceStatus =
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export interface MaintenanceUpdate {
  at: string;
  by: Role;
  status: MaintenanceStatus;
  note?: string;
}

export interface MaintenanceRequest {
  id: string;
  tenancyId: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  urgency: MaintenanceUrgency;
  photos: string[];
  status: MaintenanceStatus;
  assignee?: { name: string; phone: string; scheduledFor?: string };
  updates: MaintenanceUpdate[];
  createdAt: string;
}

export type FraudReason =
  | 'fake_listing'
  | 'impersonated_landlord'
  | 'duplicate_listing'
  | 'suspicious_payment'
  | 'misleading_photos'
  | 'other';

export type FraudReportStatus = 'submitted' | 'under_review' | 'closed';

export interface FraudReport {
  id: string;
  reference: string;
  reporterId: string;
  propertyId?: string;
  landlordId?: string;
  reason: FraudReason;
  description: string;
  evidence: AttachedFile[];
  status: FraudReportStatus;
  outcome?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** The screen to open when the notification is tapped. */
  href?: string;
}
