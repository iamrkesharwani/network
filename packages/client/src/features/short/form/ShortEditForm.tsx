import { Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, Rocket, Save } from 'lucide-react';
import {
  shortUploadSchema,
  shortUpdateSchema,
  type ShortUploadInput,
  type IShortResponse,
  type ICreatorEvent,
  type ShortVisibility,
} from '@network/shared';
import {
  useFinaliseShortMutation,
  useUpdateShortMutation,
  useUploadThumbnailMutation,
} from '../shortApi';
import {
  useMediaEditForm,
  createThumbnailUploader,
  type CompletenessRule,
} from '../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import ThumbnailPicker from '../../upload/components/ThumbnailPicker';

type ShortFormValues = {
  title: string;
  description?: string;
  tags?: string[];
  visibility?: ShortVisibility;
  thumbnailUrl?: string;
};

interface ShortEditFormProps {
  mode: 'finalise' | 'edit';
  shortId: string;
  thumbnailUrl?: string;
  initialValues?: Partial<ShortUploadInput>;
  onSuccess: (
    short: IShortResponse,
    creatorEvent?: ICreatorEvent | null
  ) => void;
}

const shortCompletenessRules = (
  thumbnailUrl?: string
): CompletenessRule<ShortFormValues>[] => [
  { weight: 35, isMet: (v) => (v.title ?? '').trim().length >= 5 },
  { weight: 25, isMet: (v) => (v.description ?? '').trim().length >= 20 },
  { weight: 25, isMet: (v) => (v.tags?.length ?? 0) >= 1 },
  { weight: 15, isMet: (v) => !!(v.thumbnailUrl || thumbnailUrl) },
];

const ShortEditForm = ({
  mode,
  shortId,
  thumbnailUrl,
  initialValues,
  onSuccess,
}: ShortEditFormProps) => {
  const [finaliseShort, { isLoading: isFinalising }] =
    useFinaliseShortMutation();
  const [updateShort, { isLoading: isUpdating }] = useUpdateShortMutation();
  const [uploadThumbnail] = useUploadThumbnailMutation();

  const isSubmitting = isFinalising || isUpdating;

  const handleThumbnailUpload = createThumbnailUploader(uploadThumbnail);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
    completeness,
    submitError,
    submit,
  } = useMediaEditForm<ShortFormValues, ShortUploadInput>({
    schema: (mode === 'finalise'
      ? shortUploadSchema
      : shortUpdateSchema) as typeof shortUploadSchema,
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      tags: initialValues?.tags ?? [],
      visibility: initialValues?.visibility ?? ('public' as ShortVisibility),
      thumbnailUrl: initialValues?.thumbnailUrl ?? thumbnailUrl,
    },
    completenessRules: shortCompletenessRules(thumbnailUrl),
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const editThumbnailUrl = watch('thumbnailUrl');

  const onSubmit = submit(async (data) => {
    if (mode === 'finalise') {
      const result = await finaliseShort({
        shortId,
        ...data,
        thumbnailUrl: thumbnailUrl ?? data.thumbnailUrl,
      }).unwrap();
      onSuccess(result.data.short, result.data.creatorEvent);
    } else {
      const result = await updateShort({ shortId, ...data }).unwrap();
      onSuccess(result.data);
    }
  });

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg mx-auto">
      <div className="mb-7">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-text-secondary">
            Listing strength
          </span>
          <span className="text-xs font-semibold text-primary">
            {completeness}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-overlay overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <FloatingInput
        label="Title"
        {...register('title')}
        error={errors.title?.message}
        counter={{ current: title.length, max: 100 }}
      />

      <FloatingTextarea
        label="Description (optional)"
        rows={3}
        {...register('description')}
        error={errors.description?.message}
        counter={{ current: description.length, max: 500 }}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <TagInput
            value={field.value ?? []}
            onChange={field.onChange}
            error={errors.tags?.message as string | undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="visibility"
        render={({ field }) => (
          <VisibilitySelector
            value={(field.value as ShortVisibility) ?? 'public'}
            onChange={field.onChange}
          />
        )}
      />

      {mode === 'edit' && (
        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-2.5">
            Thumbnail
          </p>
          <ThumbnailPicker
            value={editThumbnailUrl}
            onChange={(url) => setValue('thumbnailUrl', url)}
            uploadThumbnail={handleThumbnailUpload}
          />
        </div>
      )}

      {submitError && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-btn relative w-full overflow-hidden rounded-lg border border-primary py-3 text-sm font-semibold text-primary disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : mode === 'finalise' ? (
          <Rocket className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {mode === 'finalise' ? 'Publish short' : 'Save changes'}
      </button>
    </form>
  );
};

export default ShortEditForm;
