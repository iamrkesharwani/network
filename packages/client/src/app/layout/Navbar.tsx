import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X, Bell, UploadCloud } from 'lucide-react';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import {
  SITE_NAME,
  CLIENT_ROUTES,
  SEARCH_FOCUS_SHORTCUT_KEY,
} from '@network/shared';
import LogoIcon from '../../public/Logo.svg?react';
import { useSearchNavigation } from '../../features/search/hooks/useSearchNavigation';
import SearchSuggestionsDropdown from '../../features/search/components/SearchSuggestionsDropdown';
import NavbarAvatar from './NavbarAvatar';

export interface NavbarProps {
  onMobileMenuClick: () => void;
}

const Navbar = ({ onMobileMenuClick }: NavbarProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
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
  } = useSearchNavigation();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === SEARCH_FOCUS_SHORTCUT_KEY) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchInputRef]);

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-surface border-b border-border flex items-center px-4 sm:px-6">
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="p-2 -ml-1 rounded-lg md:hidden text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoIcon aria-hidden="true" className="w-7" />
          <span className="text-[1.4rem] font-semibold font-display text-text-primary tracking-tight group-hover:text-primary transition-colors">
            {SITE_NAME}
          </span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center px-10">
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icon pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search something..."
            className="w-full h-9 pl-9 pr-9 rounded-lg bg-surface-raised border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-surface transition-all"
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
      </div>

      <Link
        to={CLIENT_ROUTES.UPLOAD}
        aria-label="Upload"
        className="ml-auto p-2 rounded-lg md:hidden text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
      >
        <UploadCloud className="w-5 h-5" />
      </Link>

      <div className="hidden md:flex items-center gap-1 ml-auto shrink-0">
        {isAuthenticated ? (
          <>
            <button className="relative p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </button>

            <NavbarAvatar user={user} />
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <NavbarAvatar user={user} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
