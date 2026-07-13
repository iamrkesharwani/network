import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface UploadHeaderSlotProps {
  title: string;
  showStatus: boolean;
  isProcessingDone: boolean;
  statusLabel: string;
  onCancelClick: () => void;
}

const UploadHeaderSlot = ({
  title,
  showStatus,
  isProcessingDone,
  statusLabel,
  onCancelClick,
}: UploadHeaderSlotProps) => (
  <div className="mb-7 flex min-h-9 items-center justify-center">
    <AnimatePresence mode="wait">
      {showStatus ? (
        <motion.div
          key="status"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <span className="flex items-center gap-2 text-xs text-text-muted">
            {isProcessingDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {statusLabel}
          </span>

          <button
            type="button"
            onClick={onCancelClick}
            className={cn(
              'flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1',
              'text-[0.7rem] font-semibold text-text-secondary transition-colors cursor-pointer',
              'hover:border-error/50 hover:bg-error-subtle hover:text-error'
            )}
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </motion.div>
      ) : (
        <motion.h1
          key="title"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold font-display text-text-primary"
        >
          {title}
        </motion.h1>
      )}
    </AnimatePresence>
  </div>
);

export default UploadHeaderSlot;
