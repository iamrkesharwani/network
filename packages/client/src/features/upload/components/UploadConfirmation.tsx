import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { buildProfileTabPath } from '../../profile/utils/buildProfilePath';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';

const FULL_MOTION_DELAY_MS = 1800;
const REDUCED_MOTION_DELAY_MS = 600;

interface UploadConfirmationProps {
  mediaLabel: string;
  profileTab: 'videos' | 'shorts';
}

const UploadConfirmation = ({
  mediaLabel,
  profileTab,
}: UploadConfirmationProps) => {
  const navigate = useNavigate();
  const username = useAppSelector((state) => state.auth.user?.username);
  const prefersReducedMotion = useReducedMotion();
  const delayMs = prefersReducedMotion
    ? REDUCED_MOTION_DELAY_MS
    : FULL_MOTION_DELAY_MS;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(username ? buildProfileTabPath(username, profileTab) : '/', {
        replace: true,
      });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [navigate, username, profileTab, delayMs]);

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto py-6">
      <div className="relative mb-6">
        {!prefersReducedMotion && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-primary/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full bg-primary/40"
            />
          </>
        )}

        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-xl shadow-primary/30 bg-primary z-10"
        >
          <PartyPopper className="w-9 h-9" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold font-display text-text-primary">
          You're all set
        </h2>
        <p className="mt-1.5 text-sm text-text-muted max-w-sm">
          We'll notify you the moment your {mediaLabel} is ready.
        </p>
      </motion.div>

      <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-surface-overlay">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: delayMs / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default UploadConfirmation;
