export type EmailJobName = 'otp' | 'password-reset' | 'generic';

export interface OtpEmailJob {
  type: 'otp';
  to: string;
  userName: string;
  otp: string;
}

export interface PasswordResetEmailJob {
  type: 'password-reset';
  to: string;
  userName: string;
  otp: string;
}

export interface GenericEmailJob {
  type: 'generic';
  to: string;
  subject: string;
  html: string;
}

export type EmailJobData = OtpEmailJob | PasswordResetEmailJob | GenericEmailJob;
