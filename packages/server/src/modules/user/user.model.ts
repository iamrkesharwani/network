import mongoose, { Schema, type Document } from 'mongoose';
import {
  USER_ROLES,
  AUTH_PROVIDERS,
  type UserRole,
  type AuthProvider,
} from '@network/shared';

export interface IUserDocument extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  isEmailVerified: boolean;
  authProviders: AuthProvider[];
  googleId?: string;
  appleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    bio: {
      type: String,
      maxlength: 160,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProviders: [
      {
        type: String,
        enum: AUTH_PROVIDERS,
        required: true,
      },
    ],
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    appleId: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ appleId: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
