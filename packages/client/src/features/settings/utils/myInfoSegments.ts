export type MyInfoSegment = 'basic' | 'personal' | 'contact' | null;

export const getActiveMyInfoSegment = (pathname: string): MyInfoSegment => {
  if (pathname.endsWith('/basic')) return 'basic';
  if (pathname.endsWith('/personal')) return 'personal';
  if (pathname.endsWith('/contact')) return 'contact';
  return null;
};
