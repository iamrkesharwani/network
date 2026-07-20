import { useCallback, useEffect, useRef, useState } from 'react';
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
  justLiked: boolean;
}

const JUST_LIKED_WINDOW_MS = 600;

export const useLikeToggle = ({
  contentType,
  contentId,
  initialLiked,
  initialLikesCount,
}: UseLikeToggleArgs): UseLikeToggleResult => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [justLiked, setJustLiked] = useState(false);
  const [toggleLikeMutation] = useToggleLikeMutation();
  const justLikedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => setLiked(initialLiked), [initialLiked]);
  useEffect(() => setLikesCount(initialLikesCount), [initialLikesCount]);

  useEffect(() => () => clearTimeout(justLikedTimer.current), []);

  const toggle = useCallback(() => {
    const wasLiked = liked;
    const nextLiked = !wasLiked;

    setLiked(nextLiked);
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    if (nextLiked) {
      setJustLiked(true);
      clearTimeout(justLikedTimer.current);
      justLikedTimer.current = setTimeout(
        () => setJustLiked(false),
        JUST_LIKED_WINDOW_MS
      );
    }

    toggleLikeMutation({ contentType, contentId })
      .unwrap()
      .then((response) => {
        setLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
      })
      .catch(() => {
        setLiked(wasLiked);
        setLikesCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
        setJustLiked(false);
      });
  }, [liked, contentType, contentId, toggleLikeMutation]);

  return { liked, likesCount, toggle, justLiked };
};
