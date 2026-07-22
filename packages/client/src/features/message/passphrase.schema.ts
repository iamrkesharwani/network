import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  otpCodeSchema,
  type MessagePinLength,
} from '@network/shared';

export const passphraseSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Passphrase must be at least ${PASSWORD_MIN_LENGTH} characters.`
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Passphrase cannot exceed ${PASSWORD_MAX_LENGTH} characters.`
  );

export const setPassphraseSchema = z
  .object({
    passphrase: passphraseSchema,
    confirmPassphrase: z.string(),
  })
  .refine((data) => data.passphrase === data.confirmPassphrase, {
    message: 'Passphrases do not match.',
    path: ['confirmPassphrase'],
  });

export type SetPassphraseInput = z.infer<typeof setPassphraseSchema>;

export const confirmAccountPasswordSchema = z.object({
  passphrase: z.string().min(1, 'Password is required.'),
  confirmPassphrase: z.string(),
});

export const enterPassphraseSchema = z.object({
  passphrase: z.string().min(1, 'Passphrase is required.'),
});

export type EnterPassphraseInput = z.infer<typeof enterPassphraseSchema>;

export const otpConfirmSchema = z.object({
  otp: otpCodeSchema,
});

export type OtpConfirmInput = z.infer<typeof otpConfirmSchema>;

export const recoveryTokenSchema = z.object({
  recoveryToken: z.string().min(1, 'Recovery code is required.'),
});

export type RecoveryTokenInput = z.infer<typeof recoveryTokenSchema>;

const pinFieldSchema = (length: MessagePinLength) =>
  z
    .string()
    .length(length, `PIN must be exactly ${length} digits.`)
    .regex(/^\d+$/, 'PIN must contain only numbers.');

export const pinEntrySchema = (length: MessagePinLength) =>
  z.object({ pin: pinFieldSchema(length) });

export interface PinEntryInput {
  pin: string;
}

export const pinSetupSchema = (length: MessagePinLength) =>
  z
    .object({
      pin: pinFieldSchema(length),
      confirmPin: z.string(),
    })
    .refine((data) => data.pin === data.confirmPin, {
      message: 'PINs do not match.',
      path: ['confirmPin'],
    });

export interface PinSetupInput {
  pin: string;
  confirmPin: string;
}
