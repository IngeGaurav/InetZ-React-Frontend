import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely — resolves conflicts and deduplicates.
 * This is the canonical utility used by every Shadcn component.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
