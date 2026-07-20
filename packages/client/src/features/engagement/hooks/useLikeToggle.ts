import { useCallback, useEffect, useState } from 'react';
import type { EngageableContentType } from '@network/shared';
import { useToggleLikeMutation } from '../likeApi';

interface UseLikeToggleArgs {
  contentType: EngageableContentType;
  contentId: string;
  initialLiked: boolean;
  initialLikesCount: number;
}

interface UseLikeToggleResult {
  liked: boolean;
  likesCount: number;
  toggle: () => void;
}

export const useLikeToggle = ({
  contentType,
  contentId,
  initialLiked,
  initialLikesCount,
}: UseLikeToggleArgs): UseLikeToggleResult => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [toggleLikeMutation] = useToggleLikeMutation();

  useEffect(() => setLiked(initialLiked), [initialLiked]);
  useEffect(() => setLikesCount(initialLikesCount), [initialLikesCount]);

  const toggle = useCallback(() => {
    const wasLiked = liked;
    const nextLiked = !wasLiked;

    setLiked(nextLiked);
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    toggleLikeMutation({ contentType, contentId })
      .unwrap()
      .then((response) => {
        setLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
      })
      .catch(() => {
        setLiked(wasLiked);
        setLikesCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
      });
  }, [liked, contentType, contentId, toggleLikeMutation]);

  return { liked, likesCount, toggle };
};
