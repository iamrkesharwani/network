import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../shared/hooks/useTheme';
import Avatar from '../../shared/ui/primitives/Avatar';
import { SITE_NAME } from '@network/shared';
import LogoIcon from '../../public/Logo.svg?react';

export interface NavbarProps {
  onMobileMenuClick: () => void;
}

const Navbar = ({ onMobileMenuClick }: NavbarProps) => {
  const { isDark, toggle } = useTheme();

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

        <button className="relative p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </button>

        <Link
          to="/profile"
          className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary transition-all focus:outline-none"
        >
          <Avatar size="sm" fallback="U" />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
