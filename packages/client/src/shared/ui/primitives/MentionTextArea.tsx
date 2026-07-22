import { useCallback } from 'react';
import { MentionsInput, Mention, type SuggestionDataItem } from 'react-mentions';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { searchApi } from '../../../features/search/searchApi';

export interface MentionTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: 'boxed' | 'underline';
  onFocus?: () => void;
  onBlur?: () => void;
}

const boxedStyle = {
  control: {
    fontSize: 14,
  },
  '&multiLine': {
    control: {
      minHeight: 36,
    },
    highlighter: {
      padding: '8px',
      border: '1px solid transparent',
    },
    input: {
      padding: '8px',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      color: 'var(--color-text-primary)',
      backgroundColor: 'var(--color-surface-raised)',
      outline: 'none',
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      fontSize: 14,
      overflow: 'hidden',
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      '&focused': {
        backgroundColor: 'var(--color-surface-raised)',
      },
    },
  },
};

const underlineStyle = {
  control: {
    fontSize: 16,
    fontWeight: 500,
  },
  '&multiLine': {
    control: {
      minHeight: 96,
    },
    highlighter: {
      padding: '0.55rem 0.1rem 0.65rem 0.1rem',
      border: '1px solid transparent',
    },
    input: {
      padding: '0.55rem 0.1rem 0.65rem 0.1rem',
      border: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
      borderRadius: 0,
      color: 'var(--color-text-primary)',
      backgroundColor: 'transparent',
      outline: 'none',
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      fontSize: 14,
      overflow: 'hidden',
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      '&focused': {
        backgroundColor: 'var(--color-surface-raised)',
      },
    },
  },
};

const MentionTextArea = ({
  value,
  onChange,
  placeholder,
  rows = 1,
  maxLength,
  className,
  autoFocus,
  disabled,
  variant = 'boxed',
  onFocus,
  onBlur,
}: MentionTextAreaProps) => {
  const dispatch = useAppDispatch();

  const fetchUsers = useCallback(
    (query: string, callback: (data: SuggestionDataItem[]) => void) => {
      if (!query) {
        callback([]);
        return;
      }

      dispatch(searchApi.endpoints.searchSuggestions.initiate({ q: query }))
        .unwrap()
        .then((response) => {
          callback(
            response.data.creators.map((creator) => ({
              id: creator.username,
              display: creator.username,
            }))
          );
        })
        .catch(() => callback([]));
    },
    [dispatch]
  );

  return (
    <MentionsInput
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      onBlur={() => onBlur?.()}
      onFocus={onFocus}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      allowSuggestionsAboveCursor
      suggestionsPortalHost={document.body}
      className={className}
      style={variant === 'underline' ? underlineStyle : boxedStyle}
      a11ySuggestionsListLabel="Mentioned users"
    >
      <Mention
        trigger="@"
        data={fetchUsers}
        markup="@__id__"
        displayTransform={(id: string) => `@${id}`}
        appendSpaceOnAdd
      />
    </MentionsInput>
  );
};

export default MentionTextArea;
