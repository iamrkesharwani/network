import type { IShortResponse } from '@network/shared';
import { ShortModel, type IShortDocument } from '../short.model.js';

export const uploadSessionKey = (storageKey: string): string =>
  `short_upload_session:${storageKey}`;

export const toResponse = (doc: IShortDocument): IShortResponse =>
  doc.toJSON() as IShortResponse;

export const toResponseFromLean = (doc: IShortDocument): IShortResponse =>
  ShortModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as IShortResponse;
