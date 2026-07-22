import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  videoUploadSchema,
  type VideoUploadInput,
  type IVideoResponse,
  type ICreatorEvent,
  type VideoCategory,
  type VideoVisibility,
} from '@network/shared';
import { useFinaliseVideoMutation } from '../videoApi';
import {
  useMediaEditForm,
  type CompletenessRule,
} from '../../upload/hooks/useMediaEditForm';
import { CategoryMeta } from '../../upload/CategoryMeta';
import PublishReviewModal, {
  type ReviewField,
} from '../../upload/components/PublishReviewModal';
import VideoDetailsStepOne from './VideoDetailsStepOne';
import VideoDetailsStepTwo from './VideoDetailsStepTwo';
import VideoDetailsStepThree from './VideoDetailsStepThree';

const subStepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export type VideoDetailsStep = 'details-1' | 'details-2' | 'details-3';

export type VideoDetailsFormValues = {
  title: string;
  description?: string;
  category?: VideoCategory;
  tags?: string[];
  visibility?: VideoVisibility;
};

interface VideoDetailsWizardProps {
  videoId: string;
  thumbnailUrl?: string;
  step: VideoDetailsStep;
  onStepChange: (step: VideoDetailsStep) => void;
  onSuccess: (
    video: IVideoResponse,
    creatorEvent?: ICreatorEvent | null
  ) => void;
}

const completenessRules = (
  thumbnailUrl?: string
): CompletenessRule<VideoDetailsFormValues>[] => [
  { weight: 25, isMet: (v) => (v.title ?? '').trim().length >= 5 },
  { weight: 25, isMet: (v) => (v.description ?? '').trim().length >= 20 },
  { weight: 25, isMet: (v) => !!v.category },
  { weight: 15, isMet: (v) => (v.tags?.length ?? 0) >= 1 },
  { weight: 10, isMet: () => !!thumbnailUrl },
];

const VideoDetailsWizard = ({
  videoId,
  thumbnailUrl,
  step,
  onStepChange,
  onSuccess,
}: VideoDetailsWizardProps) => {
  const [finaliseVideo, { isLoading: isPublishing }] =
    useFinaliseVideoMutation();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const {
    register,
    control,
    watch,
    trigger,
    formState: { errors },
    completeness,
    submitError,
    submit,
  } = useMediaEditForm<VideoDetailsFormValues, VideoUploadInput>({
    schema: videoUploadSchema,
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      tags: [],
      visibility: 'public' as VideoVisibility,
    },
    completenessRules: completenessRules(thumbnailUrl),
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const category = watch('category');
  const tags = watch('tags') ?? [];
  const visibility = watch('visibility') ?? ('public' as VideoVisibility);

  const goToStepTwo = async () => {
    if (await trigger(['title', 'description'])) onStepChange('details-2');
  };

  const goToStepThree = async () => {
    if (await trigger(['category', 'tags'])) onStepChange('details-3');
  };

  const publish = submit(async (data) => {
    const result = await finaliseVideo({
      videoId,
      ...data,
      thumbnailUrl,
    }).unwrap();
    onSuccess(result.data.video, result.data.creatorEvent);
  });

  const reviewFields: ReviewField[] = [
    { label: 'Title', value: title || 'Untitled' },
    ...(category
      ? [{ label: 'Category', value: CategoryMeta[category].label }]
      : []),
    ...(tags.length > 0
      ? [{ label: 'Tags', value: tags.map((tag) => `#${tag}`).join(' ') }]
      : []),
    { label: 'Visibility', value: <span className="capitalize">{visibility}</span> },
    ...(description.trim()
      ? [
          {
            label: 'Description',
            value: (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="h-3.5 w-3.5" />
                Added
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={subStepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 'details-1' && (
            <VideoDetailsStepOne
              register={register}
              control={control}
              errors={errors}
              title={title}
              description={description}
              onContinue={goToStepTwo}
            />
          )}

          {step === 'details-2' && (
            <VideoDetailsStepTwo
              control={control}
              errors={errors}
              onBack={() => onStepChange('details-1')}
              onContinue={goToStepThree}
            />
          )}

          {step === 'details-3' && (
            <VideoDetailsStepThree
              control={control}
              onBack={() => onStepChange('details-2')}
              onReview={() => setShowReviewModal(true)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <PublishReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={publish}
        fields={reviewFields}
        isPublishing={isPublishing}
        error={submitError}
      />
    </div>
  );
};

export default VideoDetailsWizard;
