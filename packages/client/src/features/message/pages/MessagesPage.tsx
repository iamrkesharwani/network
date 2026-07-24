import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { cn } from '../../../shared/utils/cn';
import { buildConversationPath } from '../utils/buildMessagesPath';
import {
  useGetConversationsQuery,
  useGetArchivedConversationsQuery,
  useCreateDirectConversationMutation,
  CONVERSATION_LIST_ARGS,
  CONVERSATION_ARCHIVED_LIST_ARGS,
} from '../conversationApi';
import { useUnifiedConversationSearch } from '../hooks/useUnifiedConversationSearch';
import ConversationList from '../components/ConversationList';
import ArchivedConversationList from '../components/ArchivedConversationList';
import MessagesListHeader from '../components/MessagesListHeader';
import MessagesSearchResultsList from '../components/MessagesSearchResultsList';
import MessageThread from '../components/MessageThread';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupInfoPanel from '../components/GroupInfoPanel';
import AddParticipantsModal from '../components/AddParticipantsModal';

const MessagesPage = () => {
  usePageTitle('Messages');
  const user = useAppSelector((state) => state.auth.user);
  const socket = useSocketContext();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const activeConversationId = conversationId ?? null;

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);
  const [isArchivedViewOpen, setIsArchivedViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isActive: isSearchActive, matchedConversations, matchedPeople } =
    useUnifiedConversationSearch(searchQuery);
  const [createDirectConversation] = useCreateDirectConversationMutation();

  const { data: conversationsData, isLoading: isLoadingConversations } =
    useGetConversationsQuery(CONVERSATION_LIST_ARGS);
  const {
    data: archivedConversationsData,
    isLoading: isLoadingArchivedConversations,
  } = useGetArchivedConversationsQuery(CONVERSATION_ARCHIVED_LIST_ARGS);
  const conversations = conversationsData?.data ?? [];
  const archivedConversations = archivedConversationsData?.data ?? [];
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ??
    archivedConversations.find((c) => c.id === activeConversationId) ??
    null;
  const isLoadingActiveConversation =
    Boolean(activeConversationId) &&
    !activeConversation &&
    (isLoadingConversations || isLoadingArchivedConversations);

  const handleSelectFromSearch = (id: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(buildConversationPath(id));
  };

  const handleStartChat = async (participantId: string) => {
    const result = await createDirectConversation({ participantId }).unwrap();
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(buildConversationPath(result.data.id));
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] gap-4 pt-4 md:h-[calc(100vh-8rem)] md:pt-0">
      <div
        className={cn(
          'w-full flex-col md:max-w-xs md:shrink-0 md:border-r md:border-border md:pr-3',
          activeConversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        {isArchivedViewOpen ? (
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsArchivedViewOpen(false)}
              aria-label="Back to chats"
              className="-ml-1.5 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Archived
            </h2>
          </div>
        ) : (
          <MessagesListHeader
            query={searchQuery}
            onQueryChange={setSearchQuery}
            isFocused={isSearchFocused}
            onFocusChange={setIsSearchFocused}
            onOpenArchived={() => setIsArchivedViewOpen(true)}
            onCreateGroup={() => setIsCreateGroupOpen(true)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {isArchivedViewOpen ? (
            <ArchivedConversationList
              key={user.id}
              activeConversationId={activeConversationId}
              onSelect={(id) => navigate(buildConversationPath(id))}
            />
          ) : isSearchActive ? (
            <MessagesSearchResultsList
              matchedConversations={matchedConversations}
              matchedPeople={matchedPeople}
              onSelectConversation={handleSelectFromSearch}
              onStartChat={handleStartChat}
            />
          ) : (
            <ConversationList
              key={user.id}
              activeConversationId={activeConversationId}
              onSelect={(id) => navigate(buildConversationPath(id))}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex-1 flex-col',
          activeConversationId ? 'flex' : 'hidden md:flex'
        )}
      >
        {isLoadingActiveConversation ? (
          <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
            Loading conversation…
          </div>
        ) : !activeConversation ? (
          <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
            {activeConversationId
              ? 'Conversation not found.'
              : 'Select a conversation to start chatting.'}
          </div>
        ) : (
          <MessageThread
            key={user.id}
            conversation={activeConversation}
            myUserId={user.id}
            socket={socket}
            onBack={() => navigate(CLIENT_ROUTES.MESSAGES)}
            onOpenGroupInfo={
              activeConversation.type === 'group'
                ? () => setIsGroupInfoOpen(true)
                : undefined
            }
          />
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreated={(id) => navigate(buildConversationPath(id))}
      />
      {activeConversation?.type === 'group' && (
        <>
          <GroupInfoPanel
            isOpen={isGroupInfoOpen}
            onClose={() => setIsGroupInfoOpen(false)}
            conversation={activeConversation}
            myUserId={user.id}
            onLeft={() => navigate(CLIENT_ROUTES.MESSAGES)}
            onAddParticipants={() => {
              setIsGroupInfoOpen(false);
              setIsAddParticipantsOpen(true);
            }}
          />
          <AddParticipantsModal
            isOpen={isAddParticipantsOpen}
            onClose={() => setIsAddParticipantsOpen(false)}
            conversationId={activeConversation.id}
            existingParticipantIds={activeConversation.participants.map(
              (participant) => participant.id
            )}
          />
        </>
      )}
    </div>
  );
};

export default MessagesPage;
