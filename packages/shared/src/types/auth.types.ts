import { z } from 'zod';
import {
  loginSchema,
  verifyEmailSchema,
  requestResetPasswordSchema,
  completeResetPasswordSchema,
  changePasswordSchema,
  changeEmailSchema,
  refreshSchema,
} from '../schemas/auth.schema.js';
import { AUTH_PROVIDERS } from '../constants/user.constants.js';

export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RequestResetPasswordInput = z.infer<
  typeof requestResetPasswordSchema
>;
export type CompleteResetPasswordInput = z.infer<
  typeof completeResetPasswordSchema
>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

export type OAuthProvider = Exclude<(typeof AUTH_PROVIDERS)[number], 'local'>;

export interface IOAuthAccount {
  provider: OAuthProvider;
  providerId: string;
}
