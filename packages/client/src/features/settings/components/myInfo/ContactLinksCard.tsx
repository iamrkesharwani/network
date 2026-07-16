import { useFieldArray } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import {
  contactLinksSchema,
  SOCIAL_LINKS_MAX,
  type ContactLinksInput,
} from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { usePatchContactLinksMutation } from '../../settingsApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../../upload/components/FloatingInput';
import Button from '../../../../shared/ui/primitives/Button';

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
      location: user?.location ?? '',
      website: user?.website ?? '',
      socialLinks: user?.socialLinks ?? [],
      phone: user?.phone ?? '',
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
    <form onSubmit={onSubmit}>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Contact &amp; links
      </h3>

      <FloatingInput
        label="Location"
        {...register('location')}
        error={errors.location?.message}
      />

      <FloatingInput
        label="Website"
        {...register('website')}
        error={errors.website?.message}
      />

      <FloatingInput
        label="Phone"
        {...register('phone')}
        error={errors.phone?.message}
      />

      <div className="mb-6">
        <p className="mb-2.5 text-sm font-medium text-text-secondary">
          Social links
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="mb-3 flex items-start gap-2">
            <FloatingInput
              label="Platform"
              containerClassName="mb-0 w-32 shrink-0"
              {...register(`socialLinks.${index}.platform`)}
              error={errors.socialLinks?.[index]?.platform?.message}
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
            onClick={() => append({ platform: '', url: '' })}
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
    </form>
  );
};

export default ContactLinksCard;
