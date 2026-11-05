import type { PaymentSchedule, RentPeriod } from '@/types/models';

export function formatMoney(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/** ₦1.2M / ₦850k — for tight spaces like cards. */
export function formatMoneyShort(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return '₦' + (Number.isInteger(m) ? m : m.toFixed(1)) + 'M';
  }
  if (amount >= 1_000) return '₦' + Math.round(amount / 1_000) + 'k';
  return '₦' + amount;
}

export function periodLabel(period: RentPeriod): string {
  return period === 'year' ? '/year' : '/month';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDate(value: string): Date {
  // 'YYYY-MM-DD' is parsed as local time so dates don't shift by a day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function formatDate(value: string): string {
  const d = parseDate(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value: string): string {
  const d = parseDate(value);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${formatDate(value)}, ${hh}:${mm}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addMonths(iso: string, months: number): string {
  const d = parseDate(iso);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

export function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole days from today until the date (negative if in the past). */
export function daysUntil(iso: string): number {
  const today = parseDate(todayISO()).getTime();
  return Math.round((parseDate(iso).getTime() - today) / 86_400_000);
}

export function relativeDays(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDate(value);
  return !isNaN(d.getTime()) && toISODate(d) === value;
}

export const scheduleMonths: Record<PaymentSchedule, number> = {
  monthly: 1,
  quarterly: 3,
  biannual: 6,
  annual: 12,
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isPhone(v: string): boolean {
  return /^\+?[0-9\s-]{10,15}$/.test(v.trim());
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
