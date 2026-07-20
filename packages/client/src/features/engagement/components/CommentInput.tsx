import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { COMMENT_TEXT_MAX_LENGTH } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';

export interface CommentInputProps {
  mode: 'create' | 'reply' | 'edit';
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => Promise<void> | void;
  onCancel?: () => void;
  className?: string;
}

const SUBMIT_LABEL: Record<CommentInputProps['mode'], string> = {
  create: 'Post',
  reply: 'Reply',
  edit: 'Save',
};

const CommentInput = ({
  mode,
  initialValue = '',
  placeholder = 'Add a comment...',
  autoFocus = false,
  onSubmit,
  onCancel,
  className,
}: CommentInputProps) => {
  const [text, setText] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reduce } = useMotionSafe();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      if (mode !== 'edit') setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-start gap-2', className)}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={mode === 'edit' ? 2 : 1}
        maxLength={COMMENT_TEXT_MAX_LENGTH}
        className="ml-0 md:ml-1 min-w-0 flex-1 resize-none rounded-lg border border-border bg-surface-raised px-2 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-raised cursor-pointer"
          >
            Cancel
          </button>
        )}
        <motion.button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          transition={SPRINGS.snappy}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {SUBMIT_LABEL[mode]}
        </motion.button>
      </div>
    </form>
  );
};

export default CommentInput;
