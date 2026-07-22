import { useEffect, useState } from 'react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import { getCachedKeyBundle } from '../localKeyStore';
import type { IWrappedPrivateKey } from '../keyManager';
import { useGetConversationsQuery, CONVERSATION_LIST_ARGS } from '../conversationApi';
import { useCreateDirectConversationMutation } from '../conversationApi';
import { useGetMyKeyBundleQuery } from '../keyBundleApi';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import KeySetupModal from '../components/KeySetupModal';
import KeyRecoveryModal from '../components/KeyRecoveryModal';
import KeyResetModal from '../components/KeyResetModal';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupInfoPanel from '../components/GroupInfoPanel';
import AddParticipantsModal from '../components/AddParticipantsModal';

const MessagesPage = () => {
  usePageTitle('Messages');
  const user = useAppSelector((state) => state.auth.user);
  const socketRef = useSocketContext();

  const [localWrapped, setLocalWrapped] = useState<
    IWrappedPrivateKey | null | undefined
  >(undefined);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getCachedKeyBundle(user.id).then((wrapped) => {
      if (cancelled) return;
      setLocalWrapped(wrapped);
      if (wrapped) setIsRecoveryOpen(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const { isSuccess: hasServerKeyBundle, isError: hasNoServerKeyBundle } =
    useGetMyKeyBundleQuery(undefined, {
      skip: !user || localWrapped === undefined || Boolean(localWrapped),
    });

  useEffect(() => {
    if (localWrapped === undefined || localWrapped) return;
    if (hasServerKeyBundle) setIsRecoveryOpen(true);
    else if (hasNoServerKeyBundle) setIsSetupOpen(true);
  }, [localWrapped, hasServerKeyBundle, hasNoServerKeyBundle]);

  const { data: conversationsData } = useGetConversationsQuery(
    CONVERSATION_LIST_ARGS,
    { skip: !privateKey }
  );
  const conversations = conversationsData?.data ?? [];
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  const { data: searchResults } = useSearchCreatorsQuery(
    { q: newChatQuery, limit: 10 },
    { skip: newChatQuery.trim().length < 2 }
  );
  const [createDirectConversation] = useCreateDirectConversationMutation();

  const handleStartChat = async (participantId: string) => {
    const result = await createDirectConversation({ participantId }).unwrap();
    setActiveConversationId(result.data.id);
    setIsNewChatOpen(false);
    setNewChatQuery('');
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex w-full max-w-xs shrink-0 flex-col overflow-y-auto border-r border-border pr-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary">
            Messages
          </h2>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsNewChatOpen((open) => !open)}
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
        </div>

        {isNewChatOpen && (
          <div className="mb-4 rounded-lg border border-border p-2">
            <input
              value={newChatQuery}
              onChange={(event) => setNewChatQuery(event.target.value)}
              placeholder="Search by username..."
              className="mb-2 w-full rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            />
            {searchResults?.data.map((result) => (
              <button
                key={result.id}
                onClick={() => handleStartChat(result.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-raised"
              >
                <Avatar src={result.avatarUrl} size="sm" fallback={result.name} />
                {result.name}
              </button>
            ))}
          </div>
        )}

        {privateKey && (
          <ConversationList
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            privateKey={privateKey}
            myUserId={user.id}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        {!activeConversation || !privateKey ? (
          <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
            Select a conversation to start chatting.
          </div>
        ) : (
          <MessageThread
            conversation={activeConversation}
            privateKey={privateKey}
            myUserId={user.id}
            socketRef={socketRef}
            onOpenGroupInfo={
              activeConversation.type === 'group'
                ? () => setIsGroupInfoOpen(true)
                : undefined
            }
          />
        )}
      </div>

      <KeySetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        userId={user.id}
        onKeyReady={setPrivateKey}
      />
      <KeyRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        userId={user.id}
        onKeyReady={setPrivateKey}
        onForgotPassphrase={() => {
          setIsRecoveryOpen(false);
          setIsResetOpen(true);
        }}
        localWrapped={localWrapped}
      />
      <KeyResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        userId={user.id}
        onKeyReady={setPrivateKey}
      />
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreated={setActiveConversationId}
      />
      {activeConversation?.type === 'group' && (
        <>
          <GroupInfoPanel
            isOpen={isGroupInfoOpen}
            onClose={() => setIsGroupInfoOpen(false)}
            conversation={activeConversation}
            myUserId={user.id}
            onLeft={() => setActiveConversationId(null)}
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
