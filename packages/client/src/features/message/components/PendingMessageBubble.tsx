import { RotateCw } from 'lucide-react';
import { decodeMessagePayload } from '../messagePayload';
import { linkifyText } from '../utils/linkifyText';
import { cn } from '../../../shared/utils/cn';

export interface PendingMessage {
  clientId: string;
  content: string;
  replyToMessageId?: string;
  status: 'sending' | 'failed';
  startedAt: number;
}

interface PendingMessageBubbleProps {
  pending: PendingMessage;
  onRetry: (clientId: string) => void;
}

const PendingMessageBubble = ({ pending, onRetry }: PendingMessageBubbleProps) => {
  const { text } = decodeMessagePayload(pending.content);

  return (
    <div className="mb-0.5 flex justify-end">
      <div className="max-w-[75%]">
        <div
          className={cn(
            'rounded-2xl border px-3.5 py-2 text-sm text-text-primary',
            pending.status === 'failed'
              ? 'border-error/40 bg-error/5'
              : 'border-primary/40 bg-primary-subtle opacity-60'
          )}
        >
          {linkifyText(text)}
        </div>
        <span className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-text-muted">
          {pending.status === 'sending' ? (
            'Sending…'
          ) : (
            <>
              <span className="text-error">Failed to send</span>
              <button
                type="button"
                onClick={() => onRetry(pending.clientId)}
                className="flex items-center gap-0.5 font-medium text-primary hover:text-primary/80"
              >
                <RotateCw className="h-2.5 w-2.5" /> Retry
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default PendingMessageBubble;
