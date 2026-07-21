import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSocket } from '../../shared/hooks/useSocket';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useMediaStatusSocket } from '../../shared/hooks/useMediaStatusSocket';
import { useEngagementCountSocket } from '../../shared/hooks/useEngagementCountSocket';
import { SocketProvider } from '../../shared/hooks/SocketContext';
import { useCreatorEventSocket } from '../../features/creator/hooks/useCreatorEventSocket';
import BadgeToast from '../../features/creator/components/BadgeToast';
import { usePreference } from '../../features/settings/hooks/usePreference';
import DeactivatedAccountBanner from '../../features/settings/components/account/DeactivatedAccountBanner';

const PageWrapper = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const socketRef = useSocket(accessToken);
  useMediaStatusSocket(socketRef);
  useEngagementCountSocket(socketRef);
  const { current: creatorCelebration, dismiss: dismissCreatorCelebration } =
    useCreatorEventSocket(socketRef);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [appearance, setAppearance] = usePreference('appearance');
  const isSidebarCollapsed = appearance.sidebarCollapsed ?? true;

  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <SocketProvider socketRef={socketRef}>
      <div className="h-screen bg-surface-alt flex flex-col overflow-hidden">
        <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <DeactivatedAccountBanner />
        <BadgeToast
          item={creatorCelebration}
          onDismiss={dismissCreatorCelebration}
        />

        <div className="flex flex-1 w-full min-h-0">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() =>
              setAppearance({ sidebarCollapsed: !isSidebarCollapsed })
            }
          />

          <main
            ref={mainRef}
            className="flex-1 min-w-0 overflow-y-auto pb-14 md:pb-0 max-md:scrollbar-none max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden"
          >
            <div className="w-full px-4 pt-0 pb-4 md:px-5 md:pt-5 md:pb-5">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
};

export default PageWrapper;
