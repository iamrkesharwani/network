import { useState } from 'react';
import Button from '../../../shared/ui/primitives/Button';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping: () => void;
  isSending: boolean;
}

const MessageInput = ({ onSend, onTyping, isSending }: MessageInputProps) => {
  const [draft, setDraft] = useState('');

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await onSend(text);
  };

  return (
    <div className="flex gap-2 border-t border-border pt-3">
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
  );
};

export default MessageInput;
