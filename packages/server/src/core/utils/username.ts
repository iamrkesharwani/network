import { ApiError } from './ApiError.js';
import { USERNAME_MAX_GENERATION_ATTEMPTS } from '@network/shared';

export const generateUsername = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}${suffix}`;
};

export const generateUniqueUsername = async (
  name: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> => {
  for (let attempt = 0; attempt < USERNAME_MAX_GENERATION_ATTEMPTS; attempt++) {
    const candidate = generateUsername(name);
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  throw new ApiError(
    500,
    'INTERNAL_SERVER_ERROR',
    'Could not generate a unique username. Please try again.'
  );
};
