import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import Avatar from '../shared/components/Avatar';
import { useTheme } from '../shared/hooks/useTheme';

export interface NavbarProps {
  onMobileMenuClick: () => void;
}

export const Navbar = ({ onMobileMenuClick }: NavbarProps) => {
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 w-full sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 -ml-2 text-text-muted rounded-lg md:hidden hover:bg-surface-raised hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            onClick={onMobileMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold font-display">
                N
              </span>
            </div>
            <span className="text-lg font-semibold font-display tracking-tight text-text-primary group-hover:text-primary transition-colors">
              Network
            </span>
          </Link>
        </div>

        <div className="hidden flex-1 max-w-lg px-10 md:block">
          <div className="relative">
            <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="search"
              className="w-full h-9 pl-9 pr-4 text-sm bg-surface-raised border border-border rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-surface transition-all"
              placeholder="Search videos, creators..."
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="relative p-2 text-text-muted rounded-full hover:bg-surface-raised hover:text-text-primary focus:outline-none transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-surface" />
          </button>

          <button
            onClick={toggle}
            className="p-2 text-text-muted rounded-full hover:bg-surface-raised hover:text-text-primary focus:outline-none transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Link
            to="/profile"
            className="ml-1 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all"
          >
            <Avatar size="sm" fallback="U" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
