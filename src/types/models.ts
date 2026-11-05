/**
 * RentSure data models.
 *
 * These types describe what the mobile app expects from the backend.
 * Backend teammates: keep API responses in this shape (or tell the frontend
 * team what changed) so the screens keep working.
 *
 * Dates are ISO strings: 'YYYY-MM-DD' for calendar dates, full ISO for timestamps.
 * Money is a whole number in Naira (no kobo).
 */

export type Role = 'tenant' | 'landlord';

/** Identity / landlord / property verification lifecycle. */
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
  /** Identity verification (tenants) or landlord verification (landlords). */
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
  /** Every other fee the tenant pays up front (agency, legal, service charge…). */
  otherCharges: Charge[];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  requirements: string[];
  inspection: string;
  photos: string[];
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  /** Listing visible to tenants. Draft listings are only visible to the landlord. */
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
  /** Latest landlord request for more information, if any. */
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
  /** Rent for a full year, used to work out each instalment. */
  annualRent: number;
  schedule: PaymentSchedule;
  deposit: number;
  clauses: string[];
  agreementStatus: AgreementStatus;
  sentAt?: string;
  signedAt?: string;
  /** Typed-name e-signature from the tenant. */
  tenantSignature?: string;
  createdAt: string;
}

export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'other';

/** One rent instalment on a tenancy. Status is derived from paidAt + dueDate. */
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
  /** In-app route to open when tapped. */
  href?: string;
}
