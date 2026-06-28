import { useEffect } from 'react';
import { SITE_NAME } from '@network/shared';

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${SITE_NAME} · ${title}`;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
};

export default usePageTitle;
