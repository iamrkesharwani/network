import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Plus, Search, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useMarkAllReadMutation } from '../conversationApi';

interface MessagesListHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  isFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  onOpenArchived: () => void;
  onCreateGroup: () => void;
}

const COLLAPSIBLE_TRANSITION = { duration: 0.2 };

const MessagesListHeader = ({
  query,
  onQueryChange,
  isFocused,
  onFocusChange,
  onOpenArchived,
  onCreateGroup,
}: MessagesListHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobileLayout();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isSearchActive = isFocused || query.trim().length > 0;
  const shouldCollapse = isMobile && isSearchActive;

  const [markAllRead] = useMarkAllReadMutation();

  const closeSearch = () => {
    onQueryChange('');
    onFocusChange(false);
    inputRef.current?.blur();
  };

  return (
    <div className="mb-3 flex shrink-0 items-center gap-1.5">
      <div className="relative shrink-0">
        <motion.div
          className="overflow-hidden md:!w-auto md:!opacity-100"
          animate={{
            width: shouldCollapse ? 0 : 'auto',
            opacity: shouldCollapse ? 0 : 1,
          }}
          transition={COLLAPSIBLE_TRANSITION}
        >
          <button
            type="button"
            onClick={() => navigate(CLIENT_ROUTES.FEED)}
            aria-label="Leave Messages"
            className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover md:hidden"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </motion.div>
      </div>

      <div className="relative flex flex-1 items-center">
        <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-icon" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => onFocusChange(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeSearch();
          }}
          placeholder="Search chats or people..."
          className="w-full rounded-lg border border-border bg-surface-raised py-1.5 pl-8 pr-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {isSearchActive && (
        <button
          type="button"
          onClick={closeSearch}
          className="shrink-0 rounded-lg p-1.5 text-xs font-medium text-text-muted hover:bg-surface-raised hover:text-text-primary"
        >
          Cancel
        </button>
      )}

      <div className="relative shrink-0">
        <motion.div
          className="overflow-hidden md:!w-auto md:!opacity-100"
          animate={{
            width: shouldCollapse ? 0 : 'auto',
            opacity: shouldCollapse ? 0 : 1,
          }}
          transition={COLLAPSIBLE_TRANSITION}
        >
          <button
            type="button"
            onClick={() => setIsPlusMenuOpen((open) => !open)}
            aria-label="New chat or group"
            className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </motion.div>

        {isPlusMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsPlusMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  inputRef.current?.focus();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} /> New chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onCreateGroup();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
              >
                <Users className="h-4 w-4" strokeWidth={1.75} /> Create group
              </button>
            </div>
          </>
        )}
      </div>

      <div className="relative shrink-0">
        <motion.div
          className="overflow-hidden md:!w-auto md:!opacity-100"
          animate={{
            width: shouldCollapse ? 0 : 'auto',
            opacity: shouldCollapse ? 0 : 1,
          }}
          transition={COLLAPSIBLE_TRANSITION}
        >
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen((open) => !open)}
            aria-label="More options"
            className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </motion.div>

        {isMoreMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMoreMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenArchived();
                }}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
              >
                Archived
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  markAllRead();
                }}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
              >
                Mark all as read
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesListHeader;
