import { useState } from 'react';
import { X, Timer } from 'lucide-react';
import type { ConversationDisappearingTtl } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import Button from '../../../shared/ui/primitives/Button';

interface MessageInputProps {
  onSend: (text: string, ttlOverride?: ConversationDisappearingTtl) => Promise<void>;
  onTyping: () => void;
  isSending: boolean;
  replyToLabel?: string;
  onCancelReply?: () => void;
}

const TTL_OVERRIDE_OPTIONS: {
  ttl: ConversationDisappearingTtl | undefined;
  label: string;
}[] = [
  { ttl: undefined, label: 'Use conversation default' },
  { ttl: 'off', label: 'Off for this message' },
  { ttl: '24h', label: '24 hours' },
  { ttl: '7d', label: '7 days' },
];

const MessageInput = ({
  onSend,
  onTyping,
  isSending,
  replyToLabel,
  onCancelReply,
}: MessageInputProps) => {
  const [draft, setDraft] = useState('');
  const [ttlOverride, setTtlOverride] = useState<ConversationDisappearingTtl | undefined>(
    undefined
  );
  const [isTtlMenuOpen, setIsTtlMenuOpen] = useState(false);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await onSend(text, ttlOverride);
    setTtlOverride(undefined);
  };

  return (
    <div className="border-t border-border pt-3">
      {replyToLabel && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-raised px-3 py-1.5 text-xs">
          <span className="truncate text-text-muted">
            Replying to {replyToLabel}
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {ttlOverride && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-raised px-3 py-1.5 text-xs">
          <span className="text-text-muted">
            {ttlOverride === 'off'
              ? "This message won't disappear"
              : `This message disappears after ${ttlOverride === '24h' ? '24 hours' : '7 days'}`}
          </span>
          <button
            type="button"
            onClick={() => setTtlOverride(undefined)}
            aria-label="Clear disappearing-message override"
            className="shrink-0 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            onTyping();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsTtlMenuOpen((open) => !open)}
            aria-label="Disappearing message options for this message"
            className={cn(
              'rounded-lg border border-border p-2 text-icon hover:bg-surface-raised hover:text-icon-hover',
              ttlOverride && 'border-primary text-primary'
            )}
          >
            <Timer className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {isTtlMenuOpen && (
            <div className="absolute bottom-full right-0 z-10 mb-1 w-52 rounded-lg border border-border bg-surface shadow-lg">
              {TTL_OVERRIDE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setTtlOverride(option.ttl);
                    setIsTtlMenuOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left text-xs hover:bg-surface-raised',
                    option.ttl === ttlOverride ? 'text-primary' : 'text-text-primary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSend} isLoading={isSending}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
