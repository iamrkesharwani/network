import type { Schema } from 'mongoose';
import { buildSearchTokens } from './searchTokens.js';

export const attachSearchTokenHooks = (
  schema: Schema,
  sourceFields: string[]
): void => {
  schema.pre('save', function () {
    const doc = this as unknown as Record<string, unknown>;
    doc['searchTokens'] = buildSearchTokens(
      ...sourceFields.map(
        (field) => doc[field] as string | string[] | undefined
      )
    );
  });

  schema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate() as Record<string, unknown> | null;
    if (!update) return;

    const setClause =
      (update['$set'] as Record<string, unknown> | undefined) ?? {};
    const touchesSourceField = sourceFields.some(
      (field) => field in update || field in setClause
    );
    if (!touchesSourceField) return;

    const current = await this.model.findOne(this.getQuery()).lean();
    const merged = sourceFields.map((field) => {
      const fromSet = setClause[field];
      const fromRoot = update[field];
      const fallback = (current as Record<string, unknown> | null)?.[field];
      return (fromSet ?? fromRoot ?? fallback) as string | string[] | undefined;
    });

    this.set('searchTokens', buildSearchTokens(...merged));
  });
};
