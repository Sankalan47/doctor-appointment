// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

// Combine classnames with Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date from ISO string
export function formatDate(date: string | Date, formatString: string = 'PPP') {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
}

// Format time from ISO string
export function formatTime(date: string | Date, formatString: string = 'p') {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Get user initials
export function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// Truncate text
export function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Validate email
export function isValidEmail(email: string) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

// Role-based authorization check
export function hasPermission(userRole: string, requiredRoles: string[]) {
  return requiredRoles.includes(userRole);
}

// Generate a time slot list for appointments
export function generateTimeSlots(
  startTime: string = '08:00',
  endTime: string = '18:00',
  intervalMinutes: number = 30
) {
  const slots = [];
  let start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  while (start < end) {
    slots.push(format(start, 'HH:mm'));
    start = new Date(start.getTime() + intervalMinutes * 60000);
  }

  return slots;
}

// Filter object properties by key
export function filterObjectByKeys(obj: Record<string, any>, keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
}

// Sleep helper (for development/testing)
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse error messages from API
export function parseErrorMessage(error: any): string {
  // Handle axios error responses
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle error objects with message property
  if (error.message) {
    return error.message;
  }

  // Fallback error message
  return 'An unexpected error occurred.';
}

// Group array items by property
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | Date): number {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Convert 24h time format to 12h format
export function to12HourFormat(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12
  return `${displayHour}:${minutes} ${suffix}`;
}
