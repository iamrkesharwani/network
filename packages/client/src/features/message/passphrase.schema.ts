import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@network/shared';

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

export const enterPassphraseSchema = z.object({
  passphrase: z.string().min(1, 'Passphrase is required.'),
});

export type EnterPassphraseInput = z.infer<typeof enterPassphraseSchema>;
