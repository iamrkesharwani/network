import type { IPublicProfile } from '@network/shared';
import { PROFILE_BIO_PREVIEW_MAX_LENGTH } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';

export interface ProfileHeaderProps {
  profile: IPublicProfile;
}

const truncateBio = (bio: string): string =>
  bio.length > PROFILE_BIO_PREVIEW_MAX_LENGTH
    ? `${bio.slice(0, PROFILE_BIO_PREVIEW_MAX_LENGTH).trimEnd()}…`
    : bio;

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <div className="py-4 md:sticky md:top-0 md:z-10 md:bg-surface-alt">
      <div className="flex items-center gap-4">
        <Avatar
          size="xl"
          src={profile.avatarUrl}
          alt={profile.username}
          fallback={profile.username}
        />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold font-display text-text-primary truncate">
            {profile.name}
          </h1>
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
    </div>
  );
};

export default ProfileHeader;
