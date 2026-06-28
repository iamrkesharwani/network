import { Link } from 'react-router-dom';
import { formatCount, getRelativeDate } from '@network/shared';
import type { IShortResponse } from '@network/shared';
import ShortCardMenu from './ShortCardMenu';

interface ShortCardMetaProps {
  short: IShortResponse;
  isOwner: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const ShortCardMeta = ({
  short,
  isOwner,
  onEdit,
  onDeleteClick,
}: ShortCardMetaProps) => (
  <div className="flex items-start gap-2 px-0.5">
    <div className="flex-1 min-w-0">
      <Link
        to={`/shorts/${short.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {short.title}
        </h3>
      </Link>

      <Link
        to={`/profile/${short.author.username}`}
        className="block mt-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        onClick={(e) => e.stopPropagation()}
      >
        @{short.author.username}
      </Link>

      <p className="mt-0.5 text-xs text-text-muted">
        {formatCount(short.views)} views
        <span className="mx-1 opacity-40">·</span>
        {getRelativeDate(short.createdAt)}
      </p>
    </div>

    {isOwner && <ShortCardMenu onEdit={onEdit} onDeleteClick={onDeleteClick} />}
  </div>
);

export default ShortCardMeta;
