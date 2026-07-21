import type { Request } from 'express';

export const getPlaylistIdParam = (req: Request): string =>
  req.params['playlistId'] as string;

export const getItemIdParam = (req: Request): string =>
  req.params['itemId'] as string;

export const getUsernameParam = (req: Request): string =>
  req.params['username'] as string;
