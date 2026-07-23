import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLIENT_ROUTES, type IPublicProfile } from '@network/shared';
import { formatCount } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useTheme } from '../../../shared/hooks/useTheme';
import Avatar from '../../../shared/ui/primitives/Avatar';
import TrustBadge from '../../creator/components/TrustBadge';
import FollowButton from '../../follow/components/FollowButton';
import { useGetFollowRequestCountQuery } from '../../follow/followApi';
import {
  buildFollowersPath,
  buildFollowingPath,
} from '../utils/buildProfilePath';
import BioModal from './BioModal';
import ProfileOptionsMenu from './ProfileOptionsMenu';

export interface ProfileHeaderProps {
  profile: IPublicProfile;
  isOwner: boolean;
}

const ProfileHeader = ({ profile, isOwner }: ProfileHeaderProps) => {
  const { isDark } = useTheme();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const showRequestsEntry = isOwner && profile.isPrivate;
  const { data: requestCountData } = useGetFollowRequestCountQuery(undefined, {
    skip: !showRequestsEntry,
  });
  const pendingRequestCount = requestCountData?.data.count ?? 0;

  const glassBorder = isDark ? 'border-white/15' : 'border-black/10';
  const glassRing = isDark ? 'ring-white/20' : 'ring-black/10';
  const pillClass = cn(
    'flex h-9 items-center rounded-lg border px-4 text-sm transition-colors hover:border-primary/40',
    glassBorder
  );

  return (
    <div className="pb-4">
      <div className="relative -mx-4 mt-0 w-[calc(100%+2rem)] min-h-36 overflow-hidden rounded-b-xl bg-surface-raised md:-mx-5 md:-mt-5 md:w-[calc(100%+2.5rem)] md:min-h-44">
        {profile.bannerUrl && (
          <img
            src={profile.bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-surface-alt" />

        <div
          className={cn(
            'relative z-10 mx-auto my-4 flex w-[calc(100%-2rem)] max-w-xl flex-col gap-3 rounded-xl border p-4 backdrop-blur-md md:my-6 md:p-5',
            glassBorder,
            'bg-surface-overlay/85'
          )}
        >
          {!isOwner && (
            <div className="absolute right-3 top-3">
              <ProfileOptionsMenu username={profile.username} name={profile.name} />
            </div>
          )}

          <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
            <div className="flex items-start gap-3">
              <Avatar
                size="xl"
                src={profile.avatarUrl}
                alt={profile.username}
                fallback={profile.username}
                className={cn('ring-2', glassRing)}
              />

              <div className="min-w-0 flex-1 pt-1">
                <h1 className="truncate text-lg font-semibold font-display text-text-primary">
                  {profile.name}
                </h1>
                <p className="truncate text-sm font-medium text-text-secondary">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <button
                    type="button"
                    onClick={() => setIsBioModalOpen(true)}
                    className="mt-1 flex w-full cursor-pointer items-baseline gap-1.5 text-left text-sm text-text-secondary"
                  >
                    <span className="min-w-0 truncate">{profile.bio}</span>
                    <span className="shrink-0 font-medium text-primary hover:underline">
                      Read more
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-stretch gap-2 text-sm md:hidden">
              <Link
                to={buildFollowersPath(profile.username)}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-center"
              >
                <span className="text-base font-semibold text-text-primary">
                  {formatCount(profile.followerCount)}
                </span>
                <span className="text-xs text-text-secondary">Followers</span>
              </Link>
              <Link
                to={buildFollowingPath(profile.username)}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-center"
              >
                <span className="text-base font-semibold text-text-primary">
                  {formatCount(profile.followingCount)}
                </span>
                <span className="text-xs text-text-secondary">Following</span>
              </Link>

              {isOwner ? (
                <TrustBadge
                  username={profile.username}
                  variant="stacked"
                  className="flex-1"
                />
              ) : (
                <FollowButton
                  username={profile.username}
                  followState={profile.followState ?? 'none'}
                  className="h-auto! flex-1 py-2! font-semibold!"
                />
              )}
            </div>

            <div className="hidden items-center gap-2 text-sm md:flex">
              <Link
                to={buildFollowersPath(profile.username)}
                className={pillClass}
              >
                <span className="font-semibold text-text-primary">
                  {formatCount(profile.followerCount)}
                </span>
                <span className="ml-1 text-text-secondary">Followers</span>
              </Link>
              <Link
                to={buildFollowingPath(profile.username)}
                className={pillClass}
              >
                <span className="font-semibold text-text-primary">
                  {formatCount(profile.followingCount)}
                </span>
                <span className="ml-1 text-text-secondary">Following</span>
              </Link>

              {isOwner ? (
                <TrustBadge username={profile.username} className="h-9" />
              ) : (
                <FollowButton
                  username={profile.username}
                  followState={profile.followState ?? 'none'}
                  className="h-9"
                />
              )}
            </div>

            {showRequestsEntry && (
              <Link
                to={CLIENT_ROUTES.FOLLOW_REQUESTS}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
              >
                Follow requests
                {pendingRequestCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                    {pendingRequestCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {profile.bio && (
        <BioModal
          bio={profile.bio}
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileHeader;
