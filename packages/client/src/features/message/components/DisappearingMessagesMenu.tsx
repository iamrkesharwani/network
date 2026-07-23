import { useState } from 'react';
import { Timer } from 'lucide-react';
import type { ConversationDisappearingTtl, IConversationSummary } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useSetDisappearingTtlMutation } from '../conversationApi';

interface DisappearingMessagesMenuProps {
  conversation: IConversationSummary;
  canEdit: boolean;
}

const TTL_OPTIONS: { ttl: ConversationDisappearingTtl; label: string }[] = [
  { ttl: 'off', label: 'Off' },
  { ttl: '24h', label: '24 hours' },
  { ttl: '7d', label: '7 days' },
];

const DisappearingMessagesMenu = ({
  conversation,
  canEdit,
}: DisappearingMessagesMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [setDisappearingTtl] = useSetDisappearingTtlMutation();

  const handleSelect = async (ttl: ConversationDisappearingTtl) => {
    setIsOpen(false);
    if (ttl === conversation.disappearingMessagesTtl) return;
    await setDisappearingTtl({ conversationId: conversation.id, ttl }).unwrap();
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => canEdit && setIsOpen((open) => !open)}
        aria-label="Disappearing messages"
        title={
          canEdit
            ? 'Disappearing messages'
            : 'Only the group creator can change this'
        }
        className={cn(
          'rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover',
          conversation.disappearingMessagesTtl !== 'off' && 'text-primary',
          !canEdit && 'cursor-default opacity-50'
        )}
      >
        <Timer className="h-4.5 w-4.5" strokeWidth={1.75} />
      </button>

      {isOpen && canEdit && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg">
          {TTL_OPTIONS.map((option) => (
            <button
              key={option.ttl}
              type="button"
              onClick={() => handleSelect(option.ttl)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-surface-raised',
                option.ttl === conversation.disappearingMessagesTtl
                  ? 'text-primary'
                  : 'text-text-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisappearingMessagesMenu;
