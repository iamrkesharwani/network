import { Controller, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import {
  contactLinksSchema,
  SOCIAL_LINKS_MAX,
  SOCIAL_PLATFORMS,
  type ContactLinksInput,
} from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchContactLinksMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../../upload/components/FloatingInput';
import Select from '../../../../shared/ui/primitives/Select';
import Button from '../../../../shared/ui/primitives/Button';
import MyInfoFormHeader from './MyInfoFormHeader';
import LocationSection from './LocationSection';
import { socialPlatformMeta } from '../../utils/socialPlatformMeta';

const socialPlatformOptions = SOCIAL_PLATFORMS.map((platform) => ({
  value: platform,
  label: socialPlatformMeta[platform].label,
  icon: socialPlatformMeta[platform].icon,
}));

const ContactLinksCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchContactLinks, { isLoading }] = usePatchContactLinksMutation();

  const {
    register,
    control,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<ContactLinksInput, ContactLinksInput>({
    schema: contactLinksSchema,
    defaultValues: {
      website: user?.website ?? '',
      socialLinks: user?.socialLinks ?? [],
    },
    completenessRules: [],
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialLinks',
  });

  const onSubmit = submit(async (data) => {
    await patchContactLinks(data).unwrap();
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
      <MyInfoFormHeader title="Contact & Links" />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <LocationSection />

        <FloatingInput
          label="Website"
          {...register('website')}
          error={errors.website?.message}
        />
      </div>

      <div className="mb-6">
        <p className="mb-2.5 text-sm font-medium text-text-secondary">
          Social links
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="mb-3 flex items-start gap-2">
            <Controller
              control={control}
              name={`socialLinks.${index}.platform`}
              render={({ field: platformField }) => (
                <Select
                  value={platformField.value}
                  onChange={platformField.onChange}
                  options={socialPlatformOptions}
                  containerClassName="mb-0 w-40 shrink-0"
                  error={errors.socialLinks?.[index]?.platform?.message}
                />
              )}
            />
            <FloatingInput
              label="URL"
              containerClassName="mb-0 flex-1"
              {...register(`socialLinks.${index}.url`)}
              error={errors.socialLinks?.[index]?.url?.message}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label="Remove social link"
              className="mt-2.5 shrink-0 rounded-md p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {fields.length < SOCIAL_LINKS_MAX && (
          <button
            type="button"
            onClick={() => append({ platform: 'x', url: '' })}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add social link
          </button>
        )}
      </div>

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

export default ContactLinksCard;
