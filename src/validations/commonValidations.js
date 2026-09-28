import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,15}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const urlSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''));

export const requiredString = (field = 'This field') => z.string().min(1, `${field} is required`);

export const optionalString = z.string().optional().or(z.literal(''));

export const positiveNumber = (field = 'Value') =>
  z
    .number({ invalid_type_error: `${field} must be a number` })
    .positive(`${field} must be positive`);

export const dateSchema = z.coerce.date({ invalid_type_error: 'Please select a valid date' });

export const fileSchema = (maxSizeMB = 5, accept = []) =>
  z
    .instanceof(File)
    .refine((f) => f.size <= maxSizeMB * 1024 * 1024, `File must be smaller than ${maxSizeMB}MB`)
    .refine(
      (f) => (accept.length === 0 ? true : accept.includes(f.type)),
      accept.length > 0 ? `Accepted formats: ${accept.join(', ')}` : 'Invalid file type'
    );
