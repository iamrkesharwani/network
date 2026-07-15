import { Search, X, ArrowLeft } from 'lucide-react';
import { useSearchNavigation } from '../hooks/useSearchNavigation';

export interface MobileSearchOverlayProps {
  onClose: () => void;
}

const MobileSearchOverlay = ({ onClose }: MobileSearchOverlayProps) => {
  const {
    searchInput,
    setSearchInput,
    searchInputRef,
    handleSearchSubmit,
    handleClearSearch,
  } = useSearchNavigation(true);

  const handleSubmit = (e: React.SyntheticEvent) => {
    handleSearchSubmit(e);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex flex-col bg-surface">
      <div className="flex items-center gap-2 h-14 px-3 border-b border-border shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="p-2 -ml-1 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icon pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
        </form>
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
