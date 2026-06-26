import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import type { IImageProvider } from '../types.js';

export interface CloudflareImagesConfig {
  accountId: string;
  apiToken: string;
}

export class CloudflareImagesProvider implements IImageProvider {
  private readonly apiUrl: string;
  private readonly authHeader: Record<string, string>;

  private extractImageId(urlOrKey: string): string | null {
    const parts = urlOrKey.replace(/\/public$/, '').split('/');
    return parts.at(-1) ?? null;
  }

  constructor(config: CloudflareImagesConfig) {
    this.apiUrl = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1`;
    this.authHeader = { Authorization: `Bearer ${config.apiToken}` };
  }

  async uploadImage(buffer: Buffer, mimeType: string): Promise<string> {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), 'thumbnail');

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.authHeader,
      body: form,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      logger.error(
        { status: response.status, body },
        'CF Images: upload failed'
      );
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Failed to upload thumbnail to Cloudflare Images.'
      );
    }

    const json = (await response.json()) as {
      success: boolean;
      result?: { variants?: string[] };
    };

    const publicVariant = json.result?.variants?.find((v) =>
      v.endsWith('/public')
    );
    if (!publicVariant) {
      throw new ApiError(
        401,
        'NOT_FOUND',
        'CF Images: no public variant URL in response.'
      );
    }

    return publicVariant;
  }

  async deleteImage(urlOrKey: string): Promise<void> {
    const imageId = this.extractImageId(urlOrKey);
    if (!imageId) {
      logger.warn(
        { urlOrKey },
        'CF Images: could not extract image ID for deletion'
      );
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/${imageId}`, {
        method: 'DELETE',
        headers: this.authHeader,
      });
      if (!response.ok && response.status !== 404) {
        const body = await response.text().catch(() => '');
        logger.warn(
          { imageId, status: response.status, body },
          'CF Images: delete failed'
        );
      }
    } catch (error) {
      logger.warn(error, `CF Images: failed to delete image ${imageId}`);
    }
  }
}
