import { MessageCircle } from 'lucide-react';
import usePageTitle from '../../../shared/hooks/usePageTitle';

const MessagesPlaceholder = () => {
  usePageTitle('Messages');

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-raised flex items-center justify-center">
        <MessageCircle className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-text-primary">
          Messages are coming soon
        </p>
        <p className="text-xs text-text-muted max-w-88">
          End-to-end encrypted chat is in the works. Check back soon.
        </p>
      </div>
    </div>
  );
};

export default MessagesPlaceholder;
