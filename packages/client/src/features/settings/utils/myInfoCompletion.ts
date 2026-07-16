import type { IUser } from '@network/shared';

export interface MyInfoFieldCheck {
  label: string;
  isFilled: (user: IUser) => boolean;
}

export const BASIC_FIELDS: MyInfoFieldCheck[] = [
  { label: 'Bio', isFilled: (user) => !!user.bio },
  { label: 'Avatar', isFilled: (user) => !!user.avatarUrl },
];

export const PERSONAL_FIELDS: MyInfoFieldCheck[] = [
  { label: 'Date of birth', isFilled: (user) => !!user.dateOfBirth },
  { label: 'Gender', isFilled: (user) => !!user.gender },
  { label: 'Pronouns', isFilled: (user) => !!user.pronouns },
];

export const CONTACT_FIELDS: MyInfoFieldCheck[] = [
  { label: 'Location', isFilled: (user) => !!user.location },
  { label: 'Website', isFilled: (user) => !!user.website },
  { label: 'Phone', isFilled: (user) => !!user.phone },
  { label: 'Social links', isFilled: (user) => !!user.socialLinks?.length },
];

export const ALL_MY_INFO_FIELDS: MyInfoFieldCheck[] = [
  ...BASIC_FIELDS,
  ...PERSONAL_FIELDS,
  ...CONTACT_FIELDS,
];

export interface FieldsCompletion {
  filledCount: number;
  totalCount: number;
  percent: number;
  missingLabels: string[];
}

export const computeFieldsCompletion = (
  user: IUser,
  fields: MyInfoFieldCheck[]
): FieldsCompletion => {
  const missing = fields.filter((field) => !field.isFilled(user));
  const filledCount = fields.length - missing.length;

  return {
    filledCount,
    totalCount: fields.length,
    percent: Math.round((filledCount / fields.length) * 100),
    missingLabels: missing.map((field) => field.label),
  };
};
