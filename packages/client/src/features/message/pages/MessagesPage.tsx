import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { cn } from '../../../shared/utils/cn';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import { buildConversationPath } from '../utils/buildMessagesPath';
import {
  useGetConversationsQuery,
  useGetArchivedConversationsQuery,
  CONVERSATION_LIST_ARGS,
  CONVERSATION_ARCHIVED_LIST_ARGS,
} from '../conversationApi';
import { useCreateDirectConversationMutation } from '../conversationApi';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import ConversationList from '../components/ConversationList';
import ArchivedConversationList from '../components/ArchivedConversationList';
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

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);
  const [isArchivedViewOpen, setIsArchivedViewOpen] = useState(false);

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

  const { data: searchResults } = useSearchCreatorsQuery(
    { q: newChatQuery, limit: 10 },
    { skip: newChatQuery.trim().length < 2 }
  );
  const [createDirectConversation] = useCreateDirectConversationMutation();

  const handleStartChat = async (participantId: string) => {
    setNewChatError(null);
    try {
      const result = await createDirectConversation({ participantId }).unwrap();
      navigate(buildConversationPath(result.data.id));
      setIsNewChatOpen(false);
      setNewChatQuery('');
    } catch (error) {
      setNewChatError(
        getApiErrorMessage(error, 'Could not start this conversation. Please try again.')
      );
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] gap-4 pt-4 md:h-[calc(100vh-8rem)] md:pt-0">
      <div
        className={cn(
          'w-full flex-col overflow-y-auto md:max-w-xs md:shrink-0 md:border-r md:border-border md:pr-3',
          activeConversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(CLIENT_ROUTES.FEED)}
              aria-label="Leave Messages"
              className="-ml-1.5 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover md:hidden"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <h2 className="font-display text-xl font-bold text-text-primary">
              {isArchivedViewOpen ? 'Archived' : 'Messages'}
            </h2>
          </div>
          {isArchivedViewOpen ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsArchivedViewOpen(false)}
            >
              Back to chats
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsArchivedViewOpen(true)}
              >
                Archived
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsNewChatOpen((open) => !open);
                  setNewChatError(null);
                }}
              >
                New
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreateGroupOpen(true)}
              >
                Group
              </Button>
            </div>
          )}
        </div>

        {!isArchivedViewOpen && isNewChatOpen && (
          <div className="mb-4 rounded-lg border border-border p-2">
            <input
              value={newChatQuery}
              onChange={(event) => {
                setNewChatQuery(event.target.value);
                setNewChatError(null);
              }}
              placeholder="Search by username..."
              className="mb-2 w-full rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            />
            {newChatError && (
              <p className="mb-2 text-sm text-error" role="alert">
                {newChatError}
              </p>
            )}
            {searchResults?.data.map((result) => (
              <button
                key={result.id}
                onClick={() => handleStartChat(result.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-raised"
              >
                <Avatar
                  src={result.avatarUrl}
                  size="sm"
                  fallback={result.name}
                />
                {result.name}
              </button>
            ))}
          </div>
        )}

        {isArchivedViewOpen && (
          <ArchivedConversationList
            key={user.id}
            activeConversationId={activeConversationId}
            onSelect={(id) => navigate(buildConversationPath(id))}
          />
        )}
        {!isArchivedViewOpen && (
          <ConversationList
            key={user.id}
            activeConversationId={activeConversationId}
            onSelect={(id) => navigate(buildConversationPath(id))}
          />
        )}
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
