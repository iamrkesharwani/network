import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { videoProvider } from '../../providers/provider.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { logger } from '../../utils/logger.js';
import { shortProcessWebhook } from '../short/services/short.webhook.service.js';
import { videoProcessWebhook } from '../video/services/video.webhook.service.js';
import { postProcessWebhook } from '../post/services/post.webhook.service.js';

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

    const handledAsVideo = await videoProcessWebhook(payload);

    const handledAsShort = handledAsVideo
      ? false
      : await shortProcessWebhook(payload);

    const handledAsPost =
      handledAsVideo || handledAsShort
        ? false
        : await postProcessWebhook(payload);

    if (!handledAsVideo && !handledAsShort && !handledAsPost) {
      logger.warn(
        `Webhook for unknown providerVideoId: ${payload.providerVideoId}`
      );
    }

    res.status(200).json(new ApiResponse(null, 'Acknowledged'));
  }
);
