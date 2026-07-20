import { useEffect, type RefObject } from 'react';
import type { EngageableContentType } from '@network/shared';
import {
  CONTENT_ROOM_JOIN_EVENT,
  CONTENT_ROOM_LEAVE_EVENT,
} from '@network/shared';
import { useIntersectionObserver } from '../../../shared/hooks/useIntersectionObserver';
import type { useSocket } from '../../../shared/hooks/useSocket';

export const useContentRoom = (
  socketRef: ReturnType<typeof useSocket>,
  contentType: EngageableContentType,
  contentId: string,
  elementRef: RefObject<Element | null>
): void => {
  const entry = useIntersectionObserver(elementRef, { threshold: 0 });
  const isVisible = Boolean(entry?.isIntersecting);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isVisible) return;

    socket.emit(CONTENT_ROOM_JOIN_EVENT, { contentType, contentId });

    return () => {
      socket.emit(CONTENT_ROOM_LEAVE_EVENT, { contentType, contentId });
    };
  }, [socketRef, isVisible, contentType, contentId]);
};
