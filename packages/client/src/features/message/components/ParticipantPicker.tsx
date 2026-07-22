import { useState } from 'react';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { useSearchCreatorsQuery } from '../../search/searchApi';

export interface ParticipantCandidate {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ParticipantPickerProps {
  selected: ParticipantCandidate[];
  onToggle: (candidate: ParticipantCandidate) => void;
  excludeIds?: string[];
}

const ParticipantPicker = ({
  selected,
  onToggle,
  excludeIds = [],
}: ParticipantPickerProps) => {
  const [query, setQuery] = useState('');
  const { data: searchResults } = useSearchCreatorsQuery(
    { q: query, limit: 10 },
    { skip: query.trim().length < 2 }
  );

  const results = (searchResults?.data ?? []).filter(
    (result) =>
      !excludeIds.includes(result.id) &&
      !selected.some((candidate) => candidate.id === result.id)
  );

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onToggle(candidate)}
              className="flex items-center gap-1.5 rounded-full bg-surface-raised px-2 py-1 text-xs text-text-primary"
            >
              <Avatar src={candidate.avatarUrl} fallback={candidate.name} size="sm" />
              {candidate.name} ✕
            </button>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search people..."
        className="mb-2 w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <div className="max-h-48 overflow-y-auto">
        {results.map((result) => (
          <button
            key={result.id}
            type="button"
            onClick={() =>
              onToggle({ id: result.id, name: result.name, avatarUrl: result.avatarUrl })
            }
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-raised"
          >
            <Avatar src={result.avatarUrl} size="sm" fallback={result.name} />
            {result.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ParticipantPicker;
