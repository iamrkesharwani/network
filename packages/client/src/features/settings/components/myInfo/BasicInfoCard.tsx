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

const BasicInfoCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchBasicProfile, { isLoading }] = usePatchBasicProfileMutation();

  const {
    register,
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
    },
    completenessRules: [],
  });

  const bio = watch('bio') ?? '';

  const onSubmit = submit(async (data) => {
    await patchBasicProfile({
      name: data.name,
      username: data.username,
      bio: data.bio,
    }).unwrap();
  });

  if (!user) return null;

  return (
    <form onSubmit={onSubmit} className="max-w-lg">
      <MyInfoFormHeader title="Basic" />

      <AvatarEditor currentAvatarUrl={user.avatarUrl} name={user.name} />

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
    </form>
  );
};

export default BasicInfoCard;
