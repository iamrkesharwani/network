import { storageProvider, videoProvider } from '../../../core/providers/provider.js';
import type { IngestVideoResult } from '../../../core/providers/types.js';

export interface IngestFromStorageParams {
  storageKey: string;
  fileName: string;
  fileSizeBytes: number;
  userId: string;
}

export const ingestFromStorage = async (
  params: IngestFromStorageParams
): Promise<IngestVideoResult> => {
  const storageUrl = await storageProvider.buildAccessUrl(params.storageKey);

  return videoProvider.ingestFromUrl({
    storageUrl,
    fileName: params.fileName,
    fileSizeBytes: params.fileSizeBytes,
    userId: params.userId,
  });
};
