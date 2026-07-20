import type { ICommentResponse } from '@network/shared';
import { CommentModel, type ICommentDocument } from './comment.model.js';

export const toResponse = (doc: ICommentDocument): ICommentResponse =>
  doc.toJSON() as unknown as ICommentResponse;

export const toResponseFromLean = (doc: ICommentDocument): ICommentResponse =>
  CommentModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as ICommentResponse;
