import { WORD_PATTERN } from '@network/shared';

type SearchTokenSource = string | string[] | undefined;

export const buildSearchTokens = (...fields: SearchTokenSource[]): string[] => {
  const tokens = new Set<string>();

  for (const field of fields) {
    if (!field) continue;
    const values = Array.isArray(field) ? field : [field];
    for (const value of values) {
      const matches = value.toLowerCase().match(WORD_PATTERN);
      if (matches) for (const token of matches) tokens.add(token);
    }
  }

  return Array.from(tokens);
};
