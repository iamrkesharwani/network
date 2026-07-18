import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalDismiss } from '../../../shared/hooks/useModalDismiss';

interface PostImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const PostImagePreviewModal = ({
  isOpen,
  imageUrl,
  onClose,
}: PostImagePreviewModalProps) => {
  useModalDismiss(isOpen, onClose);

  if (!imageUrl) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[90vh] max-w-[90vw]"
          >
            <img
              src={imageUrl}
              alt="Full size attachment"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-primary shadow-lg hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PostImagePreviewModal;
