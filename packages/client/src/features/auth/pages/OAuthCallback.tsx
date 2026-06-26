import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../shared/components/ToastContainer';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useEffect, useRef } from 'react';
import {
  axiosInstance,
  setAccessToken,
} from '../../../shared/lib/axiosInstance';
import { setCredentials } from '../authSlice';
import Spinner from '../../../shared/components/Spinner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      addToast(error, 'error');
      navigate('/login', { replace: true });
      return;
    }

    if (success) {
      const initializeSession = async () => {
        try {
          const { data } = await axiosInstance.post('/auth/refresh');
          const { accessToken, user } = data.data;
          setAccessToken(accessToken);
          dispatch(setCredentials({ user, accessToken }));
          addToast('Successfully signed in!', 'success');
          navigate('/feed', { replace: true });
        } catch (err) {
          console.error(err);
          addToast(
            'Authentication failed. Please try logging in again.',
            'error'
          );
          navigate('/login', { replace: true });
        }
      };

      initializeSession();
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, addToast, dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background]">
      <div className="flex flex-col items-center gap-5">
        <Spinner />
        <p className="text-[--color-text-muted] font-display font-medium tracking-wide animate-pulse">
          Completing sign in...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
