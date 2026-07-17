import { Link } from 'react-router-dom';
import { buildProfilePath } from '../../features/profile/utils/buildProfilePath';
import { CLIENT_ROUTES, type IUser } from '@network/shared';
import Avatar from '../../shared/ui/primitives/Avatar';

export interface NavbarAvatarProps {
  user: IUser | null;
}

const NavbarAvatar = ({ user }: NavbarAvatarProps) => {
  return (
    <Link
      to={
        user?.username ? buildProfilePath(user.username) : CLIENT_ROUTES.LOGIN
      }
      className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary transition-all focus:outline-none"
    >
      <Avatar
        size="sm"
        src={user?.avatarUrl}
        alt={user?.username}
        fallback={user?.username}
      />
    </Link>
  );
};

export default NavbarAvatar;
