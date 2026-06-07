import { z } from 'zod';

export const userRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters long.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: 'Name can only contain letters, spaces, and hyphens.',
    }),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(20, { message: 'Username cannot exceed 20 characters.' })
    .regex(/^[a-z0-9_]+$/, {
      message:
        'Username can only contain lowercase letters, numbers, and underscores.',
    }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Invalid email address format.' })),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password cannot exceed 128 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Za-z0-9]/, {
      message: 'Password must contain at least one special character.',
    }),
});

export const userProfileUpdateSchema = z.object({
  name: userRegistrationSchema.shape.name.optional(),

  bio: z
    .string()
    .trim()
    .max(500, { message: 'Bio cannot exceed 500 characters.' })
    .optional(),

  avatarUrl: z
    .string()
    .trim()
    .pipe(z.url({ message: 'Avatar must be a valid URL.' }))
    .refine((url) => url.startsWith('https://'), {
      message: 'Avatar URL must use HTTPS.',
    })
    .optional(),
});
