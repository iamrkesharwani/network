import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Cake, HeartHandshake, MessageCircle, Users2 } from 'lucide-react';
import type { z } from 'zod';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchPersonalDetailsMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import BorderedInput from '../general/BorderedInput';
import Select from '../../../../shared/ui/primitives/Select';
import DatePicker from '../../../../shared/ui/calendar/DatePicker';
import Button from '../../../../shared/ui/primitives/Button';
import MyInfoFormHeader from './MyInfoFormHeader';
import PronounsInput from './PronounsInput';
import SaveSuccessModal from '../general/SaveSuccessModal';
import {
  personalDetailsSchema,
  GENDER_OPTIONS,
  RELATIONSHIP_STATUSES,
  MIN_AGE_YEARS,
  type PersonalDetailsInput,
} from '@network/shared';

const genderLabels: Record<(typeof GENDER_OPTIONS)[number], string> = {
  male: 'Male',
  female: 'Female',
  others: 'Others',
  'prefer-not-to-say': 'Prefer not to say',
};

const relationshipLabels: Record<
  (typeof RELATIONSHIP_STATUSES)[number],
  string
> = {
  single: 'Single',
  'in-a-relationship': 'In a relationship',
  engaged: 'Engaged',
  married: 'Married',
  'prefer-not-to-say': 'Prefer not to say',
};

const maxBirthDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_AGE_YEARS);
  return date;
})();

const PersonalDetailsCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchPersonalDetails, { isLoading }] =
    usePatchPersonalDetailsMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    control,
    watch,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<PersonalDetailsInput, PersonalDetailsInput>({
    schema: personalDetailsSchema as unknown as z.ZodType<
      PersonalDetailsInput,
      PersonalDetailsInput
    >,
    defaultValues: {
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      genderSelfDescribe: user?.genderSelfDescribe ?? '',
      pronouns: user?.pronouns ?? [],
      relationshipStatus: user?.relationshipStatus,
    },
    completenessRules: [],
  });

  const gender = watch('gender');

  const onSubmit = submit(async (data) => {
    await patchPersonalDetails(data).unwrap();
    setShowSuccess(true);
  });

  if (!user) return null;

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={onSubmit}
      className="max-w-2xl"
    >
      <MyInfoFormHeader title="Personal" />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <DatePicker
              label="Date of birth"
              icon={Cake}
              value={field.value}
              onChange={field.onChange}
              maxDate={maxBirthDate}
              error={errors.dateOfBirth?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select
              label="Gender"
              icon={Users2}
              value={field.value}
              onChange={field.onChange}
              options={GENDER_OPTIONS.map((option) => ({
                value: option,
                label: genderLabels[option],
              }))}
              placeholder="Prefer not to say"
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="pronouns"
          render={({ field }) => (
            <PronounsInput
              icon={MessageCircle}
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.pronouns?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="relationshipStatus"
          render={({ field }) => (
            <Select
              label="Relationship status"
              icon={HeartHandshake}
              value={field.value}
              onChange={field.onChange}
              options={RELATIONSHIP_STATUSES.map((option) => ({
                value: option,
                label: relationshipLabels[option],
              }))}
              placeholder="Prefer not to say"
              error={errors.relationshipStatus?.message}
            />
          )}
        />
      </div>

      {gender === 'others' && (
        <BorderedInput
          label="Describe your gender"
          placeholder="How do you describe your gender?"
          {...register('genderSelfDescribe')}
          error={errors.genderSelfDescribe?.message}
        />
      )}

      {submitError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
        Save
      </Button>

      <SaveSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </motion.form>
  );
};

export default PersonalDetailsCard;
