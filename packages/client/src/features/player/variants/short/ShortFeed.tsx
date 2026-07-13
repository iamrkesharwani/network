import { useCallback, useEffect, useRef, useState } from 'react';
import { SHORTS_PREFETCH_THRESHOLD, type IShortResponse } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import ShortPlayer from '../../../short/pages/ShortPlayer';

interface ShortFeedProps {
  shorts: IShortResponse[];
  initialIndex: number;
  onIndexChange?: (index: number) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  className?: string;
}

const ShortFeed = ({
  shorts,
  initialIndex,
  onIndexChange,
  onLoadMore,
  hasNextPage = false,
  className,
}: ShortFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledToInitialRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    const container = scrollRef.current;
    const slide = slideRefs.current[index];
    if (!container || !slide) return;
    container.scrollTo({ top: slide.offsetTop, behavior });
  }, []);

  useEffect(() => {
    if (hasScrolledToInitialRef.current || shorts.length === 0) return;
    scrollToIndex(initialIndex, 'auto');
    hasScrolledToInitialRef.current = true;
  }, [initialIndex, shorts.length, scrollToIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) return;

          setActiveIndex(index);
          onIndexChange?.(index);

          if (hasNextPage && index >= shorts.length - SHORTS_PREFETCH_THRESHOLD) {
            onLoadMore?.();
          }
        });
      },
      { root: container, threshold: 0.75 }
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [shorts.length, hasNextPage, onLoadMore, onIndexChange]);

  const handleNext = useCallback(() => {
    scrollToIndex(Math.min(activeIndex + 1, shorts.length - 1), 'smooth');
  }, [activeIndex, shorts.length, scrollToIndex]);

  const handlePrev = useCallback(() => {
    scrollToIndex(Math.max(activeIndex - 1, 0), 'smooth');
  }, [activeIndex, scrollToIndex]);

  return (
    <div
      ref={scrollRef}
      className={cn('h-dvh w-full snap-y snap-mandatory overflow-y-scroll', className)}
    >
      {shorts.map((short, index) => {
        const withinWindow = Math.abs(index - activeIndex) <= 1;

        return (
          <div
            key={short.id}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            data-index={index}
            className="relative h-dvh w-full snap-start snap-always"
          >
            {withinWindow ? (
              <ShortPlayer
                short={short}
                activeIndex={index}
                total={shorts.length}
                onNext={handleNext}
                onPrev={handlePrev}
                isActive={index === activeIndex}
                className="rounded-none"
              />
            ) : short.thumbnailUrl ? (
              <img
                src={short.thumbnailUrl}
                alt={short.title}
                draggable={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-surface-overlay to-surface-raised" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShortFeed;
