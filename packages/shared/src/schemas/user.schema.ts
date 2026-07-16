import { z } from 'zod';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  NAME_MIN_LENGTH,
  MIN_AGE_YEARS,
  GENDER_OPTIONS,
  GENDER_SELF_DESCRIBE_MAX_LENGTH,
  PRONOUNS_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  WEBSITE_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  SOCIAL_LINKS_MAX,
  SOCIAL_LINK_PLATFORM_MAX_LENGTH,
} from '../constants/user.constants.js';

export const userRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .min(
      NAME_MIN_LENGTH,
      `Name must be at least ${NAME_MIN_LENGTH} characters.`
    )
    .max(NAME_MAX_LENGTH, `Name cannot exceed ${NAME_MAX_LENGTH} characters.`)
    .regex(
      /^[a-zA-Z\s-]+$/,
      'Name can only contain letters, spaces, and hyphens.'
    ),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(
      USERNAME_MIN_LENGTH,
      `Username must be at least ${USERNAME_MIN_LENGTH} characters.`
    )
    .max(
      USERNAME_MAX_LENGTH,
      `Username cannot exceed ${USERNAME_MAX_LENGTH} characters.`
    )
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
    .max(
      EMAIL_MAX_LENGTH,
      `Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`
    )
    .check(z.email('Enter a valid email address.')),

  password: z
    .string()
    .min(1, 'Password is required.')
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`
    )
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[a-z]/, 'Include at least one lowercase letter.')
    .regex(/[0-9]/, 'Include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character.'),
});

export const usernameParamSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters.`)
    .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters.`),
});

export const userProfileUpdateSchema = z.object({
  name: userRegistrationSchema.shape.name.optional(),

  bio: z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `Bio cannot exceed ${BIO_MAX_LENGTH} characters.`)
    .optional(),

  avatarUrl: z
    .url('Avatar must be a valid URL.')
    .startsWith('https://', 'Avatar URL must use HTTPS.')
    .optional(),
});

export const basicProfileSchema = userProfileUpdateSchema.extend({
  username: userRegistrationSchema.shape.username,
});

const latestAllowedBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_AGE_YEARS);
  return date;
};

export const personalDetailsSchema = z
  .object({
    dateOfBirth: z.coerce
      .date()
      .max(
        latestAllowedBirthDate(),
        `You must be at least ${MIN_AGE_YEARS} years old.`
      )
      .optional(),
    gender: z.enum(GENDER_OPTIONS).optional(),
    genderSelfDescribe: z
      .string()
      .trim()
      .max(
        GENDER_SELF_DESCRIBE_MAX_LENGTH,
        `Cannot exceed ${GENDER_SELF_DESCRIBE_MAX_LENGTH} characters.`
      )
      .optional(),
    pronouns: z
      .string()
      .trim()
      .max(PRONOUNS_MAX_LENGTH, `Cannot exceed ${PRONOUNS_MAX_LENGTH} characters.`)
      .optional(),
  })
  .refine(
    (data) =>
      data.gender !== 'self-describe' ||
      (data.genderSelfDescribe && data.genderSelfDescribe.length > 0),
    {
      message: 'Please describe your gender.',
      path: ['genderSelfDescribe'],
    }
  );

const socialLinkSchema = z.object({
  platform: z
    .string()
    .trim()
    .min(1, 'Platform is required.')
    .max(
      SOCIAL_LINK_PLATFORM_MAX_LENGTH,
      `Cannot exceed ${SOCIAL_LINK_PLATFORM_MAX_LENGTH} characters.`
    ),
  url: z.url('Enter a valid URL.'),
});

export const contactLinksSchema = z.object({
  location: z
    .string()
    .trim()
    .max(LOCATION_MAX_LENGTH, `Cannot exceed ${LOCATION_MAX_LENGTH} characters.`)
    .optional(),
  website: z
    .url('Enter a valid URL.')
    .max(WEBSITE_MAX_LENGTH, `Cannot exceed ${WEBSITE_MAX_LENGTH} characters.`)
    .optional(),
  socialLinks: z.array(socialLinkSchema).max(SOCIAL_LINKS_MAX).optional(),
  phone: z
    .string()
    .trim()
    .max(PHONE_MAX_LENGTH, `Cannot exceed ${PHONE_MAX_LENGTH} characters.`)
    .optional(),
});
