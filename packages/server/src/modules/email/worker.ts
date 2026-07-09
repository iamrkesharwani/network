import { Worker, type Job } from 'bullmq';
import { SITE_NAME, EMAIL_QUEUE_NAME } from '@network/shared';
import { logger } from '../../core/utils/logger.js';
import { env } from '../../core/env/env.js';
import { bullMqConnection } from './connection.js';
import { transporter } from './transporter.js';
import { getHtmlTemplate } from './templates.js';
import type { EmailJobData } from './types.js';

const buildHtml = async (
  job: Job<EmailJobData>
): Promise<{ subject: string; html: string }> => {
  const data = job.data;
  const year = new Date().getFullYear().toString();
  const firstLetter = SITE_NAME.charAt(0).toUpperCase();

  if (data.type === 'otp') {
    const html = await getHtmlTemplate('verify-email', {
      SITE_NAME,
      USER_NAME: data.userName,
      OTP_CODE: data.otp,
      CURRENT_YEAR: year,
      FIRST_LETTER: firstLetter,
    });
    return {
      subject: `${data.otp} is your ${SITE_NAME} verification code`,
      html,
    };
  }

  if (data.type === 'password-reset') {
    const html = await getHtmlTemplate('reset-password', {
      SITE_NAME,
      USER_NAME: data.userName,
      OTP_CODE: data.otp,
      CURRENT_YEAR: year,
      FIRST_LETTER: firstLetter,
    });
    return {
      subject: `${data.otp} is your ${SITE_NAME} password reset code`,
      html,
    };
  }

  return { subject: data.subject, html: data.html };
};

export const startEmailWorker = (): Worker<EmailJobData> => {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { subject, html } = await buildHtml(job);
      const info = await transporter.sendMail({
        from: `${SITE_NAME} <${env.EMAIL_FROM}>`,
        to: job.data.to,
        subject,
        html,
      });
      logger.info(
        `Email sent: type=${job.data.type} to=${job.data.to} messageId=${info.messageId} attempt=${job.attemptsMade + 1}`
      );
    },
    {
      connection: bullMqConnection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, error) => {
    if (!job) return;
    const isFinal = job.attemptsMade >= (job.opts.attempts ?? 1);
    const level = isFinal ? 'error' : 'warn';
    logger[level](
      error,
      `Email job ${isFinal ? 'dead-lettered' : 'will retry'}: type=${job.data.type} to=${job.data.to} attempt=${job.attemptsMade}/${job.opts.attempts}`
    );
  });

  worker.on('error', (error) => {
    logger.error(error, 'Email worker connection error');
  });

  logger.info('Email worker started (concurrency=5)');
  return worker;
};
