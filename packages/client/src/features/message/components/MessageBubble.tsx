import { useEffect, useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { IConversationSummary, IMessageResponse } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { decryptMessage } from '../keyManager';
import { useDeleteMessageMutation } from '../messageApi';
import SeenByIndicator from './SeenByIndicator';

interface MessageBubbleProps {
  message: IMessageResponse;
  privateKey: CryptoKey;
  myUserId: string;
  conversation: IConversationSummary;
  isLastFromSender: boolean;
}

const getDecryptFailureMessage = (
  message: IMessageResponse,
  myUserId: string
): string => {
  const hasSenderEntry = message.encryptedKeys.some(
    (entry) => entry.recipientId === message.senderId
  );
  if (!hasSenderEntry) {
    return "The sender hadn't set up messaging yet when this was sent.";
  }

  const hasMyEntry = message.encryptedKeys.some(
    (entry) => entry.recipientId === myUserId
  );
  if (!hasMyEntry) {
    return "You didn't have access to this conversation when it was sent.";
  }

  return 'Unable to decrypt this message.';
};

const MessageBubble = ({
  message,
  privateKey,
  myUserId,
  conversation,
  isLastFromSender,
}: MessageBubbleProps) => {
  const [text, setText] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteMessage] = useDeleteMessageMutation();
  const isOwn = message.senderId === myUserId;

  useEffect(() => {
    if (message.unsentAt) return;

    let cancelled = false;
    decryptMessage(message, privateKey, myUserId)
      .then((decrypted) => {
        if (!cancelled) setText(decrypted);
      })
      .catch(() => {
        if (!cancelled) setText(getDecryptFailureMessage(message, myUserId));
      });

    return () => {
      cancelled = true;
    };
  }, [message, privateKey, myUserId]);

  const handleDeleteForMe = () => {
    deleteMessage({ messageId: message.id, scope: 'me' });
    setIsMenuOpen(false);
  };

  const handleUnsendForEveryone = () => {
    deleteMessage({ messageId: message.id, scope: 'everyone' });
    setIsMenuOpen(false);
  };

  return (
    <div
      className={cn('group mb-2 flex', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div className="relative max-w-[75%]">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm',
            message.unsentAt
              ? 'bg-surface-raised italic text-text-muted'
              : isOwn
                ? 'bg-primary text-white'
                : 'bg-surface-raised text-text-primary'
          )}
        >
          {message.unsentAt ? 'This message was removed.' : (text ?? '...')}
        </div>

        <span
          className={cn(
            'mt-1 block text-[0.65rem] text-text-muted',
            isOwn ? 'text-right' : 'text-left'
          )}
        >
          {getRelativeDate(message.createdAt)}
        </span>

        {!message.unsentAt && (
          <div
            className={cn(
              'absolute -top-2 hidden group-hover:block',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="rounded-full bg-surface p-1 text-text-muted hover:text-text-primary"
              aria-label="Message options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {isMenuOpen && (
              <div
                className={cn(
                  'absolute z-10 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg',
                  isOwn ? 'right-0' : 'left-0'
                )}
              >
                <button
                  type="button"
                  onClick={handleDeleteForMe}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-primary hover:bg-surface-raised"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete for me
                </button>
                {isOwn && (
                  <button
                    type="button"
                    onClick={handleUnsendForEveryone}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-error hover:bg-surface-raised"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Unsend for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {isOwn && isLastFromSender && !message.unsentAt && (
          <SeenByIndicator
            message={message}
            conversation={conversation}
            viewerId={myUserId}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
