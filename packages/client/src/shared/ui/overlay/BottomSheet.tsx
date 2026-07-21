import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { useMotionSafe } from '../../motion/useMotionSafe';
import { SPRINGS } from '../../motion/springs';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) => {
  const { reduce } = useMotionSafe();
  useModalDismiss(isOpen, onClose);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRINGS.smooth}
            className={cn(
              'relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-2xl border-t border-border bg-surface text-text-primary shadow-2xl',
              className
            )}
          >
            {title && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 rounded-full p-1 transition-colors hover:bg-surface-raised focus:outline-none"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BottomSheet;
