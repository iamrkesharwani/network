import { Clapperboard, FileText, History, Search, X, Zap } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import type { SuggestionListItem } from '../hooks/useSearchNavigation';
import Avatar from '../../../shared/ui/primitives/Avatar';

interface SearchSuggestionsDropdownProps {
  isOpen: boolean;
  items: SuggestionListItem[];
  highlightedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (item: SuggestionListItem) => void;
  onRemoveRecent: (query: string) => void;
  className?: string;
}

const rowKey = (item: SuggestionListItem): string => {
  switch (item.kind) {
    case 'recent':
      return `recent:${item.query}`;
    case 'creator':
      return `creator:${item.creator.id}`;
    case 'video':
      return `video:${item.video.id}`;
    case 'short':
      return `short:${item.short.id}`;
    case 'post':
      return `post:${item.post.id}`;
    case 'see-all':
      return 'see-all';
  }
};

const SearchSuggestionsDropdown = ({
  isOpen,
  items,
  highlightedIndex,
  onHighlight,
  onSelect,
  onRemoveRecent,
  className,
}: SearchSuggestionsDropdownProps) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg z-50',
        className
      )}
    >
      {items.map((item, index) => {
        const isHighlighted = index === highlightedIndex;
        const rowClassName = cn(
          'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
          isHighlighted
            ? 'bg-surface-raised text-text-primary'
            : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
        );

        if (item.kind === 'recent') {
          return (
            <button
              key={rowKey(item)}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHighlight(index)}
              onClick={() => onSelect(item)}
              className={rowClassName}
            >
              <History className="h-4 w-4 shrink-0 text-icon" />
              <span className="min-w-0 flex-1 truncate">{item.query}</span>
              <span
                role="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent(item.query);
                }}
                aria-label={`Remove "${item.query}" from recent searches`}
                className="shrink-0 rounded-md p-1 text-icon hover:bg-surface-overlay hover:text-icon-hover"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        }

        if (item.kind === 'creator') {
          return (
            <button
              key={rowKey(item)}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHighlight(index)}
              onClick={() => onSelect(item)}
              className={rowClassName}
            >
              <Avatar
                src={item.creator.avatarUrl}
                alt={item.creator.username}
                size="sm"
                fallback={item.creator.username}
              />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium text-text-primary">
                  {item.creator.name}
                </span>
                <span className="ml-1.5 text-text-muted">
                  @{item.creator.username}
                </span>
              </span>
            </button>
          );
        }

        if (item.kind === 'video' || item.kind === 'short') {
          const media = item.kind === 'video' ? item.video : item.short;
          const Icon = item.kind === 'video' ? Clapperboard : Zap;
          return (
            <button
              key={rowKey(item)}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHighlight(index)}
              onClick={() => onSelect(item)}
              className={rowClassName}
            >
              {media.thumbnailUrl ? (
                <img
                  src={media.thumbnailUrl}
                  alt=""
                  className="h-8 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-icon" />
              )}
              <span className="min-w-0 flex-1 truncate">{media.title}</span>
            </button>
          );
        }

        if (item.kind === 'post') {
          return (
            <button
              key={rowKey(item)}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHighlight(index)}
              onClick={() => onSelect(item)}
              className={rowClassName}
            >
              {item.post.imageUrls?.[0] ? (
                <img
                  src={item.post.imageUrls[0]}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-icon" />
              )}
              <span className="min-w-0 flex-1 truncate">
                {item.post.text || 'Post'}
              </span>
            </button>
          );
        }

        return (
          <button
            key={rowKey(item)}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onHighlight(index)}
            onClick={() => onSelect(item)}
            className={rowClassName}
          >
            <Search className="h-4 w-4 shrink-0 text-icon" />
            <span className="min-w-0 flex-1 truncate">
              Search for "{item.query}"
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchSuggestionsDropdown;
