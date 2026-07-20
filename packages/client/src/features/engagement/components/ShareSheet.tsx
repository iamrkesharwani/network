import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';
import type { ContentType } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { useToast } from '../../../shared/hooks/useToast';
import { useCreateShareMutation } from '../shareApi';

export interface ShareSheetProps {
  contentType: ContentType;
  contentId: string;
  compact?: boolean;
  className?: string;
}

interface MenuPosition {
  top: number;
  right: number;
}

const ShareSheet = ({
  contentType,
  contentId,
  compact = false,
  className,
}: ShareSheetProps) => {
  const [createShare] = useCreateShareMutation();
  const { addToast } = useToast();
  const { reduce } = useMotionSafe();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuOpen]);

  const handleShare = async () => {
    let url: string;
    try {
      const result = await createShare({ contentType, contentId }).unwrap();
      url = result.data.url;
    } catch {
      addToast("Couldn't create a share link. Please try again.", 'error');
      return;
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url });
      } catch {}
      return;
    }

    setShareUrl(url);
    setCopied(false);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen(true);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addToast('Link copied', 'success');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative inline-flex">
      <motion.button
        ref={buttonRef}
        type="button"
        aria-label="Share"
        onClick={handleShare}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={SPRINGS.snappy}
        className={cn(
          compact
            ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-icon transition-colors hover:bg-surface-raised cursor-pointer'
            : 'flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer',
          className
        )}
      >
        <Share2 className="h-4 w-4 text-icon" />
        {!compact && 'Share'}
      </motion.button>

      {menuOpen &&
        position &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <AnimatePresence>
              <motion.div
                key="share-popover"
                initial={reduce ? false : { opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRINGS.snappy}
                style={{
                  position: 'fixed',
                  top: position.top,
                  right: position.right,
                  transformOrigin: 'top right',
                }}
                className="z-50 w-64 p-2 rounded-xl bg-surface-overlay border border-border shadow-xl shadow-black/40"
              >
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl ?? ''}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-secondary"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover cursor-pointer"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
};

export default ShareSheet;
