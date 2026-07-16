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
  RELATIONSHIP_STATUSES,
  GENDER_SELF_DESCRIBE_MAX_LENGTH,
  PRONOUN_MAX_LENGTH,
  PRONOUNS_MAX_COUNT,
  WEBSITE_MAX_LENGTH,
  PHONE_NUMBER_MAX_LENGTH,
  SOCIAL_LINKS_MAX,
  SOCIAL_PLATFORMS,
  SOCIAL_LINK_PLATFORM_MAX_LENGTH,
} from '../constants/user.constants.js';
import { SOCIAL_PLATFORM_DOMAINS } from '../constants/socialPlatformCatalog.constants.js';

const socialLinkHostnameMatches = (url: string, domains: string[]): boolean => {
  if (domains.length === 0) return true;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
};

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

export const phoneSchema = z.object({
  dialCode: z.string().trim().min(1, 'Country code is required.'),
  number: z
    .string()
    .trim()
    .max(
      PHONE_NUMBER_MAX_LENGTH,
      `Cannot exceed ${PHONE_NUMBER_MAX_LENGTH} digits.`
    )
    .regex(/^\d*$/, 'Phone number can only contain digits.'),
});

export const basicProfileSchema = userProfileUpdateSchema.extend({
  username: userRegistrationSchema.shape.username,
  phone: phoneSchema.optional(),
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
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(PRONOUN_MAX_LENGTH, `Cannot exceed ${PRONOUN_MAX_LENGTH} characters.`)
      )
      .max(PRONOUNS_MAX_COUNT, `Cannot add more than ${PRONOUNS_MAX_COUNT} pronouns.`)
      .optional(),
    relationshipStatus: z.enum(RELATIONSHIP_STATUSES).optional(),
  })
  .refine(
    (data) =>
      data.gender !== 'others' ||
      (data.genderSelfDescribe && data.genderSelfDescribe.length > 0),
    {
      message: 'Please describe your gender.',
      path: ['genderSelfDescribe'],
    }
  );

const socialLinkSchema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS),
    url: z.url('Enter a valid URL.'),
    customLabel: z
      .string()
      .trim()
      .max(
        SOCIAL_LINK_PLATFORM_MAX_LENGTH,
        `Cannot exceed ${SOCIAL_LINK_PLATFORM_MAX_LENGTH} characters.`
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.platform === 'other') {
      if (!data.customLabel) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a platform name.',
          path: ['customLabel'],
        });
      }
      return;
    }

    const domains = SOCIAL_PLATFORM_DOMAINS[data.platform] ?? [];
    if (!socialLinkHostnameMatches(data.url, domains)) {
      ctx.addIssue({
        code: 'custom',
        message: `URL must be a ${data.platform} link.`,
        path: ['url'],
      });
    }
  });

export const contactLinksSchema = z.object({
  phone: phoneSchema.optional(),
  website: z
    .union([
      z.literal(''),
      z
        .url('Enter a valid URL.')
        .max(WEBSITE_MAX_LENGTH, `Cannot exceed ${WEBSITE_MAX_LENGTH} characters.`),
    ])
    .optional(),
  socialLinks: z.array(socialLinkSchema).max(SOCIAL_LINKS_MAX).optional(),
});
