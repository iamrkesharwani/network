import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, type FollowState } from '@network/shared';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import Button from '../../../shared/ui/primitives/Button';
import { useFollowUserMutation, useUnfollowUserMutation } from '../followApi';

export interface FollowButtonProps {
  username: string;
  followState: FollowState;
  className?: string;
}

const FollowButton = ({ username, followState, className }: FollowButtonProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(CLIENT_ROUTES.LOGIN);
      return;
    }

    if (followState === 'none') {
      followUser(username);
    } else {
      unfollowUser(username);
    }
  };

  return (
    <Button
      variant={followState === 'none' ? 'primary' : 'outline'}
      size="sm"
      isLoading={isFollowing || isUnfollowing}
      onClick={handleClick}
      className={className}
    >
      {followState === 'accepted'
        ? 'Following'
        : followState === 'pending'
          ? 'Requested'
          : 'Follow'}
    </Button>
  );
};

export default FollowButton;
