import 'express';
import type { UserRole } from '@network/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
      rawBody?: Buffer;
    }
  }
}
