import type { z } from 'zod';
import {
  personalDetailsSchema,
  GENDER_OPTIONS,
  type PersonalDetailsInput,
} from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchPersonalDetailsMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../../upload/components/FloatingInput';
import Button from '../../../../shared/ui/primitives/Button';

const genderLabels: Record<(typeof GENDER_OPTIONS)[number], string> = {
  male: 'Male',
  female: 'Female',
  nonbinary: 'Non-binary',
  'self-describe': 'Prefer to self-describe',
  'prefer-not-to-say': 'Prefer not to say',
};

const toDateInputValue = (value: Date | string | undefined): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

type PersonalDetailsFormValues = {
  dateOfBirth?: string;
  gender?: PersonalDetailsInput['gender'];
  genderSelfDescribe?: string;
  pronouns?: string;
};

const PersonalDetailsCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchPersonalDetails, { isLoading }] =
    usePatchPersonalDetailsMutation();

  const {
    register,
    watch,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<PersonalDetailsFormValues, PersonalDetailsInput>({
    schema: personalDetailsSchema as unknown as z.ZodType<
      PersonalDetailsInput,
      PersonalDetailsFormValues
    >,
    defaultValues: {
      gender: user?.gender,
      genderSelfDescribe: user?.genderSelfDescribe ?? '',
      pronouns: user?.pronouns ?? '',
    },
    completenessRules: [],
  });

  const gender = watch('gender');

  const onSubmit = submit(async (data) => {
    await patchPersonalDetails(data).unwrap();
  });

  if (!user) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 border-b border-border pb-8 last:mb-0 last:border-0 last:pb-0"
    >
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Personal details
      </h3>

      <FloatingInput
        label="Date of birth"
        type="date"
        defaultValue={toDateInputValue(user.dateOfBirth)}
        {...register('dateOfBirth')}
        error={errors.dateOfBirth?.message}
      />

      <div className="relative mb-6 text-left field-root">
        <select
          {...register('gender')}
          className="field-input w-full border-0 border-b border-white/9 bg-transparent px-[0.1rem] py-[0.55rem] pb-[0.65rem] text-base font-medium text-text-primary outline-none transition-colors duration-300"
        >
          <option value="">Prefer not to say</option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {genderLabels[option]}
            </option>
          ))}
        </select>
        {errors.gender?.message && (
          <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
            {errors.gender.message}
          </p>
        )}
      </div>

      {gender === 'self-describe' && (
        <FloatingInput
          label="Describe your gender"
          {...register('genderSelfDescribe')}
          error={errors.genderSelfDescribe?.message}
        />
      )}

      <FloatingInput
        label="Pronouns"
        {...register('pronouns')}
        error={errors.pronouns?.message}
      />

      {submitError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isLoading}>
        Save
      </Button>
    </form>
  );
};

export default PersonalDetailsCard;
