import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IPostResponse } from '@network/shared';
import MediaVisibilityBadge from '../../../shared/ui/card/MediaVisibilityBadge';
import UnlistedCountdownBadge from '../../../shared/ui/card/UnlistedCountdownBadge';

interface PostMediaProps {
  post: IPostResponse;
  daysLeft?: number | null;
}

const PostMedia = ({ post, daysLeft }: PostMediaProps) => {
  const [index, setIndex] = useState(0);
  const images = post.imageUrls ?? [];

  if (post.mediaType !== 'image' || images.length === 0) return null;

  const showArrows = images.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative bg-surface-raised aspect-video overflow-hidden">
      <img
        src={images[index]}
        alt={`Post attachment ${index + 1} of ${images.length}`}
        draggable={false}
        className="w-full h-full object-cover"
      />

      <MediaVisibilityBadge visibility={post.visibility} />
      {daysLeft !== undefined && daysLeft !== null && (
        <UnlistedCountdownBadge daysLeft={daysLeft} />
      )}

      {showArrows && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute top-1/2 left-2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((url, i) => (
              <span
                key={url}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PostMedia;
