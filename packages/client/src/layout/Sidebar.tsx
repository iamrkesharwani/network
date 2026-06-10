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
    'fixed inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border',
    'transform transition-transform duration-300 ease-in-out flex flex-col',
    'md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
  ].join(' ');

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 h-16 md:hidden border-b border-border">
          <span className="text-base font-semibold font-display text-text-primary">
            Menu
          </span>
          <button
            onClick={onMobileClose}
            className="p-1.5 text-text-muted rounded-lg hover:bg-surface-raised focus:outline-none transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-text-secondary rounded-xl transition-colors hover:bg-error/8 hover:text-error focus:outline-none"
            onClick={() => console.log('Logout clicked')}
          >
            <LogOut className="w-4 h-4 shrink-0 opacity-70" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
