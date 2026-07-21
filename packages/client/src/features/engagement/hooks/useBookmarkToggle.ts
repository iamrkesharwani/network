import { useCallback, useEffect, useState } from 'react';
import type { BookmarkableContentType } from '@network/shared';
import { useToggleBookmarkMutation } from '../bookmarkApi';

interface UseBookmarkToggleArgs {
  contentType: BookmarkableContentType;
  contentId: string;
  initialBookmarked: boolean;
}

interface UseBookmarkToggleResult {
  bookmarked: boolean;
  toggle: () => void;
}

export const useBookmarkToggle = ({
  contentType,
  contentId,
  initialBookmarked,
}: UseBookmarkToggleArgs): UseBookmarkToggleResult => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [toggleBookmarkMutation] = useToggleBookmarkMutation();

  useEffect(() => setBookmarked(initialBookmarked), [initialBookmarked]);

  const toggle = useCallback(() => {
    const wasBookmarked = bookmarked;
    const nextBookmarked = !wasBookmarked;

    setBookmarked(nextBookmarked);

    toggleBookmarkMutation({ contentType, contentId })
      .unwrap()
      .then((response) => {
        setBookmarked(response.data.bookmarked);
      })
      .catch(() => {
        setBookmarked(wasBookmarked);
      });
  }, [bookmarked, contentType, contentId, toggleBookmarkMutation]);

  return { bookmarked, toggle };
};
