// import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { Resend } from 'resend';
import { SITE_NAME } from '@network/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(env.RESEND_API_KEY);

// const transporter = nodemailer.createTransport({
//   host: env.SMTP_HOST || 'smtp.mailtrap.io',
//   port: Number(env.SMTP_PORT) || 2525,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
// });

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
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
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
  try {
    // await transporter.sendMail({
    //   from: env.EMAIL_FROM || '"Network App" <noreply@network.local>',
    //   to,
    //   subject,
    //   html,
    // });

    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });
    if (error) {
      logger.error(error, `Resend API Error sending to ${to}`);
      throw new Error('Email delivery failed at provider');
    }
    logger.info(`Email sent successfully to ${to} via Resend. ID: ${data?.id}`);
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
  const currentYear = new Date().getFullYear().toString();
  const firstLetter = SITE_NAME.charAt(0).toUpperCase();

  const html = await getHtmlTemplate('verify-email', {
    SITE_NAME,
    USER_NAME: userName,
    OTP_CODE: otp,
    CURRENT_YEAR: currentYear,
    FIRST_LETTER: firstLetter,
  });
  await sendEmail(to, `${otp} is your ${SITE_NAME} verification code`, html);
};

export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  resetUrl: string
): Promise<void> => {
  const html = await getHtmlTemplate('reset-password', {
    SITE_NAME,
    USER_NAME: userName,
    RESET_URL: resetUrl,
  });
  await sendEmail(to, `Reset your ${SITE_NAME} password`, html);
};
