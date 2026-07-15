import { useEffect, useRef } from 'react';
import type { HistoryContentType } from '@network/shared';
import { useLazyGetResumeQuery } from '../../history/historyApi';

interface UseResumePlaybackOptions {
  contentType: HistoryContentType;
  contentId: string;
  userId: string | undefined;
  seek: (time: number) => void;
}

export function useResumePlayback({
  contentType,
  contentId,
  userId,
  seek,
}: UseResumePlaybackOptions): void {
  const [fetchResume] = useLazyGetResumeQuery();
  const resumedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || !contentId) return;

    const key = `${contentType}:${contentId}`;
    if (resumedKeyRef.current === key) return;
    resumedKeyRef.current = key;

    fetchResume({ contentType, contentId })
      .unwrap()
      .then((response) => {
        const resume = response.data;
        if (resume && resume.currentTime > 0) {
          seek(resume.currentTime);
        }
      })
      .catch(() => {});
  }, [contentType, contentId, userId, fetchResume, seek]);
}
