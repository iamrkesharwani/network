import { z } from 'zod';
import { userRegistrationSchema } from './user.schema.js';

const passwordValidation = userRegistrationSchema.shape.password;
const emailValidation = userRegistrationSchema.shape.email;

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const verifyEmailSchema = z.object({
  email: emailValidation,
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits.' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers.' }),
});

export const requestResetPasswordSchema = z.object({
  email: emailValidation,
});

export const completeResetPasswordSchema = z.object({
  email: emailValidation,
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits.' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers.' }),
  newPassword: passwordValidation,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, { message: 'Current password is required.' }),
    newPassword: passwordValidation,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
  });

export const changeEmailSchema = z.object({
  newEmail: emailValidation,
  password: z
    .string()
    .min(1, { message: 'Password is required to confirm email change.' }),
});

export const refreshSchema = z.object({
  token: z.string().trim().min(1, { message: 'Refresh token is required.' }),
});
