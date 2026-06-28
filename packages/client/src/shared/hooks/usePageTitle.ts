import { useEffect } from 'react';

const BASE_TITLE = 'Network';

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${BASE_TITLE} · ${title}`;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
};

export default usePageTitle;
