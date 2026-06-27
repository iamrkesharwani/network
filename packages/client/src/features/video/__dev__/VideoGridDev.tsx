import { useState } from 'react';
import VideoGrid from '../pages/VideoGrid';
import type { IVideoResponse } from '@network/shared';

const THUMBNAILS = [
  'https://picsum.photos/seed/v1/640/360',
  'https://picsum.photos/seed/v2/640/360',
  'https://picsum.photos/seed/v3/640/360',
  'https://picsum.photos/seed/v4/640/360',
  'https://picsum.photos/seed/v5/640/360',
  'https://picsum.photos/seed/v6/640/360',
  'https://picsum.photos/seed/v7/640/360',
  'https://picsum.photos/seed/v8/640/360',
];

const TITLES = [
  'Building a full-stack app with React and Node.js',
  'How I designed a dark theme that actually looks good',
  'The only Redux tutorial you need in 2025',
  'Stop overengineering your frontend — do this instead',
  'TypeScript tips that will change how you write code',
  'Why I switched from REST to tRPC and never looked back',
  'Deploying to production with zero downtime',
  'The hidden cost of premature optimization',
];

const makeVideo = (i: number): IVideoResponse => ({
  id: String(i + 1),
  title: TITLES[i % TITLES.length],
  description: '',
  thumbnailUrl: THUMBNAILS[i % THUMBNAILS.length],
  duration: 180 + i * 137,
  views: (i + 1) * 3_241,
  likes: 0,
  category: 'TECHNOLOGY',
  tags: [],
  status: 'READY',
  visibility: 'public',
  createdAt: new Date(Date.now() - i * 86_400_000),
  updatedAt: new Date(),
  author: {
    id: 'user-1',
    username: 'rahulkesharwani',
    avatarUrl: 'https://i.pravatar.cc/36?img=12',
  },
});

const PAGE_SIZE = 8;
const TOTAL = 20;

const allVideos = Array.from({ length: TOTAL }, (_, i) => makeVideo(i));

const VideoGridDev = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const videos = allVideos.slice(0, page * PAGE_SIZE);
  const hasNextPage = videos.length < TOTAL;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoading(false);
    }, 800);
  };

  return (
    <VideoGrid
      videos={videos}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isLoading}
      onLoadMore={handleLoadMore}
    />
  );
};

export default VideoGridDev;
