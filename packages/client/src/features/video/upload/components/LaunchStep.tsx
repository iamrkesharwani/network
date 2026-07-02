import { Eye, PartyPopper, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fireSuccessBurst } from '../../../gamification/confetti';
import AchievementCatalogGrid from '../../../gamification/components/AchievementCatalogGrid';
import type { IGamificationEvent, IVideoResponse } from '@network/shared';

interface LaunchStepProps {
  video: IVideoResponse;
  gamification: IGamificationEvent | null;
  onUploadAnother: () => void;
}

const LaunchStep = ({
  video,
  gamification,
  onUploadAnother,
}: LaunchStepProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    fireSuccessBurst();
  }, []);

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-5"
      >
        <PartyPopper className="w-7 h-7" />
      </motion.div>

      <h2 className="text-2xl font-bold font-display text-text-primary">
        You're live!
      </h2>
      <p className="mt-1.5 text-sm text-text-muted max-w-sm">
        "{video.title}" has been published
        {video.visibility !== 'public' ? ` (${video.visibility})` : ''}.
      </p>

      {gamification && gamification.xpAwarded > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-muted px-4 py-1.5 text-sm font-semibold text-primary"
        >
          +{gamification.xpAwarded} XP earned
        </motion.div>
      )}

      <div className="mt-9 w-full">
        <p className="text-xs font-medium text-text-secondary mb-3 text-left">
          Your trophy case
        </p>
        <AchievementCatalogGrid />
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/video/${video.id}`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          View video
        </button>

        <button
          type="button"
          onClick={onUploadAnother}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:border-primary/40 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload another
        </button>
      </div>
    </div>
  );
};

export default LaunchStep;
