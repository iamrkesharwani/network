import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface MediaProcessingBarProps {
  progress?: number;
  isFailed?: boolean;
  className?: string;
}

const MediaProcessingBar = ({
  progress,
  isFailed = false,
  className,
}: MediaProcessingBarProps) => {
  if (isFailed) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-black/10',
        className
      )}
    >
      {progress !== undefined ? (
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      ) : (
        <motion.div
          className="h-full w-1/3 bg-primary"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
};

export default MediaProcessingBar;
