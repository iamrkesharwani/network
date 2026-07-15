import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clapperboard, Search, MessageCircle, User } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { buildProfilePath } from '../../features/profile/utils/buildProfilePath';
import MobileSearchOverlay from '../../features/search/components/MobileSearchOverlay';

const tabClasses = ({ isActive }: { isActive: boolean }) =>
  [
    'flex flex-1 flex-col items-center justify-center gap-1 h-full',
    'focus:outline-none',
    isActive ? 'text-icon-active' : 'text-icon',
  ].join(' ');

const MobileBottomNav = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isOnShorts = location.pathname.startsWith('/shorts');

  const profilePath =
    isAuthenticated && user?.username
      ? buildProfilePath(user.username)
      : CLIENT_ROUTES.LOGIN;

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-60 h-14 md:hidden bg-surface/90 backdrop-blur-md border-t border-border flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavLink to={CLIENT_ROUTES.FEED} end className={tabClasses}>
          <Home className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="sr-only">Home</span>
        </NavLink>

        <NavLink
          to={CLIENT_ROUTES.SHORTS}
          className={() => tabClasses({ isActive: isOnShorts })}
        >
          <Clapperboard className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="sr-only">Shorts</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search"
          className={tabClasses({ isActive: isSearchOpen })}
        >
          <Search className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="sr-only">Search</span>
        </button>

        <NavLink to={CLIENT_ROUTES.MESSAGES} className={tabClasses}>
          <MessageCircle className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="sr-only">Messages</span>
        </NavLink>

        <NavLink to={profilePath} className={tabClasses}>
          <User className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="sr-only">Profile</span>
        </NavLink>
      </nav>

      {isSearchOpen && (
        <MobileSearchOverlay onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
};

export default MobileBottomNav;
