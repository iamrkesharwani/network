import { z } from 'zod';
import { userRegistrationSchema } from '../user/schema/user.schema.js';
import { PASSWORD_MAX_LENGTH } from '../user/constants/user.constants.js';

const passwordValidation = userRegistrationSchema.shape.password;
const emailValidation = userRegistrationSchema.shape.email;

const currentPasswordValidation = z
  .string()
  .min(1, 'Password is required.')
  .max(
    PASSWORD_MAX_LENGTH,
    `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`
  );

export const loginSchema = z.object({
  email: emailValidation,
  password: currentPasswordValidation,
});

export const otpCodeSchema = z
  .string()
  .min(1, 'OTP is required.')
  .length(6, 'OTP must be exactly 6 digits.')
  .regex(/^\d+$/, 'OTP must contain only numbers.');

export const verifyEmailSchema = z.object({
  email: emailValidation,
  otp: otpCodeSchema,
});

export const requestResetPasswordSchema = z.object({
  email: emailValidation,
});

export const completeResetPasswordSchema = z.object({
  email: emailValidation,
  otp: otpCodeSchema,
  newPassword: passwordValidation,
});

export const changePasswordSchema = z
  .object({
    oldPassword: currentPasswordValidation,
    newPassword: passwordValidation,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from the current one.',
    path: ['newPassword'],
  });

export const changeEmailSchema = z.object({
  newEmail: emailValidation,
  password: currentPasswordValidation,
});

export const confirmEmailChangeSchema = z.object({
  oldEmailOtp: otpCodeSchema,
  newEmailOtp: otpCodeSchema,
});

export const confirmAddPasswordSchema = z.object({
  otp: otpCodeSchema,
  newPassword: passwordValidation,
});

export const refreshSchema = z.object({
  token: z.string().trim().min(1, 'Refresh token is required.'),
});
