import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import Button from '../../../shared/ui/primitives/Button';
import { useFollowUserMutation, useUnfollowUserMutation } from '../followApi';

export interface FollowButtonProps {
  username: string;
  isFollowedByViewer: boolean;
  className?: string;
}

const FollowButton = ({
  username,
  isFollowedByViewer,
  className,
}: FollowButtonProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(CLIENT_ROUTES.LOGIN);
      return;
    }

    if (isFollowedByViewer) {
      unfollowUser(username);
    } else {
      followUser(username);
    }
  };

  return (
    <Button
      variant={isFollowedByViewer ? 'outline' : 'primary'}
      size="sm"
      isLoading={isFollowing || isUnfollowing}
      onClick={handleClick}
      className={className}
    >
      {isFollowedByViewer ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
