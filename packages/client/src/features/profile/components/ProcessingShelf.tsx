import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { MediaProcessingStatus } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

export interface ProcessingShelfItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  status: MediaProcessingStatus;
  errorMessage?: string;
}

interface ProcessingShelfProps {
  items: ProcessingShelfItem[];
  onDelete: (id: string) => Promise<void> | void;
}

const ProcessingShelf = ({ items, onDelete }: ProcessingShelfProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6 overflow-hidden"
    >
      <p className="mb-3 text-xs font-medium text-text-secondary">
        In progress
      </p>

      <div className="flex gap-3 overflow-x-auto pb-1">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const isFailed = item.status === 'FAILED';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'w-52 shrink-0 rounded-xl border p-2.5',
                  isFailed
                    ? 'border-error/30 bg-error-subtle'
                    : 'border-border bg-surface-raised'
                )}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-overlay">
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover opacity-50 blur-[1px]"
                    />
                  )}

                  {!isFailed && (
                    <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-black/10">
                      <motion.div
                        className="h-full w-1/3 bg-primary"
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center">
                    {isFailed ? (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                  </div>
                </div>

                <p className="mt-2 truncate text-xs font-semibold text-text-primary">
                  {item.title}
                </p>

                {isFailed ? (
                  <>
                    <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-error">
                      {item.errorMessage ?? 'Processing failed.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="mt-2 flex items-center gap-1.5 text-[0.7rem] font-medium text-error hover:underline disabled:opacity-60 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </>
                ) : (
                  <p className="mt-0.5 text-[0.7rem] text-text-muted">
                    {item.status === 'UPLOADING'
                      ? 'Uploading…'
                      : 'Processing — this can take a few minutes'}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProcessingShelf;
