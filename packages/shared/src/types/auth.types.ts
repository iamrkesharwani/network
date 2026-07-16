import { z } from 'zod';
import {
  loginSchema,
  verifyEmailSchema,
  requestResetPasswordSchema,
  completeResetPasswordSchema,
  changePasswordSchema,
  changeEmailSchema,
  confirmEmailChangeSchema,
  confirmAddPasswordSchema,
  refreshSchema,
} from '../schemas/auth.schema.js';
import { AUTH_PROVIDERS } from '../constants/auth.constants.js'; 

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
export type ConfirmEmailChangeInput = z.infer<typeof confirmEmailChangeSchema>;
export type ConfirmAddPasswordInput = z.infer<typeof confirmAddPasswordSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

export type OAuthProvider = Exclude<(typeof AUTH_PROVIDERS)[number], 'local'>;

export interface IOAuthAccount {
  provider: OAuthProvider;
  providerId: string;
}
