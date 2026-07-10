import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../shared/hooks/useTheme';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import Avatar from '../../shared/ui/primitives/Avatar';
import { SITE_NAME, CLIENT_ROUTES } from '@network/shared';
import LogoIcon from '../../public/Logo.svg?react';
import { buildProfilePath } from '../../features/profile/utils/buildProfilePath';

export interface NavbarProps {
  onMobileMenuClick: () => void;
}

const Navbar = ({ onMobileMenuClick }: NavbarProps) => {
  const { isDark, toggle } = useTheme();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-surface border-b border-border flex items-center px-4 sm:px-6">
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="p-2 -ml-1 rounded-lg md:hidden text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoIcon aria-hidden="true" className="w-7" />
          <span className="text-[1.4rem] font-semibold font-display text-text-primary tracking-tight group-hover:text-primary transition-colors">
            {SITE_NAME}
          </span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center px-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icon pointer-events-none" />
          <input
            type="search"
            placeholder="Search videos, creators..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface-raised border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-surface transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {isAuthenticated ? (
          <>
            <button className="relative p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </button>

            <Link
              to={user?.username ? buildProfilePath(user.username) : CLIENT_ROUTES.LOGIN}
              className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary transition-all focus:outline-none"
            >
              <Avatar
                size="sm"
                src={user?.avatarUrl}
                alt={user?.username}
                fallback={user?.username}
              />
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link
              to={CLIENT_ROUTES.LOGIN}
              className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              Log in
            </Link>
            <Link
              to={CLIENT_ROUTES.REGISTER}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary-hover h-9 px-3 text-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
