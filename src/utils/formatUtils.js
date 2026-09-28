import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS } from '@/constants/appConstants';

export const formatDate = (date, fmt = DATE_FORMATS.DISPLAY) => {
  if (!date) {
    return '';
  }
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, fmt) : '';
  } catch {
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) {
    return '';
  }
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
  } catch {
    return '';
  }
};

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) {
    return '';
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatNumber = (n, locale = 'en-US') => {
  if (n === null || n === undefined) {
    return '';
  }
  return new Intl.NumberFormat(locale).format(n);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
};

export const truncate = (str, maxLength = 50) => {
  if (!str) {
    return '';
  }
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
};

export const capitalize = (str) => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const initials = (name) => {
  if (!name) {
    return '';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};
