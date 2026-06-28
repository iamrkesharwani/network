import type { IShortResponse, IVideoResponse } from '@network/shared';

const makeShort = (i: number): IShortResponse => ({
  id: String(i + 1),
  title: [
    'Morning routine that changed my life',
    'One CSS trick nobody uses',
    'Ship faster with this',
    'Dark mode done right',
    'Stop writing useEffect like this',
    'My setup for deep work',
    'This React pattern is underrated',
    'Tailwind tip nobody talks about',
    'The git command I use every day',
    'Why I quit my 9-to-5',
  ][i % 10],
  description: '',
  thumbnailUrl: `https://picsum.photos/seed/sp${i}/360/640`,
  duration: 15 + (i % 5) * 10,
  views: (i + 1) * 2_100,
  likes: (i + 1) * 430,
  tags: [],
  status: 'READY',
  visibility: 'public',
  createdAt: new Date(Date.now() - i * 43_200_000).toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 'u1',
    username: 'rahulkesharwani',
    avatarUrl: 'https://i.pravatar.cc/36?img=12',
  },
});

const makeVideo = (i: number): IVideoResponse => ({
  id: String(i + 1),
  title: [
    'Building a full-stack app with React and Node.js',
    'How I designed a dark theme that actually looks good',
    'The only Redux tutorial you need in 2025',
    'Stop overengineering your frontend',
    'TypeScript tips that will change how you write code',
    'Why I switched from REST to tRPC',
    'Deploying to production with zero downtime',
    'The hidden cost of premature optimization',
  ][i % 8],
  description: '',
  thumbnailUrl: `https://picsum.photos/seed/v${i + 1}/640/360`,
  duration: 180 + i * 137,
  views: (i + 1) * 3_241,
  likes: 0,
  category: 'TECHNOLOGY',
  tags: [],
  status: 'READY',
  visibility: 'public',
  createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 'u1',
    username: 'rahulkesharwani',
    avatarUrl: 'https://i.pravatar.cc/36?img=12',
  },
});

export const ALL_SHORTS = Array.from({ length: 10 }, (_, i) => makeShort(i));
export const ALL_VIDEOS = Array.from({ length: 20 }, (_, i) => makeVideo(i));
export const VIDEO_PAGE_SIZE = 8;
