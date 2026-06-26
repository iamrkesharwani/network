import { z } from 'zod';

export const userRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .min(3, 'Name must be at least 3 characters.')
    .max(50, 'Name cannot exceed 50 characters.')
    .regex(
      /^[a-zA-Z\s-]+$/,
      'Name can only contain letters, spaces, and hyphens.'
    ),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username cannot exceed 20 characters.')
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only contain lowercase letters, numbers, and underscores.'
    )
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),

  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password cannot exceed 128 characters.')
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[a-z]/, 'Include at least one lowercase letter.')
    .regex(/[0-9]/, 'Include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character.'),
});

export const userProfileUpdateSchema = z.object({
  name: userRegistrationSchema.shape.name.optional(),

  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters.')
    .optional(),

  avatarUrl: z
    .url('Avatar must be a valid URL.')
    .startsWith('https://', 'Avatar URL must use HTTPS.')
    .optional(),
});
