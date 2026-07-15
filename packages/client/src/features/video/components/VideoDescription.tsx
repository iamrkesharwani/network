import { useState, type ReactNode } from 'react';

interface VideoDescriptionProps {
  description?: string;
  trailing?: ReactNode;
}

const VideoDescription = ({ description, trailing }: VideoDescriptionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-raised"
      >
        <span className="text-sm font-medium text-text-primary">
          {isOpen ? 'Hide description' : 'View description'}
        </span>

        {trailing}
      </button>

      {isOpen && (
        <p className="whitespace-pre-wrap border-t border-border px-3 py-2.5 text-sm text-text-secondary">
          {description || 'No description'}
        </p>
      )}
    </div>
  );
};

export default VideoDescription;
