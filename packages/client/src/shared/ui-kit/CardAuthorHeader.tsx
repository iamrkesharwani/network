import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getRelativeDate } from '@network/shared';
import Avatar from './Avatar';

interface CardAuthorHeaderProps {
  username: string;
  avatarUrl?: string;
  createdAt: string;
  menu?: ReactNode;
}

const CardAuthorHeader = ({
  username,
  avatarUrl,
  createdAt,
  menu,
}: CardAuthorHeaderProps) => (
  <div className="flex items-start gap-3">
    <Link
      to={`/profile/${username}`}
      className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={(e) => e.stopPropagation()}
    >
      <Avatar src={avatarUrl} alt={username} size="sm" fallback={username} />
    </Link>

    <div className="flex-1 min-w-0">
      <Link
        to={`/profile/${username}`}
        className="text-sm font-semibold text-text-primary hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        onClick={(e) => e.stopPropagation()}
      >
        @{username}
      </Link>
      <p className="text-xs text-text-muted">{getRelativeDate(createdAt)}</p>
    </div>

    {menu}
  </div>
);

export default CardAuthorHeader;
