import { z } from 'zod';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
} from '../schemas/user.schema.js';

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
