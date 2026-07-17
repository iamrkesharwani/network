import { Link } from 'react-router-dom';
import type { IPublicProfile } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';

interface CreatorResultCardProps {
  creator: IPublicProfile;
}

const CreatorResultCard = ({ creator }: CreatorResultCardProps) => (
  <Link
    to={buildProfilePath(creator.username)}
    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors text-center"
  >
    <Avatar
      src={creator.avatarUrl}
      alt={creator.username}
      size="lg"
      fallback={creator.username}
    />
    <div className="flex flex-col gap-0.5 min-w-0 w-full">
      <p className="text-sm font-semibold text-text-primary truncate">
        {creator.name}
      </p>
      <p className="text-xs text-text-muted truncate">@{creator.username}</p>
    </div>
  </Link>
);

export default CreatorResultCard;
