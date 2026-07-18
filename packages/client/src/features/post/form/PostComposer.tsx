import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import { useToast } from '../../../shared/hooks/useToast';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { buildProfileTabPath } from '../../profile/utils/buildProfilePath';
import { SPRINGS } from '../../../shared/motion/springs';
import { usePostComposer } from '../hooks/usePostComposer';
import BadgeToast from '../../creator/components/BadgeToast';
import UploadStepper from '../../upload/components/UploadStepper';
import PostStepOne from './PostStepOne';
import PostStepTwo from './PostStepTwo';
import PostStepThree from './PostStepThree';
import {
  ACCEPTED_ATTACHMENT_MIME,
  ALLOWED_POST_IMAGE_MIME_TYPES,
  MAX_POST_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGES,
  TEXT_PREVIEW_LENGTH,
  type PostComposerStep,
} from '@network/shared';
import PublishReviewModal, {
  type ReviewField,
} from '../../upload/components/PublishReviewModal';

const POST_STEPS: { key: PostComposerStep; label: string }[] = [
  { key: 'text', label: 'Write' },
  { key: 'photos', label: 'Photos' },
  { key: 'details', label: 'Details' },
];

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const validateImageFile = (file: File): string | null => {
  const isImage = ALLOWED_POST_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_POST_IMAGE_MIME_TYPES)[number]
  );

  if (!isImage) {
    return 'That file type is not supported. Please attach a JPEG, PNG, or WebP image.';
  }

  if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
    const maxMb = Math.floor(MAX_POST_IMAGE_SIZE_BYTES / (1024 * 1024));
    return `That image is too large. The max size is ${maxMb}MB.`;
  }

  return null;
};

const PostComposer = () => {
  const navigate = useNavigate();
  const username = useAppSelector((state) => state.auth.user?.username);
  const { addToast } = useToast();
  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();
  const [step, setStep] = useState<PostComposerStep>('text');
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    errors,
    trigger,
    text,
    tags,
    visibility,
    images,
    addImages,
    removeImage,
    canSubmit,
    publish,
    submitError,
    isSubmitting,
  } = usePostComposer({
    onPublished: (creatorEvent) => {
      setShowReviewModal(false);
      setStep('text');
      addToast('Your post is live', 'success');
      celebrate(creatorEvent);
      if (username) navigate(buildProfileTabPath(username, 'posts'));
    },
  });

  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = MAX_POST_IMAGES - images.length;
      if (remainingSlots <= 0) {
        setAttachmentError(`You can attach up to ${MAX_POST_IMAGES} images.`);
        return;
      }

      const candidates = Array.from(files).slice(0, remainingSlots);
      for (const file of candidates) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setAttachmentError(validationError);
          return;
        }
      }

      setAttachmentError(null);
      addImages(candidates);
    },
    [addImages, images.length]
  );

  const goToPhotos = async () => {
    if (!(await trigger('text'))) return;
    setStep('photos');
  };

  const goToDetails = () => {
    if (!canSubmit) {
      setAttachmentError('Write something or attach an image first.');
      return;
    }
    setAttachmentError(null);
    setStep('details');
  };

  const textPreview =
    text.length > TEXT_PREVIEW_LENGTH
      ? `${text.slice(0, TEXT_PREVIEW_LENGTH)}…`
      : text;

  const reviewFields: ReviewField[] = [
    ...(textPreview ? [{ label: 'Text', value: textPreview }] : []),
    ...(images.length > 0
      ? [
          {
            label: 'Images',
            value: `${images.length} attached`,
          },
        ]
      : []),
    ...(tags.length > 0
      ? [{ label: 'Tags', value: tags.map((tag) => `#${tag}`).join(' ') }]
      : []),
    {
      label: 'Visibility',
      value: <span className="capitalize">{visibility}</span>,
    },
  ];

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <BadgeToast item={celebration} onDismiss={dismiss} />

      <h1 className="text-xl font-bold font-display text-text-primary text-center mb-8">
        Create a post
      </h1>

      <UploadStepper current={step} steps={POST_STEPS} />

      <motion.div
        layout
        transition={SPRINGS.smooth}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 min-h-72"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 'text' && (
              <PostStepOne
                register={register}
                errors={errors}
                text={text}
                onContinue={goToPhotos}
                disabled={isSubmitting}
              />
            )}

            {step === 'photos' && (
              <PostStepTwo
                images={images}
                previewUrls={previewUrls}
                attachmentError={attachmentError}
                fileInputRef={fileInputRef}
                acceptedMime={ACCEPTED_ATTACHMENT_MIME}
                onFilesSelected={handleFilesSelected}
                onRemoveImage={removeImage}
                onBack={() => setStep('text')}
                onContinue={goToDetails}
                disabled={isSubmitting}
              />
            )}

            {step === 'details' && (
              <PostStepThree
                control={control}
                errors={errors}
                onBack={() => setStep('photos')}
                onReview={() => setShowReviewModal(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <PublishReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={publish}
        fields={reviewFields}
        isPublishing={isSubmitting}
        error={submitError}
        confirmLabel="Confirm & post"
      />
    </div>
  );
};

export default PostComposer;
