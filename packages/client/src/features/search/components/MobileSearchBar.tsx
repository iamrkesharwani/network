import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { useSearchNavigation } from '../hooks/useSearchNavigation';
import SearchSuggestionsDropdown from './SearchSuggestionsDropdown';

interface MobileSearchBarProps {
  className?: string;
}

const MobileSearchBar = ({ className }: MobileSearchBarProps) => {
  const [searchParams] = useSearchParams();
  const hasInitialQuery = !!searchParams.get('q')?.trim();

  const {
    searchInput,
    setSearchInput,
    searchInputRef,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleClearSearch,
    handleSearchFocus,
    handleSearchBlur,
    isOpen,
    items,
    highlightedIndex,
    setHighlightedIndex,
    goToItem,
    removeRecent,
  } = useSearchNavigation(!hasInitialQuery);

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={cn('relative md:hidden', className)}
    >
      <Search className="absolute left-3 bottom-1 -translate-y-1/2 w-4 h-4 text-icon pointer-events-none" />
      <input
        ref={searchInputRef}
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        placeholder="Search videos, creators..."
        className="w-full h-10 pl-9 pr-9 rounded-lg bg-surface-raised border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
      />
      {searchInput && (
        <button
          type="button"
          onClick={handleClearSearch}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-icon hover:text-icon-hover hover:bg-surface-overlay transition-colors focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <SearchSuggestionsDropdown
        isOpen={isOpen}
        items={items}
        highlightedIndex={highlightedIndex}
        onHighlight={setHighlightedIndex}
        onSelect={goToItem}
        onRemoveRecent={removeRecent}
      />
    </form>
  );
};

export default MobileSearchBar;
