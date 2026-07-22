import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  X,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileText,
  Film,
  Gavel,
  MessageCircle,
} from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useHasUnreadConversations } from '../../features/message/hooks/useHasUnreadConversations';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const LAYOUT_TRANSITION = {
  type: 'tween' as const,
  duration: 0.38,
  ease: EASE,
};
const LABEL_TRANSITION = { type: 'tween' as const, duration: 0.3, ease: EASE };

const Sidebar = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const hasUnreadConversations = useHasUnreadConversations();

  const navItems = [
    { name: 'Home', path: CLIENT_ROUTES.FEED, icon: Home },
    { name: 'Shorts', path: CLIENT_ROUTES.SHORTS_FEED, icon: Film },
    { name: 'Posts', path: CLIENT_ROUTES.POSTS, icon: FileText },
    { name: 'Upload', path: CLIENT_ROUTES.UPLOAD, icon: UploadCloud },
    ...(isAuthenticated
      ? [
          {
            name: 'Messages',
            path: CLIENT_ROUTES.MESSAGES,
            icon: MessageCircle,
            hasBadge: hasUnreadConversations,
          },
        ]
      : []),
    ...(isAuthenticated && authUser?.username
      ? [{ name: 'Jury', path: CLIENT_ROUTES.JURY_QUEUE, icon: Gavel }]
      : []),
  ];

  const showLabels = isMobileOpen || !isCollapsed;

  const sidebarClasses = [
    'fixed inset-y-0 left-0 z-50 flex flex-col',
    'bg-surface border-r border-border',
    'transform transition-all duration-[380ms] ease-in-out',
    'md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0',
    'w-56',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
    isCollapsed ? 'md:w-16' : 'md:w-56',
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

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === CLIENT_ROUTES.FEED}
              onClick={onMobileClose}
              title={!showLabels ? item.name : undefined}
              className={({ isActive }) =>
                [
                  'group relative flex items-center justify-center overflow-hidden rounded-lg text-sm font-medium',
                  'transition-colors duration-300',
                  !showLabels
                    ? 'w-12 mx-auto py-2.5 px-1'
                    : 'w-full py-2.5 px-3',
                  isActive
                    ? 'bg-primary-muted text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <motion.div
                  layout
                  transition={LAYOUT_TRANSITION}
                  className={
                    !showLabels
                      ? 'flex flex-col items-center justify-center gap-1.5'
                      : 'flex items-center gap-3 w-full'
                  }
                >
                  <motion.div
                    layout="position"
                    transition={LAYOUT_TRANSITION}
                    className="relative"
                  >
                    <item.icon
                      className={[
                        'shrink-0 transition-all duration-300',
                        !showLabels ? 'w-5 h-5' : 'w-4.5 h-4.5',
                        isActive
                          ? 'text-icon-active'
                          : 'text-icon group-hover:text-icon-hover',
                      ].join(' ')}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    {'hasBadge' in item && item.hasBadge && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </motion.div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {showLabels ? (
                      <motion.span
                        key="expanded"
                        layout
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={LABEL_TRANSITION}
                      >
                        {item.name}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="collapsed"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={LABEL_TRANSITION}
                        className="text-[9px] leading-none font-medium tracking-tight"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
