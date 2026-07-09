import type { Request, Response } from 'express';
import type { MultipartMediaType } from '@network/shared';
import type { NormalizedWebhookPayload } from '../../providers/types.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { videoProvider } from '../../providers/provider.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { logger } from '../../utils/logger.js';
import { shortProcessWebhook } from '../short/services/short.webhook.service.js';
import { videoProcessWebhook } from '../video/services/video.webhook.service.js';
import { postProcessWebhook } from '../post/services/post.webhook.service.js';
import {
  getProviderMediaType,
  setProviderMediaType,
} from './provider-media-index.repository.js';

const webhookHandlers: Record<
  MultipartMediaType,
  (payload: NormalizedWebhookPayload) => Promise<boolean>
> = {
  video: videoProcessWebhook,
  short: shortProcessWebhook,
  post: postProcessWebhook,
};

export const handleMediaWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signatureHeader =
      (req.headers['webhook-signature'] as string | undefined) ??
      (req.headers['mux-signature'] as string | undefined) ??
      (req.headers['x-bunnystream-signature'] as string | undefined);

    const isValid = videoProvider.verifyWebhookSignature({
      rawBody: req.rawBody,
      signatureHeader,
    });

    if (!isValid) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid webhook signature.');
    }

    const payload = videoProvider.parseWebhookPayload(req.body);

    if (!payload) {
      logger.info(
        { body: req.body },
        'Webhook payload ignored (not actionable)'
      );
      res.status(200).json(new ApiResponse(null, 'Acknowledged'));
      return;
    }

    // The common case: we already know which module owns this
    // providerVideoId (set at ingest time), so route to it directly instead
    // of probing video -> short -> post on every single webhook event.
    const knownMediaType = await getProviderMediaType(payload.providerVideoId);
    let handledType: MultipartMediaType | null = null;

    if (knownMediaType && (await webhookHandlers[knownMediaType](payload))) {
      handledType = knownMediaType;
    } else {
      // Index miss (never set, expired, or stale): fall back to the
      // exhaustive probe so a webhook is never silently dropped, and
      // self-heal the index for next time.
      for (const [mediaType, handler] of Object.entries(webhookHandlers) as [
        MultipartMediaType,
        (typeof webhookHandlers)[MultipartMediaType],
      ][]) {
        if (mediaType === knownMediaType) continue;
        if (await handler(payload)) {
          handledType = mediaType;
          break;
        }
      }
    }

    if (handledType) {
      await setProviderMediaType(payload.providerVideoId, handledType);
    } else {
      logger.warn(
        `Webhook for unknown providerVideoId: ${payload.providerVideoId}`
      );
    }

    res.status(200).json(new ApiResponse(null, 'Acknowledged'));
  }
);
