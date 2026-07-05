import { AlertTriangle, Eye, Loader2, PartyPopper, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { MediaProcessingStatus } from '@network/shared';

interface SuccessStepProps {
  title: string;
  visibility: string;
  viewUrl: string;
  status: MediaProcessingStatus;
  errorMessage?: string;
  onUploadAnother: () => void;
}

const SuccessStep = ({
  title,
  visibility,
  viewUrl,
  status,
  errorMessage,
  onUploadAnother,
}: SuccessStepProps) => {
  const navigate = useNavigate();
  const isReady = status === 'READY';
  const isFailed = status === 'FAILED';

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
      <div className="relative mb-6 mt-4">
        {isReady && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-primary/30"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full bg-primary/40"
            />
          </>
        )}

        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-xl z-10 ${
            isFailed
              ? 'bg-error shadow-error/30'
              : isReady
                ? 'bg-primary shadow-primary/30'
                : 'bg-text-muted shadow-text-muted/20'
          }`}
        >
          {isFailed ? (
            <AlertTriangle className="w-9 h-9" />
          ) : isReady ? (
            <PartyPopper className="w-9 h-9" />
          ) : (
            <Loader2 className="w-9 h-9 animate-spin" />
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold font-display text-text-primary">
          {isFailed
            ? 'Processing failed'
            : isReady
              ? "You're live!"
              : 'Almost there…'}
        </h2>
        <p className="mt-1.5 text-sm text-text-muted max-w-sm">
          {isFailed ? (
            (errorMessage ??
            `"${title}" couldn't be processed. Please try uploading again.`)
          ) : isReady ? (
            <>
              "{title}" has been published
              {visibility !== 'public' ? ` (${visibility})` : ''}.
            </>
          ) : (
            <>
              We're still processing "{title}" in the background — we'll let you
              know when it's live.
            </>
          )}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            disabled={!isReady}
            onClick={() => navigate(viewUrl)}
            title={isReady ? undefined : 'Available once processing finishes'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${
              isReady
                ? 'bg-primary hover:bg-primary-hover cursor-pointer'
                : 'bg-primary/40 cursor-not-allowed opacity-60'
            }`}
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          {!isReady && (
            <span className="text-[0.65rem] text-text-muted">
              Player coming soon
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onUploadAnother}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:border-primary/40 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload another
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessStep;
