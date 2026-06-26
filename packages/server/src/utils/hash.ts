import { hash, verify } from '@node-rs/argon2';

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password);
};

export const verifyPassword = async (
  hashed: string,
  plain: string
): Promise<boolean> => {
  return verify(hashed, plain);
};
