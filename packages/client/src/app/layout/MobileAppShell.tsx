import { Outlet } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';

const MobileAppShell = () => (
  <>
    <Outlet />
    <MobileBottomNav />
  </>
);

export default MobileAppShell;
