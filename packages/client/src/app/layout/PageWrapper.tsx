import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SIDEBAR_COLLAPSED_STORAGE_KEY } from '@network/shared';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useMediaStatusSocket } from '../../shared/hooks/useMediaStatusSocket';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useDeviceSyncedPreference } from '../../features/user/hooks/useDeviceSyncedPreference';

const PageWrapper = () => {
  useMediaStatusSocket();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dbSidebarCollapsed = useAppSelector(
    (state) => state.auth.user?.preferences?.sidebarCollapsed
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useDeviceSyncedPreference<boolean>({
      storageKey: SIDEBAR_COLLAPSED_STORAGE_KEY,
      defaultValue: true,
      dbValue: dbSidebarCollapsed,
      toPatch: (value) => ({ sidebarCollapsed: value }),
    });

  return (
    <div className="h-screen bg-surface-alt flex flex-col overflow-hidden">
      <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 w-full min-h-0">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
