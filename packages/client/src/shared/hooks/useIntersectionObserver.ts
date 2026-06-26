import { useEffect, useRef, useState, type RefObject } from 'react';

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: Args
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  const thresholdRef = useRef(threshold);
  useEffect(() => {
    thresholdRef.current = threshold;
  });

  useEffect(() => {
    const node = elementRef?.current;
    if (!window.IntersectionObserver || frozen || !node) return;

    const observer = new IntersectionObserver(
      ([newEntry]) => setEntry(newEntry),
      { threshold: thresholdRef.current, root, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef, thresholdKey, root, rootMargin, frozen]);

  return entry;
}
