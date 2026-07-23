import type { IPublicProfile } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { Link } from 'react-router-dom';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import FollowButton from '../../follow/components/FollowButton';

interface CreatorResultCardProps {
  creator: IPublicProfile;
}

const CreatorResultCard = ({ creator }: CreatorResultCardProps) => {
  const ownUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwnProfile = ownUserId === creator.id;

  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors text-center">
      <Link
        to={buildProfilePath(creator.username)}
        className="flex w-full flex-col items-center gap-3"
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

      {!isOwnProfile && (
        <FollowButton
          username={creator.username}
          followState={creator.followState ?? 'none'}
          className="w-full"
        />
      )}
    </div>
  );
};

export default CreatorResultCard;
