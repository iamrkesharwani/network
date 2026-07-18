import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  shortUploadSchema,
  type ShortUploadInput,
  type IShortResponse,
  type ICreatorEvent,
  type ShortVisibility,
} from '@network/shared';
import { useFinaliseShortMutation } from '../shortApi';
import {
  useMediaEditForm,
  type CompletenessRule,
} from '../../upload/hooks/useMediaEditForm';
import PublishReviewModal, {
  type ReviewField,
} from '../../upload/components/PublishReviewModal';
import ShortDetailsStepOne from './ShortDetailsStepOne';
import ShortDetailsStepTwo from './ShortDetailsStepTwo';

const subStepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export type ShortDetailsStep = 'details-1' | 'details-2';

export type ShortDetailsFormValues = {
  title: string;
  description?: string;
  tags?: string[];
  visibility?: ShortVisibility;
};

interface ShortDetailsWizardProps {
  shortId: string;
  thumbnailUrl?: string;
  step: ShortDetailsStep;
  onStepChange: (step: ShortDetailsStep) => void;
  onSuccess: (
    short: IShortResponse,
    creatorEvent?: ICreatorEvent | null
  ) => void;
}

const completenessRules = (
  thumbnailUrl?: string
): CompletenessRule<ShortDetailsFormValues>[] => [
  { weight: 35, isMet: (v) => (v.title ?? '').trim().length >= 5 },
  { weight: 25, isMet: (v) => (v.description ?? '').trim().length >= 20 },
  { weight: 25, isMet: (v) => (v.tags?.length ?? 0) >= 1 },
  { weight: 15, isMet: () => !!thumbnailUrl },
];

const ShortDetailsWizard = ({
  shortId,
  thumbnailUrl,
  step,
  onStepChange,
  onSuccess,
}: ShortDetailsWizardProps) => {
  const [finaliseShort, { isLoading: isPublishing }] =
    useFinaliseShortMutation();
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
  } = useMediaEditForm<ShortDetailsFormValues, ShortUploadInput>({
    schema: shortUploadSchema,
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      visibility: 'public' as ShortVisibility,
    },
    completenessRules: completenessRules(thumbnailUrl),
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const tags = watch('tags') ?? [];
  const visibility = watch('visibility') ?? ('public' as ShortVisibility);

  const goToStepTwo = async () => {
    if (await trigger(['title', 'description'])) onStepChange('details-2');
  };

  const publish = submit(async (data) => {
    const result = await finaliseShort({
      shortId,
      ...data,
      thumbnailUrl,
    }).unwrap();
    onSuccess(result.data.short, result.data.creatorEvent);
  });

  const reviewFields: ReviewField[] = [
    { label: 'Title', value: title || 'Untitled' },
    ...(tags.length > 0
      ? [{ label: 'Tags', value: tags.map((tag) => `#${tag}`).join(' ') }]
      : []),
    {
      label: 'Visibility',
      value: <span className="capitalize">{visibility}</span>,
    },
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
            <ShortDetailsStepOne
              register={register}
              errors={errors}
              title={title}
              description={description}
              onContinue={goToStepTwo}
            />
          )}

          {step === 'details-2' && (
            <ShortDetailsStepTwo
              control={control}
              errors={errors}
              onBack={() => onStepChange('details-1')}
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

export default ShortDetailsWizard;
