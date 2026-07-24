import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Plus, Search, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CLIENT_ROUTES,
  SEARCH_DEBOUNCE_MS,
  CONVERSATION_SEARCH_RESULT_LIMIT,
  type IConversationSummary,
} from '@network/shared';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { cn } from '../../../shared/utils/cn';
import {
  CONVERSATION_LIST_ARGS,
  useGetConversationsQuery,
  useSearchConversationsQuery,
  useMarkAllReadMutation,
  useCreateDirectConversationMutation,
} from '../conversationApi';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import {
  getConversationLabel,
  getConversationAvatarProps,
} from '../utils/conversationDisplay';

interface MessagesListHeaderProps {
  onOpenArchived: () => void;
  onCreateGroup: () => void;
  onSelectConversation: (conversationId: string) => void;
}

const COLLAPSIBLE_TRANSITION = { duration: 0.2 };

const MessagesListHeader = ({
  onOpenArchived,
  onCreateGroup,
  onSelectConversation,
}: MessagesListHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobileLayout();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const isSearchActive = isFocused || trimmedQuery.length > 0;
  const shouldCollapse = isMobile && isSearchActive;

  const { data: conversationsData } = useGetConversationsQuery(CONVERSATION_LIST_ARGS);
  const localMatches = useMemo(() => {
    if (!trimmedQuery) return [];
    const needle = trimmedQuery.toLowerCase();
    return (conversationsData?.data ?? []).filter((conversation) =>
      getConversationLabel(conversation).toLowerCase().includes(needle)
    );
  }, [conversationsData, trimmedQuery]);

  const { data: serverMatchesData } = useSearchConversationsQuery(
    { q: debouncedQuery, limit: CONVERSATION_SEARCH_RESULT_LIMIT },
    { skip: !debouncedQuery }
  );

  const matchedConversations = useMemo(() => {
    const byId = new Map<string, IConversationSummary>();
    for (const conversation of localMatches) byId.set(conversation.id, conversation);
    for (const conversation of serverMatchesData?.data ?? []) {
      if (!byId.has(conversation.id)) byId.set(conversation.id, conversation);
    }
    return Array.from(byId.values());
  }, [localMatches, serverMatchesData]);

  const { data: peopleData } = useSearchCreatorsQuery(
    { q: debouncedQuery, limit: 10 },
    { skip: !debouncedQuery }
  );

  const existingDirectParticipantIds = useMemo(
    () =>
      new Set(
        matchedConversations
          .filter((conversation) => conversation.type === 'direct')
          .map((conversation) => conversation.otherParticipant.id)
      ),
    [matchedConversations]
  );
  const matchedPeople = (peopleData?.data ?? []).filter(
    (person) => !existingDirectParticipantIds.has(person.id)
  );

  const [createDirectConversation] = useCreateDirectConversationMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const closeSearch = () => {
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelectConversation = (conversationId: string) => {
    closeSearch();
    onSelectConversation(conversationId);
  };

  const handleStartChat = async (participantId: string) => {
    const result = await createDirectConversation({ participantId }).unwrap();
    closeSearch();
    onSelectConversation(result.data.id);
  };

  const showResults = trimmedQuery.length > 0;

  return (
    <div className="relative mb-3 shrink-0">
      <div className="flex items-center gap-1.5">
        <motion.div
          className="flex shrink-0 items-center gap-1.5 overflow-hidden md:!w-auto md:!opacity-100"
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

        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
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

        <motion.div
          className="relative shrink-0 overflow-hidden md:!w-auto md:!opacity-100"
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
        </motion.div>

        <motion.div
          className="relative shrink-0 overflow-hidden md:!w-auto md:!opacity-100"
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
        </motion.div>
      </div>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {matchedConversations.length === 0 && matchedPeople.length === 0 && (
            <p className="px-3 py-3 text-sm text-text-muted">No matches found.</p>
          )}

          {matchedConversations.length > 0 && (
            <div className="py-1.5">
              <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase text-text-muted">
                Chats
              </p>
              {matchedConversations.map((conversation) => {
                const avatarProps = getConversationAvatarProps(conversation);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-surface-raised"
                  >
                    <Avatar
                      src={avatarProps.src}
                      isOnline={avatarProps.isOnline}
                      fallback={getConversationLabel(conversation)}
                      size="sm"
                    />
                    <span className="truncate text-text-primary">
                      {getConversationLabel(conversation)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchedPeople.length > 0 && (
            <div className={cn('py-1.5', matchedConversations.length > 0 && 'border-t border-border')}>
              <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase text-text-muted">
                Start a chat
              </p>
              {matchedPeople.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handleStartChat(person.id)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-surface-raised"
                >
                  <Avatar src={person.avatarUrl} fallback={person.name} size="sm" />
                  <span className="truncate text-text-primary">{person.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesListHeader;
