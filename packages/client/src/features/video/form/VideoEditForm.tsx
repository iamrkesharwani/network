import { Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, Rocket, Save } from 'lucide-react';
import {
  videoUploadSchema,
  videoUpdateSchema,
  type VideoUploadInput,
  type IVideoResponse,
  type ICreatorEvent,
  type VideoCategory,
  type VideoVisibility,
} from '@network/shared';
import {
  useFinaliseVideoMutation,
  useUpdateVideoMutation,
  useUploadThumbnailMutation,
} from '../videoApi';
import {
  useMediaEditForm,
  createThumbnailUploader,
  type CompletenessRule,
} from '../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import CategoryPicker from '../../upload/components/CategoryPicker';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import ThumbnailPicker from '../../upload/components/ThumbnailPicker';

type VideoFormValues = {
  title: string;
  description?: string;
  category?: VideoCategory;
  tags?: string[];
  visibility?: VideoVisibility;
  thumbnailUrl?: string;
};

interface VideoEditFormProps {
  mode: 'finalise' | 'edit';
  videoId: string;
  thumbnailUrl?: string;
  initialValues?: Partial<VideoUploadInput>;
  onSuccess: (
    video: IVideoResponse,
    creatorEvent?: ICreatorEvent | null
  ) => void;
}

const videoCompletenessRules = (
  thumbnailUrl?: string
): CompletenessRule<VideoFormValues>[] => [
  { weight: 25, isMet: (v) => (v.title ?? '').trim().length >= 5 },
  { weight: 25, isMet: (v) => (v.description ?? '').trim().length >= 20 },
  { weight: 25, isMet: (v) => !!v.category },
  { weight: 15, isMet: (v) => (v.tags?.length ?? 0) >= 1 },
  { weight: 10, isMet: (v) => !!(v.thumbnailUrl || thumbnailUrl) },
];

const VideoEditForm = ({
  mode,
  videoId,
  thumbnailUrl,
  initialValues,
  onSuccess,
}: VideoEditFormProps) => {
  const [finaliseVideo, { isLoading: isFinalising }] =
    useFinaliseVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const [uploadThumbnail] = useUploadThumbnailMutation();

  const handleThumbnailUpload = createThumbnailUploader(uploadThumbnail);

  const isSubmitting = isFinalising || isUpdating;

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
    completeness,
    submitError,
    submit,
  } = useMediaEditForm<VideoFormValues, VideoUploadInput>({
    schema: mode === 'finalise' ? videoUploadSchema : videoUpdateSchema,
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category as VideoCategory | undefined,
      tags: initialValues?.tags ?? [],
      visibility: initialValues?.visibility ?? ('public' as VideoVisibility),
      thumbnailUrl: initialValues?.thumbnailUrl ?? thumbnailUrl,
    },
    completenessRules: videoCompletenessRules(thumbnailUrl),
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const editThumbnailUrl = watch('thumbnailUrl');

  const onSubmit = submit(async (data) => {
    if (mode === 'finalise') {
      const result = await finaliseVideo({
        videoId,
        ...data,
        thumbnailUrl: thumbnailUrl ?? data.thumbnailUrl,
      }).unwrap();
      onSuccess(result.data.video, result.data.creatorEvent);
    } else {
      const result = await updateVideo({ videoId, ...data }).unwrap();
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
        rows={4}
        {...register('description')}
        error={errors.description?.message}
        counter={{ current: description.length, max: 5000 }}
        hint={
          description.length >= 50
            ? undefined
            : 'A description of 50+ characters helps viewers find your video'
        }
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <CategoryPicker
            value={field.value as VideoCategory | undefined}
            onChange={field.onChange}
            error={errors.category?.message}
          />
        )}
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
            value={(field.value as VideoVisibility) ?? 'public'}
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
        {mode === 'finalise' ? 'Publish video' : 'Save changes'}
      </button>
    </form>
  );
};

export default VideoEditForm;
