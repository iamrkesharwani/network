import { storageProvider, videoProvider } from '../../../providers/provider.js';

export interface IngestFromStorageParams {
  storageKey: string;
  fileName: string;
  fileSizeBytes: number;
  userId: string;
}

export interface IngestFromStorageResult {
  providerVideoId: string;
}

export const ingestFromStorage = async (
  params: IngestFromStorageParams
): Promise<IngestFromStorageResult> => {
  const storageUrl = await storageProvider.buildAccessUrl(params.storageKey);

  return videoProvider.ingestFromUrl({
    storageUrl,
    fileName: params.fileName,
    fileSizeBytes: params.fileSizeBytes,
    userId: params.userId,
  });
};
