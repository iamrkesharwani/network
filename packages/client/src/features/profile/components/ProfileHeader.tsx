import type { IPublicProfile } from '@network/shared';
import { PROFILE_BIO_PREVIEW_MAX_LENGTH } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import TrustBadge from '../../creator/components/TrustBadge';

export interface ProfileHeaderProps {
  profile: IPublicProfile;
  isOwner: boolean;
}

const truncateBio = (bio: string): string =>
  bio.length > PROFILE_BIO_PREVIEW_MAX_LENGTH
    ? `${bio.slice(0, PROFILE_BIO_PREVIEW_MAX_LENGTH).trimEnd()}…`
    : bio;

const ProfileHeader = ({ profile, isOwner }: ProfileHeaderProps) => {
  return (
    <div className="pb-4 md:sticky pt-3 md:pt-0 md:top-0 md:z-10 md:bg-surface-alt">
      <div className="flex items-start gap-4">
        <Avatar
          size="xl"
          src={profile.avatarUrl}
          alt={profile.username}
          fallback={profile.username}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold font-display text-text-primary truncate">
              {profile.name}
            </h1>
            {isOwner && (
              <TrustBadge
                username={profile.username}
                className="hidden md:inline-flex"
              />
            )}
          </div>
          <p className="text-sm text-text-secondary truncate">
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="mt-1 text-sm text-text-secondary">
              {truncateBio(profile.bio)}
            </p>
          )}
        </div>
      </div>

      {isOwner && (
        <TrustBadge
          username={profile.username}
          variant="full"
          className="mt-4 md:hidden"
        />
      )}
    </div>
  );
};

export default ProfileHeader;
