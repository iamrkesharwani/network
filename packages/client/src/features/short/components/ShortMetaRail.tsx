import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { CLIENT_ROUTES, type IShortResponse } from '@network/shared';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import Avatar from '../../../shared/ui/primitives/Avatar';
import MentionedText from '../../../shared/ui/primitives/MentionedText';

interface ShortMetaRailProps {
  short: IShortResponse;
}

const ShortMetaRail = ({ short }: ShortMetaRailProps) => {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const { reduce } = useMotionSafe();
  const profileHref = CLIENT_ROUTES.PROFILE.replace(
    ':username',
    short.author.username
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <AnimatePresence mode="wait" initial={false}>
        {descriptionOpen ? (
          <motion.div
            key="description"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRINGS.smooth}
            className="flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  src={short.author.avatarUrl}
                  alt={short.author.username}
                  size="sm"
                  fallback={short.author.username}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {short.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    @{short.author.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDescriptionOpen(false)}
                aria-label="Close description"
                className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-raised focus:outline-none"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <p className="whitespace-pre-wrap wrap-break-word text-sm text-text-secondary leading-relaxed">
              <MentionedText text={short.description ?? ''} />
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRINGS.smooth}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <Link to={profileHref}>
                <Avatar
                  src={short.author.avatarUrl}
                  alt={short.author.username}
                  size="md"
                  fallback={short.author.username}
                />
              </Link>
              <Link
                to={profileHref}
                className="text-sm font-medium text-text-primary hover:underline"
              >
                @{short.author.username}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setDescriptionOpen(true)}
              aria-expanded={descriptionOpen}
              disabled={!short.description}
              className="flex items-start gap-1.5 text-left focus:outline-none disabled:cursor-default"
            >
              <h1 className="text-sm font-semibold text-text-primary">
                {short.title}
              </h1>
              {short.description && (
                <ChevronDown
                  className="mt-1 h-4 w-4 shrink-0 text-text-muted"
                  strokeWidth={2.5}
                />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShortMetaRail;
