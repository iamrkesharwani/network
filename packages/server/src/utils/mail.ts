import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { SITE_NAME } from '@network/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = env.NODE_ENV === 'production';

const smtpTransporter = isProduction
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

const resend = !isProduction ? new Resend(env.RESEND_API_KEY) : null;

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const getHtmlTemplate = async (
  templateName: string,
  variables: Record<string, string>
): Promise<string> => {
  try {
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      `${templateName}.html`
    );
    let html = await fs.readFile(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), escapeHtml(value));
    }
    return html;
  } catch (error) {
    logger.error(error, `Failed to load email template: ${templateName}`);
    throw new Error('Template loading failed');
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const from = `${SITE_NAME} <${env.EMAIL_FROM}>`;

  try {
    if (isProduction && smtpTransporter) {
      await smtpTransporter.sendMail({ from, to, subject, html });
      logger.info(`Email sent to ${to} via SMTP`);
    } else if (resend) {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });
      if (error) {
        logger.error(error, `Resend error sending to ${to}`);
        throw new Error('Email delivery failed at provider');
      }
      logger.info(`Email sent to ${to} via Resend. ID: ${data?.id}`);
    }
  } catch (error) {
    logger.error(error, `Failed to send email to ${to}`);
    throw new Error('Email delivery failed');
  }
};

export const sendOtpEmail = async (
  to: string,
  userName: string,
  otp: string
): Promise<void> => {
  const html = await getHtmlTemplate('verify-email', {
    SITE_NAME,
    USER_NAME: userName,
    OTP_CODE: otp,
    CURRENT_YEAR: new Date().getFullYear().toString(),
    FIRST_LETTER: SITE_NAME.charAt(0).toUpperCase(),
  });
  await sendEmail(to, `${otp} is your ${SITE_NAME} verification code`, html);
};

export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  otp: string
): Promise<void> => {
  const html = await getHtmlTemplate('reset-password', {
    SITE_NAME,
    USER_NAME: userName,
    OTP_CODE: otp,
    CURRENT_YEAR: new Date().getFullYear().toString(),
  });
  await sendEmail(to, `${otp} is your ${SITE_NAME} password reset code`, html);
};
