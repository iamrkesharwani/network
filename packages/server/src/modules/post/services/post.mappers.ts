import type { IPostResponse } from '@network/shared';
import { PostModel, type IPostDocument } from '../post.model.js';

export const toResponse = (doc: IPostDocument): IPostResponse =>
  doc.toJSON() as IPostResponse;

export const toResponseFromLean = (doc: IPostDocument): IPostResponse =>
  PostModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as IPostResponse;
