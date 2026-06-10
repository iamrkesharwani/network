import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PageWrapper from '../layout/PageWrapper';

const Login = () => <div className="p-8 text-xl">Login Page</div>;
const Feed = () => <div className="p-8 text-xl">Feed</div>;
const Explore = () => <div className="p-8 text-xl">Explore Page</div>;
const Profile = () => <div className="p-8 text-xl">Profile Page </div>;
const Settings = () => <div className="p-8 text-xl">Settings</div>;
const NotFound = () => <div className="p-8 text-xl text-red-500">404</div>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PageWrapper />,
        children: [
          {
            path: '/',
            element: <Navigate to="/feed" replace />,
          },
          {
            path: '/feed',
            element: <Feed />,
          },
          {
            path: '/explore',
            element: <Explore />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
