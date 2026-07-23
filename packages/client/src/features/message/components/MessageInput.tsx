import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../shared/ui/primitives/Button';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping: () => void;
  isSending: boolean;
  replyToLabel?: string;
  onCancelReply?: () => void;
}

const MessageInput = ({
  onSend,
  onTyping,
  isSending,
  replyToLabel,
  onCancelReply,
}: MessageInputProps) => {
  const [draft, setDraft] = useState('');

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await onSend(text);
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
        <Button onClick={handleSend} isLoading={isSending}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
