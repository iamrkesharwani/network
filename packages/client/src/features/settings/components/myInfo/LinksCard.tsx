import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Globe, Plus, Share2 } from 'lucide-react';
import {
  contactLinksSchema,
  SOCIAL_LINKS_MAX,
  type ContactLinksInput,
} from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchContactLinksMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import BorderedInput from '../general/BorderedInput';
import Button from '../../../../shared/ui/primitives/Button';
import MyInfoFormHeader from './MyInfoFormHeader';
import LocationSection from './LocationSection';
import SaveSuccessModal from '../general/SaveSuccessModal';
import SocialLinkRow from './SocialLinkRow';

const LinksCard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [patchContactLinks, { isLoading }] = usePatchContactLinksMutation();
  const [showSuccess, setShowSuccess] = useState(false);

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
      <MyInfoFormHeader title="Links" />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <LocationSection />

        <BorderedInput
          label="Website"
          icon={Globe}
          placeholder="https://yourwebsite.com"
          {...register('website')}
          error={errors.website?.message}
        />
      </div>

      <div className="mb-6">
        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          <Share2 className="h-3.5 w-3.5 shrink-0" />
          Social links
        </p>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <SocialLinkRow
              key={field.id}
              control={control}
              index={index}
              onRemove={() => remove(index)}
              urlError={errors.socialLinks?.[index]?.url?.message}
              platformError={errors.socialLinks?.[index]?.customLabel?.message}
            />
          ))}
        </div>

        {fields.length < SOCIAL_LINKS_MAX && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() =>
              append({ platform: 'other', url: '', customLabel: '' })
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add another
          </Button>
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

      <SaveSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </motion.form>
  );
};

export default LinksCard;
