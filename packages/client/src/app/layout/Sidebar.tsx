import { NavLink } from 'react-router-dom';
import {
  Home,
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  X,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileText,
  Gavel,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useLogoutMutation } from '../../features/auth/authApi';
import { clearCredentials } from '../../features/auth/authSlice';
import { setAccessToken } from '../../shared/lib/axiosInstance';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../shared/hooks/useAppDispatch';
import { buildProfilePath } from '../../features/profile/utils/buildProfilePath';

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
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);

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
      dispatch(clearCredentials());
      navigate(CLIENT_ROUTES.LOGIN, { replace: true });
    }
  };

  const navItems = [
    { name: 'Home', path: CLIENT_ROUTES.FEED, icon: Home },
    { name: 'Posts', path: CLIENT_ROUTES.POSTS, icon: FileText },
    { name: 'Upload', path: CLIENT_ROUTES.UPLOAD, icon: UploadCloud },
    ...(isAuthenticated && authUser?.username
      ? [
          {
            name: 'Profile',
            path: buildProfilePath(authUser.username),
            icon: User,
          },
          { name: 'Jury Duty', path: CLIENT_ROUTES.JURY_QUEUE, icon: Gavel },
          { name: 'Settings', path: CLIENT_ROUTES.SETTINGS, icon: Settings },
        ]
      : []),
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
              end={item.path === CLIENT_ROUTES.FEED}
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
          {isAuthenticated ? (
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
          ) : (
            <>
              <NavLink
                to={CLIENT_ROUTES.LOGIN}
                onClick={onMobileClose}
                title={!showLabels ? 'Log in' : undefined}
                className={[
                  'group flex items-center rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-all focus:outline-none w-full',
                  !showLabels
                    ? 'justify-center px-0 py-2.5 w-10 mx-auto'
                    : 'gap-3 px-3 py-2.5',
                ].join(' ')}
              >
                <LogIn
                  className={[
                    'shrink-0 text-icon group-hover:text-icon-hover transition-colors',
                    !showLabels ? 'w-5 h-5' : 'w-4.5 h-4.5',
                  ].join(' ')}
                  strokeWidth={1.75}
                />
                {showLabels && <span>Log in</span>}
              </NavLink>

              <NavLink
                to={CLIENT_ROUTES.REGISTER}
                onClick={onMobileClose}
                title={!showLabels ? 'Sign up' : undefined}
                className={[
                  'group flex items-center rounded-lg text-sm font-medium text-primary hover:bg-primary-muted transition-all focus:outline-none w-full',
                  !showLabels
                    ? 'justify-center px-0 py-2.5 w-10 mx-auto'
                    : 'gap-3 px-3 py-2.5',
                ].join(' ')}
              >
                <UserPlus
                  className={[
                    'shrink-0',
                    !showLabels ? 'w-5 h-5' : 'w-4.5 h-4.5',
                  ].join(' ')}
                  strokeWidth={1.75}
                />
                {showLabels && <span>Sign up</span>}
              </NavLink>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
