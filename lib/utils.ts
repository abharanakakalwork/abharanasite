import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 * This prevents the common "previous day" bug caused by .toISOString()
 */
export function formatDateLocal(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts HH:mm (24h) to h:mm A (12h)
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  const mStr = String(minute).padStart(2, '0');
  return `${h12}:${mStr} ${ampm}`;
}

/**
 * Validates an email address format.
 */
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates a phone number (Supports optional + and 10-12 digits).
 */
export const validatePhone = (phone: string) => {
  // Strip spaces and check for 10-12 digits
  const cleanPhone = phone.replace(/\s/g, '');
  return /^\+?[0-9]{10,12}$/.test(cleanPhone);
};

/**
 * Calculates the expiration date (exactly 30 days from now).
 */
export function calculateExpiryDate(startDate: Date = new Date()): Date {
  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

/**
 * Calculates the reminder date (default 3 days before expiration).
 */
export function calculateReminderDate(expiryDate: Date, daysBefore: number = 3): Date {
  const reminder = new Date(expiryDate);
  reminder.setDate(reminder.getDate() - daysBefore);
  return reminder;
}

