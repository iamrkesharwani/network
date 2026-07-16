import { motion } from 'framer-motion';
import { basicProfileSchema, type BasicProfileInput } from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchBasicProfileMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../../upload/components/FloatingInput';
import FloatingTextarea from '../../../upload/components/FloatingTextarea';
import Button from '../../../../shared/ui/primitives/Button';
import AvatarEditor from '../AvatarEditor';
import UsernameField from '../UsernameField';
import MyInfoFormHeader from './MyInfoFormHeader';
import EmailChangeField from './EmailChangeField';
import PhoneField from './PhoneField';

const BasicInfoCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchBasicProfile, { isLoading }] = usePatchBasicProfileMutation();

  const {
    register,
    control,
    watch,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<BasicProfileInput, BasicProfileInput>({
    schema: basicProfileSchema,
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      phone: user?.phone,
    },
    completenessRules: [],
  });

  const bio = watch('bio') ?? '';

  const onSubmit = submit(async (data) => {
    await patchBasicProfile(data).unwrap();
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
      <MyInfoFormHeader title="Basic info" />

      <div className="mb-6 flex justify-center">
        <AvatarEditor currentAvatarUrl={user.avatarUrl} name={user.name} />
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FloatingInput
          label="Name"
          {...register('name')}
          error={errors.name?.message}
        />

        <UsernameField
          registration={register('username')}
          error={errors.username?.message}
          usernameChangedAt={user.usernameChangedAt}
        />

        <EmailChangeField />

        <PhoneField
          control={control}
          errors={errors}
          hasExistingPhone={Boolean(user.phone?.number)}
        />
      </div>

      <FloatingTextarea
        label="Bio"
        rows={3}
        {...register('bio')}
        error={errors.bio?.message}
        counter={{ current: bio.length, max: 160 }}
      />

      {submitError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isLoading}>
        Save
      </Button>
    </motion.form>
  );
};

export default BasicInfoCard;
