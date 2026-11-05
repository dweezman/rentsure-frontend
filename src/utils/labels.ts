/**
 * The words and colours shown for every status in the app, like "Under review" or "Paid".
 * Change the wording here, so it stays the same on every screen.
 */
import type { Tone } from '@/constants/theme';
import type {
  AgreementStatus,
  ApplicationStatus,
  EmploymentStatus,
  FraudReason,
  FraudReportStatus,
  InstallmentStatus,
  MaintenanceCategory,
  MaintenanceStatus,
  MaintenanceUrgency,
  PaymentMethod,
  PaymentSchedule,
  Property,
  PropertyType,
  VerificationStatus,
} from '@/types/models';

type Meta = { label: string; tone: Tone };

export const verificationMeta: Record<VerificationStatus, Meta> = {
  not_submitted: { label: 'Not submitted', tone: 'neutral' },
  pending: { label: 'Pending review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  more_info: { label: 'More info required', tone: 'info' },
};

export const applicationMeta: Record<ApplicationStatus, Meta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'Submitted', tone: 'info' },
  under_review: { label: 'Under review', tone: 'warning' },
  info_requested: { label: 'Info requested', tone: 'info' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' },
  waitlisted: { label: 'Waitlisted', tone: 'primary' },
};

export const agreementMeta: Record<AgreementStatus, Meta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Awaiting tenant signature', tone: 'warning' },
  signed: { label: 'Signed', tone: 'success' },
  ended: { label: 'Ended', tone: 'neutral' },
};

export const installmentMeta: Record<InstallmentStatus, Meta> = {
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
  due_soon: { label: 'Due soon', tone: 'warning' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
};

export const maintenanceMeta: Record<MaintenanceStatus, Meta> = {
  submitted: { label: 'Submitted', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'primary' },
  rejected: { label: 'Declined', tone: 'danger' },
  assigned: { label: 'Repair assigned', tone: 'warning' },
  in_progress: { label: 'In progress', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
};

export const fraudStatusMeta: Record<FraudReportStatus, Meta> = {
  submitted: { label: 'Submitted', tone: 'info' },
  under_review: { label: 'Under review', tone: 'warning' },
  closed: { label: 'Closed', tone: 'neutral' },
};

export const urgencyMeta: Record<MaintenanceUrgency, Meta> = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'info' },
  high: { label: 'High', tone: 'warning' },
  emergency: { label: 'Emergency', tone: 'danger' },
};

export const listingMeta: Record<Property['listingStatus'], Meta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  listed: { label: 'Listed', tone: 'primary' },
  let: { label: 'Let', tone: 'success' },
  suspended: { label: 'Suspended', tone: 'danger' },
};

export const propertyTypeLabel: Record<PropertyType, string> = {
  apartment: 'Apartment',
  self_contain: 'Self-contain',
  mini_flat: 'Mini flat',
  duplex: 'Duplex',
  bungalow: 'Bungalow',
  shared: 'Shared room',
};

export const employmentLabel: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  student: 'Student',
  unemployed: 'Not working',
  retired: 'Retired',
};

export const scheduleLabel: Record<PaymentSchedule, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannual: 'Every 6 months',
  annual: 'Yearly',
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  card: 'Card',
  cash: 'Cash',
  other: 'Other',
};

export const maintenanceCategoryLabel: Record<MaintenanceCategory, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  structural: 'Walls, roof & doors',
  appliance: 'Appliance',
  security: 'Security & locks',
  pest: 'Pests',
  other: 'Other issue',
};

export const fraudReasonMeta: Record<FraudReason, { label: string; hint: string }> = {
  fake_listing: {
    label: 'Fake listing',
    hint: "The property doesn't exist or isn't available.",
  },
  impersonated_landlord: {
    label: 'Impersonated landlord',
    hint: "Someone is posing as the owner or the owner's agent.",
  },
  duplicate_listing: {
    label: 'Duplicate listing',
    hint: 'The same property is listed by someone else or more than once.',
  },
  suspicious_payment: {
    label: 'Suspicious payment request',
    hint: 'Asked to pay before inspection, or to an unrelated account.',
  },
  misleading_photos: {
    label: 'Misleading photos',
    hint: "Photos don't match the real property.",
  },
  other: { label: 'Something else', hint: 'Any other suspected rental scam.' },
};

export const AMENITIES = [
  'Prepaid meter',
  'Borehole water',
  'Steady power',
  'Generator',
  'Inverter',
  'Parking',
  'Security guard',
  'CCTV',
  'Fenced & gated',
  'POP ceiling',
  'Wardrobes',
  'Kitchen cabinets',
  'Air conditioning',
  'Water heater',
  'Balcony',
  'Swimming pool',
  'Gym',
  'Internet ready',
];

export const NIGERIAN_STATES = ['Lagos', 'Abuja (FCT)', 'Oyo', 'Rivers', 'Ogun', 'Enugu', 'Kaduna', 'Kano'];
