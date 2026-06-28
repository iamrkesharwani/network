import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  User,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../features/auth/authApi';
import { setAccessToken } from '../shared/lib/axiosInstance';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error(
        'Server logout failed, forcing local session clear:',
        error
      );
    } finally {
      setAccessToken(null);
      navigate('/login', { replace: true });
    }
  };

  const navItems = [
    { name: 'Feed', path: '/feed', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const showLabels = isMobileOpen || !isCollapsed;

  const sidebarClasses = [
    'fixed inset-y-0 left-0 z-50 flex flex-col',
    'bg-surface border-r border-border',
    'transform transition-all duration-300 ease-in-out',
    'md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0',
    'w-56',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
    isCollapsed ? 'md:w-14' : 'md:w-56',
  ].join(' ');

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between px-4 h-14 md:hidden border-b border-border shrink-0">
          <span className="text-sm font-semibold font-display text-text-primary">
            Menu
          </span>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:flex h-12 items-center border-b border-border shrink-0 px-2">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
            className="p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onMobileClose}
              title={!showLabels ? item.name : undefined}
              className={({ isActive }) =>
                [
                  'group flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                  !showLabels
                    ? 'justify-center px-0 py-2.5 w-10 mx-auto'
                    : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-primary-muted text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={[
                      'shrink-0 transition-colors',
                      !showLabels ? 'w-5 h-5' : 'w-4.5 h-4.5',
                      isActive
                        ? 'text-icon-active'
                        : 'text-icon group-hover:text-icon-hover',
                    ].join(' ')}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {showLabels && item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-border shrink-0 space-y-1">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            title={
              !showLabels
                ? isLoading
                  ? 'Logging out...'
                  : 'Log Out'
                : undefined
            }
            className={[
              'group flex items-center rounded-lg text-sm font-medium text-text-secondary hover:text-error hover:bg-error-subtle transition-all focus:outline-none w-full',
              !showLabels
                ? 'justify-center px-0 py-2.5 w-10 mx-auto'
                : 'gap-3 px-3 py-2.5',
            ].join(' ')}
          >
            <LogOut
              className={[
                'shrink-0 text-icon group-hover:text-error transition-colors',
                !showLabels ? 'w-5 h-5' : 'w-4.5 h-4.5',
              ].join(' ')}
              strokeWidth={1.75}
            />
            {showLabels && (
              <span>{isLoading ? 'Logging out...' : 'Log Out'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
