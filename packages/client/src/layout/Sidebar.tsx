import { NavLink } from 'react-router-dom';
import { Home, Compass, User, Settings, LogOut, X } from 'lucide-react';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
  const navItems = [
    { name: 'Feed', path: '/feed', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarClasses = [
    'fixed inset-y-0 left-0 z-50 w-56 flex flex-col',
    'bg-surface border-r border-border',
    'transform transition-transform duration-300 ease-in-out',
    'md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
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

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
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
                      'w-4.5 h-4.5 shrink-0 transition-colors',
                      isActive
                        ? 'text-icon-active'
                        : 'text-icon group-hover:text-icon-hover',
                    ].join(' ')}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border shrink-0">
          <button
            onClick={() => console.log('Logout clicked')}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-error hover:bg-error-subtle transition-all focus:outline-none"
          >
            <LogOut
              className="w-4.5 h-4.5 shrink-0 text-icon group-hover:text-error transition-colors"
              strokeWidth={1.75}
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
