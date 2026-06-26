import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageWrapper = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-surface-alt flex flex-col overflow-hidden">
      <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 w-full min-h-0">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
