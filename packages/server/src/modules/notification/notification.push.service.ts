import webpush from 'web-push';
import { env } from '../../core/env/env.js';
import { logger } from '../../core/utils/logger.js';
import * as pushSubscriptionRepository from './pushSubscription.repository.js';

const isVapidConfigured = Boolean(
  env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT
);

if (isVapidConfigured) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT as string,
    env.VAPID_PUBLIC_KEY as string,
    env.VAPID_PRIVATE_KEY as string
  );
} else {
  logger.warn(
    'VAPID keys not configured — Web Push notifications are disabled. Run `npx web-push generate-vapid-keys` and set VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT to enable them.'
  );
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

const isGoneStatus = (statusCode: number | undefined): boolean =>
  statusCode === 404 || statusCode === 410;

export const sendWebPush = async (
  recipientId: string,
  payload: PushPayload
): Promise<void> => {
  if (!isVapidConfigured) return;

  const subscriptions = await pushSubscriptionRepository.findByUserId(
    recipientId
  );
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          body
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;

        if (isGoneStatus(statusCode)) {
          await pushSubscriptionRepository.deleteByEndpoint(
            subscription.endpoint
          );
          return;
        }

        logger.warn(
          error,
          `Failed to send web push to subscription ${subscription.endpoint}`
        );
      }
    })
  );
};
