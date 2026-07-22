import { useEffect, useMemo, useState } from 'react';
import type { IConversationSummary } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { cn } from '../../../shared/utils/cn';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import { getCachedKeyBundle } from '../localKeyStore';
import { decryptMessage, encryptForRecipients, type IWrappedPrivateKey } from '../keyManager';
import {
  useGetConversationsQuery,
  useCreateDirectConversationMutation,
  useMarkConversationReadMutation,
  CONVERSATION_LIST_ARGS,
} from '../conversationApi';
import { useGetMessagesQuery, useSendMessageMutation } from '../messageApi';
import { useGetMyKeyBundleQuery, useGetPublicKeysQuery } from '../keyBundleApi';
import { useConversationRoom } from '../hooks/useConversationRoom';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import KeySetupModal from '../components/KeySetupModal';
import KeyRecoveryModal from '../components/KeyRecoveryModal';
import KeyResetModal from '../components/KeyResetModal';

const MESSAGE_LIST_ARGS = { limit: 30 };

const getConversationLabel = (conversation: IConversationSummary): string =>
  conversation.type === 'direct'
    ? conversation.otherParticipant.name
    : conversation.groupName;

const getConversationAvatarProps = (conversation: IConversationSummary) =>
  conversation.type === 'direct'
    ? {
        src: conversation.otherParticipant.avatarUrl,
        isOnline: conversation.otherParticipant.isOnline,
      }
    : { src: conversation.groupAvatarUrl, isOnline: undefined };

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
  const [draft, setDraft] = useState('');
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [newChatQuery, setNewChatQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

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

  const { emitTyping } = useConversationRoom(socketRef, activeConversationId);

  const { data: conversationsData } = useGetConversationsQuery(
    CONVERSATION_LIST_ARGS,
    { skip: !privateKey }
  );
  const conversations = conversationsData?.data ?? [];
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  const { data: messagesData } = useGetMessagesQuery(
    { conversationId: activeConversationId ?? '', ...MESSAGE_LIST_ARGS },
    { skip: !activeConversationId || !privateKey }
  );
  const messages = messagesData?.data ?? [];

  useEffect(() => {
    if (!privateKey || !user) return;

    messages.forEach((message) => {
      if (message.unsentAt || decrypted[message.id] !== undefined) return;

      decryptMessage(message, privateKey, user.id)
        .then((text) =>
          setDecrypted((prev) => ({ ...prev, [message.id]: text }))
        )
        .catch(() =>
          setDecrypted((prev) => ({
            ...prev,
            [message.id]: 'Unable to decrypt this message.',
          }))
        );
    });
  }, [messages, privateKey, user, decrypted]);

  const recipientIds = useMemo(() => {
    if (!activeConversation || !user) return [];
    return activeConversation.type === 'direct'
      ? [activeConversation.otherParticipant.id, user.id]
      : activeConversation.participants.map((participant) => participant.id);
  }, [activeConversation, user]);

  const { data: publicKeysData } = useGetPublicKeysQuery(recipientIds, {
    skip: recipientIds.length === 0,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markConversationRead] = useMarkConversationReadMutation();
  const [createDirectConversation] = useCreateDirectConversationMutation();

  useEffect(() => {
    if (activeConversationId && activeConversation?.isUnread) {
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId, activeConversation?.isUnread, markConversationRead]);

  const { data: searchResults } = useSearchCreatorsQuery(
    { q: newChatQuery, limit: 10 },
    { skip: newChatQuery.trim().length < 2 }
  );

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeConversationId || !publicKeysData) return;

    const recipients = publicKeysData.data.map((key) => ({
      userId: key.userId,
      publicKey: key.publicKey,
    }));
    const { ciphertext, iv, encryptedKeys } = await encryptForRecipients(
      text,
      recipients
    );

    await sendMessage({
      conversationId: activeConversationId,
      ciphertext,
      iv,
      encryptedKeys,
    }).unwrap();

    setDraft('');
  };

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewChatOpen((open) => !open)}
          >
            New
          </Button>
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

        {conversations.length === 0 && (
          <p className="text-sm text-text-muted">No conversations yet.</p>
        )}

        {conversations.map((conversation) => {
          const avatarProps = getConversationAvatarProps(conversation);
          return (
            <button
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-raised',
                activeConversationId === conversation.id && 'bg-surface-raised'
              )}
            >
              <Avatar
                src={avatarProps.src}
                isOnline={avatarProps.isOnline}
                fallback={getConversationLabel(conversation)}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                {getConversationLabel(conversation)}
              </span>
              {conversation.isUnread && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col">
        {!activeConversation ? (
          <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            <div className="border-b border-border pb-3">
              <p className="font-semibold text-text-primary">
                {getConversationLabel(activeConversation)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {[...messages].reverse().map((message) => (
                <div key={message.id} className="mb-2">
                  <p className="text-sm text-text-primary">
                    {message.unsentAt
                      ? 'This message was removed.'
                      : (decrypted[message.id] ?? '...')}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  emitTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend();
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <Button onClick={handleSend} isLoading={isSending}>
                Send
              </Button>
            </div>
          </>
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
    </div>
  );
};

export default MessagesPage;
