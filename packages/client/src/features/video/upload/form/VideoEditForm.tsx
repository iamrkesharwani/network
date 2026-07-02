import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Rocket, Save } from 'lucide-react';
import type { z } from 'zod';
import {
  videoUploadSchema,
  videoUpdateSchema,
  type VideoUploadInput,
  type IVideoResponse,
  type IGamificationEvent,
  type VideoCategory,
  type VideoVisibility,
} from '@network/shared';

import {
  useFinaliseVideoMutation,
  useUpdateVideoMutation,
} from '../../videoApi';
import FloatingInput from '../components/FloatingInput';
import FloatingTextarea from '../components/FloatingTextarea';
import CategoryPicker from '../components/CategoryPicker';
import TagInput from '../components/TagInput';
import VisibilitySelector from '../components/VisibilitySelector';
import ThumbnailPicker from '../components/ThumbnailPicker';

type VideoFormValues = z.input<typeof videoUploadSchema>;

function extractErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'error' in err.data &&
    err.data.error &&
    typeof err.data.error === 'object' &&
    'message' in err.data.error &&
    typeof err.data.error.message === 'string'
  ) {
    return err.data.error.message;
  }
  return 'Something went wrong. Please try again.';
}

interface VideoEditFormProps {
  mode: 'finalise' | 'edit';
  videoId: string;
  thumbnailUrl?: string;
  initialValues?: Partial<VideoUploadInput>;
  onSuccess: (video: IVideoResponse, gamification?: IGamificationEvent) => void;
}

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
  const isSubmitting = isFinalising || isUpdating;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VideoFormValues, any, VideoUploadInput>({
    resolver: zodResolver(
      mode === 'finalise' ? videoUploadSchema : videoUpdateSchema
    ) as any,
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category as VideoCategory | undefined,
      tags: initialValues?.tags ?? [],
      visibility: initialValues?.visibility ?? ('public' as VideoVisibility),
      thumbnailUrl: initialValues?.thumbnailUrl ?? thumbnailUrl,
    },
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const tags = watch('tags') ?? [];
  const category = watch('category');
  const editThumbnailUrl = watch('thumbnailUrl');

  const completeness = useMemo(() => {
    let score = 0;
    if (title.trim().length >= 5) score += 25;
    if (description.trim().length >= 20) score += 25;
    if (category) score += 25;
    if (tags.length >= 1) score += 15;
    if (editThumbnailUrl || thumbnailUrl) score += 10;
    return Math.min(100, score);
  }, [
    title,
    description,
    category,
    tags.length,
    editThumbnailUrl,
    thumbnailUrl,
  ]);

  const onSubmit = async (data: VideoUploadInput) => {
    setSubmitError(null);
    try {
      if (mode === 'finalise') {
        const result = await finaliseVideo({
          videoId,
          ...data,
          thumbnailUrl: thumbnailUrl ?? data.thumbnailUrl,
        }).unwrap();
        onSuccess(result.data.video, result.data.gamification);
      } else {
        const result = await updateVideo({ videoId, ...data }).unwrap();
        onSuccess(result.data);
      }
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg mx-auto">
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
            ? '+15 XP for a solid description'
            : 'Write 50+ characters for bonus XP'
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
