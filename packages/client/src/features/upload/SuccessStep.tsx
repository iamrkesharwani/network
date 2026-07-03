import { Eye, PartyPopper, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  title: string;
  visibility: string;
  viewUrl: string;
  onUploadAnother: () => void;
}

const SuccessStep = ({
  title,
  visibility,
  viewUrl,
  onUploadAnother,
}: SuccessStepProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
      <div className="relative mb-6 mt-4">
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

        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white shadow-xl shadow-primary/30 z-10"
        >
          <PartyPopper className="w-9 h-9" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold font-display text-text-primary">
          You're live!
        </h2>
        <p className="mt-1.5 text-sm text-text-muted max-w-sm">
          "{title}" has been published
          {visibility !== 'public' ? ` (${visibility})` : ''}.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          onClick={() => navigate(viewUrl)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          View
        </button>

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
