import { useSearchParams } from 'react-router-dom';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import FeedRenderer from '../../feed/components/FeedRenderer';
import SearchTypeResults from '../components/SearchTypeResults';
import SearchCreatorResults from '../components/SearchCreatorResults';
import MobileSearchBar from '../components/MobileSearchBar';
import { SEARCH_TYPES, type SearchType } from '@network/shared';

type SearchTab = SearchType | 'all' | 'creator';

const TABS: SearchTab[] = ['all', ...SEARCH_TYPES, 'creator'];

const TAB_LABELS: Record<SearchTab, string> = {
  all: 'All',
  video: 'Videos',
  short: 'Shorts',
  post: 'Posts',
  creator: 'Creators',
};

const isSearchTab = (value: string | null): value is SearchTab =>
  value !== null && (TABS as string[]).includes(value);

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const rawType = searchParams.get('type');
  const activeTab: SearchTab = isSearchTab(rawType) ? rawType : 'all';

  usePageTitle(q ? `Search: ${q}` : 'Search');

  const handleTabChange = (tab: SearchTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'all') next.delete('type');
    else next.set('type', tab);
    setSearchParams(next, { replace: true });
  };

  if (!q) {
    return (
      <div className="flex flex-col gap-6">
        <MobileSearchBar />
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <p className="text-lg font-medium text-text-primary">
            Search for videos, shorts, posts, and creators
          </p>
          <p className="text-sm text-text-muted">
            Use the search bar above to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MobileSearchBar />

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <FeedRenderer
          source={{ mode: 'search', q }}
          emptyMessage={`No results for "${q}"`}
          emptySubMessage="Try a different search term."
        />
      )}
      {activeTab === 'creator' && <SearchCreatorResults q={q} />}
      {activeTab !== 'all' && activeTab !== 'creator' && (
        <SearchTypeResults q={q} type={activeTab} />
      )}
    </div>
  );
};

export default SearchResultsPage;
