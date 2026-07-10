import { useEffect, useState } from 'react';

const getInitialWidth = (): number => {
  if (typeof document === 'undefined') return 0;
  const main = document.querySelector('main');
  return (main ?? document.documentElement).clientWidth;
};

export const useMainWidth = (): number => {
  const [width, setWidth] = useState<number>(getInitialWidth);

  useEffect(() => {
    const main = document.querySelector('main');
    const target = main ?? document.documentElement;

    const obs = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  return width;
};
