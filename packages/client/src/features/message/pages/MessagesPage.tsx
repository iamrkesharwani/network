import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { cn } from '../../../shared/utils/cn';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import {
  getCachedPrivateKey,
  clearCachedPrivateKey,
  getCachedPinWrappedKey,
  clearCachedPinWrappedKey,
} from '../localKeyStore';
import {
  getPinConfig,
  isPinConfigured,
  clearPinConfig,
  shouldShowPinNudge,
  isPinReentryDue,
} from '../pinLockStore';
import { setPrivateKey } from '../messageKeySlice';
import { getApiErrorCode, getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import { buildConversationPath } from '../utils/buildMessagesPath';
import {
  useGetConversationsQuery,
  useGetArchivedConversationsQuery,
  CONVERSATION_LIST_ARGS,
  CONVERSATION_ARCHIVED_LIST_ARGS,
} from '../conversationApi';
import { useCreateDirectConversationMutation } from '../conversationApi';
import { useGetMyKeyBundleQuery } from '../keyBundleApi';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import KeySetupModal from '../components/KeySetupModal';
import KeyOtpModal from '../components/KeyOtpModal';
import KeyUnlockModal from '../components/KeyUnlockModal';
import KeyResetModal from '../components/KeyResetModal';
import PinEntryModal from '../components/PinEntryModal';
import PinSetupModal from '../components/PinSetupModal';
import ConversationList from '../components/ConversationList';
import ArchivedConversationList from '../components/ArchivedConversationList';
import MessageThread from '../components/MessageThread';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupInfoPanel from '../components/GroupInfoPanel';
import AddParticipantsModal from '../components/AddParticipantsModal';

const MessagesPage = () => {
  usePageTitle('Messages');
  const user = useAppSelector((state) => state.auth.user);
  const privateKey = useAppSelector((state) => state.messageKey.privateKey);
  const dispatch = useAppDispatch();
  const socketRef = useSocketContext();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const activeConversationId = conversationId ?? null;

  const [isCacheChecked, setIsCacheChecked] = useState(false);
  const [isSetupDismissed, setIsSetupDismissed] = useState(false);
  const [isUnlockDismissed, setIsUnlockDismissed] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [hasPendingPinCache, setHasPendingPinCache] = useState(false);
  const [isPinEntryOpen, setIsPinEntryOpen] = useState(false);
  const [isPinSetupOpen, setIsPinSetupOpen] = useState(false);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);
  const [isArchivedViewOpen, setIsArchivedViewOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const pinConfig = getPinConfig(user.id);
      if (pinConfig) {
        if (!isPinReentryDue(user.id)) {
          const rawKey = await getCachedPrivateKey(user.id);
          if (cancelled) return;
          if (rawKey) {
            dispatch(setPrivateKey(rawKey));
            setIsCacheChecked(true);
            return;
          }
        }

        const wrapped = await getCachedPinWrappedKey(user.id);
        if (cancelled) return;
        if (wrapped) {
          setHasPendingPinCache(true);
          setIsPinEntryOpen(true);
          setIsCacheChecked(true);
          return;
        }
        clearPinConfig(user.id);
      }

      const key = await getCachedPrivateKey(user.id);
      if (cancelled) return;
      if (key) dispatch(setPrivateKey(key));
      setIsCacheChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, dispatch]);

  const {
    data: keyBundleData,
    error: keyBundleError,
    isError: hasKeyBundleError,
    isSuccess: hasKeyBundleSuccess,
    refetch: refetchKeyBundle,
  } = useGetMyKeyBundleQuery(undefined, {
    skip:
      !user || !isCacheChecked || Boolean(privateKey) || hasPendingPinCache,
  });

  useEffect(() => {
    if (!user || !privateKey) return;
    if (!isPinConfigured(user.id) && shouldShowPinNudge(user.id)) {
      setIsPinSetupOpen(true);
    }
  }, [user, privateKey]);

  useEffect(() => {
    if (!user || !privateKey) return;
    if (isPinConfigured(user.id) && isPinReentryDue(user.id)) {
      dispatch(setPrivateKey(null));
      setHasPendingPinCache(true);
      setIsPinEntryOpen(true);
    }
  }, [user, privateKey, dispatch]);

  const handleForgotPin = () => {
    if (!user) return;
    clearPinConfig(user.id);
    void clearCachedPinWrappedKey(user.id);
    void clearCachedPrivateKey(user.id);
    setIsPinEntryOpen(false);
    setHasPendingPinCache(false);
  };

  const keyBundleErrorCode = hasKeyBundleError
    ? getApiErrorCode(keyBundleError)
    : undefined;
  const needsSetup =
    !privateKey && keyBundleErrorCode === 'NOT_FOUND' && !isSetupDismissed;
  const needsOtp =
    !privateKey && keyBundleErrorCode === 'OTP_VERIFICATION_REQUIRED';
  const needsUnlock = !privateKey && hasKeyBundleSuccess && !isUnlockDismissed;

  const { data: conversationsData, isLoading: isLoadingConversations } =
    useGetConversationsQuery(CONVERSATION_LIST_ARGS, { skip: !privateKey });
  const {
    data: archivedConversationsData,
    isLoading: isLoadingArchivedConversations,
  } = useGetArchivedConversationsQuery(CONVERSATION_ARCHIVED_LIST_ARGS, {
    skip: !privateKey,
  });
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
    <div className="flex h-[calc(100vh-8rem)] gap-4 pt-4 md:pt-0">
      <div
        className={cn(
          'w-full flex-col overflow-y-auto md:max-w-xs md:shrink-0 md:border-r md:border-border md:pr-3',
          activeConversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary">
            {isArchivedViewOpen ? 'Archived' : 'Messages'}
          </h2>
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

        {privateKey && isArchivedViewOpen && (
          <ArchivedConversationList
            activeConversationId={activeConversationId}
            onSelect={(id) => navigate(buildConversationPath(id))}
            privateKey={privateKey}
            myUserId={user.id}
          />
        )}
        {privateKey && !isArchivedViewOpen && (
          <ConversationList
            activeConversationId={activeConversationId}
            onSelect={(id) => navigate(buildConversationPath(id))}
            privateKey={privateKey}
            myUserId={user.id}
          />
        )}
      </div>

      <div
        className={cn(
          'flex-1 flex-col',
          activeConversationId ? 'flex' : 'hidden md:flex'
        )}
      >
        {!privateKey ? null : isLoadingActiveConversation ? (
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
            conversation={activeConversation}
            privateKey={privateKey}
            myUserId={user.id}
            socketRef={socketRef}
            onBack={() => navigate(CLIENT_ROUTES.MESSAGES)}
            onOpenGroupInfo={
              activeConversation.type === 'group'
                ? () => setIsGroupInfoOpen(true)
                : undefined
            }
          />
        )}
      </div>

      <KeySetupModal
        isOpen={needsSetup}
        onClose={() => setIsSetupDismissed(true)}
        userId={user.id}
        hasPassword={user.hasPassword}
        onKeyReady={(key) => dispatch(setPrivateKey(key))}
      />
      <KeyOtpModal isOpen={needsOtp} onVerified={() => refetchKeyBundle()} />
      <KeyUnlockModal
        isOpen={needsUnlock}
        onClose={() => setIsUnlockDismissed(true)}
        userId={user.id}
        hasPassword={user.hasPassword}
        keyBundle={keyBundleData?.data}
        onKeyReady={(key) => dispatch(setPrivateKey(key))}
        onReset={() => setIsResetOpen(true)}
      />
      <KeyResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        userId={user.id}
        hasPassword={user.hasPassword}
        onKeyReady={(key) => dispatch(setPrivateKey(key))}
      />
      <PinEntryModal
        isOpen={isPinEntryOpen}
        userId={user.id}
        pinLength={getPinConfig(user.id)?.length ?? 6}
        onUnlocked={(key) => {
          dispatch(setPrivateKey(key));
          setHasPendingPinCache(false);
          setIsPinEntryOpen(false);
        }}
        onForgotPin={handleForgotPin}
      />
      <PinSetupModal
        isOpen={isPinSetupOpen}
        userId={user.id}
        privateKey={privateKey}
        onClose={() => setIsPinSetupOpen(false)}
        onConfigured={() => setIsPinSetupOpen(false)}
      />
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
