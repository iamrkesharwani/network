import { useCallback, useState } from 'react';
import type { ContentType } from '@network/shared';
import { useLiveFeed } from '../../feed/hooks/useLiveFeed';
import { useListCommentsQuery } from '../commentApi';
import { REPLIES_PAGE_LIMIT } from '@network/shared';

export const useCommentThread = (
  contentType: ContentType,
  contentId: string,
  parentCommentId: string,
  initiallyExpanded = false
) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const repliesFeed = useLiveFeed(
    (args) =>
      useListCommentsQuery(
        { contentType, contentId, parentCommentId, ...args },
        { skip: !expanded }
      ),
    REPLIES_PAGE_LIMIT
  );

  const toggle = useCallback(() => setExpanded((value) => !value), []);

  return { expanded, toggle, ...repliesFeed };
};
