import { Link } from 'react-router-dom';
import { formatCount } from '@network/shared';
import type { IShortResponse } from '@network/shared';

interface ShortCardFooterProps {
  short: IShortResponse;
  onTitleClick?: (e: React.MouseEvent) => void;
}

const ShortCardFooter = ({ short, onTitleClick }: ShortCardFooterProps) => (
  <div>
    <Link
      to={`/shorts/${short.id}`}
      onClick={(e) => {
        if (onTitleClick) {
          e.preventDefault();
          onTitleClick(e);
        }
      }}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
    >
      <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
        {short.title}
      </h3>
    </Link>

    <p className="mt-1 text-xs text-text-muted">
      {formatCount(short.views)} views
    </p>
  </div>
);

export default ShortCardFooter;
