import type { IVideoResponse } from '@network/shared';
import { VideoModel, type IVideoDocument } from '../video.model.js';

export const uploadSessionKey = (storageKey: string): string =>
  `video_upload_session:${storageKey}`;

export const toResponse = (doc: IVideoDocument): IVideoResponse =>
  doc.toJSON() as IVideoResponse;

export const toResponseFromLean = (doc: IVideoDocument): IVideoResponse =>
  VideoModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as IVideoResponse;
