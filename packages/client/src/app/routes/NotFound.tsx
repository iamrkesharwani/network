import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Home } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../shared/hooks/usePageTitle';
import LogoIcon from '../../public/Logo.svg?react';

const DIGITS = '404'.split('');

const PARTICLES = [
  { top: '18%', left: '12%', size: 6, duration: 7, delay: 0 },
  { top: '68%', left: '20%', size: 4, duration: 9, delay: 1.2 },
  { top: '30%', left: '82%', size: 5, duration: 8, delay: 0.6 },
  { top: '75%', left: '78%', size: 3, duration: 6.5, delay: 2 },
  { top: '50%', left: '92%', size: 4, duration: 10, delay: 1.6 },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const digitVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -60 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 300, damping: 18 },
  },
};

const NotFound = () => {
  usePageTitle('Page not found');

  return (
    <div
      className="relative overflow-hidden bg-surface text-text-primary font-sans antialiased"
      style={{ minHeight: '100dvh' }}
    >
      <div className="bg-veil fixed inset-0 z-1" aria-hidden="true" />

      <motion.div
        className="spotlight fixed z-1 w-176 h-176 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="fixed z-1 rounded-full bg-primary/40 pointer-events-none"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
          }}
          aria-hidden="true"
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="relative z-2 flex flex-col items-center justify-center gap-6 px-6 py-8 text-center"
        style={{ minHeight: '100dvh' }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={riseVariants}>
          <LogoIcon aria-hidden="true" className="w-9" />
        </motion.div>

        <div className="flex" style={{ perspective: 800 }}>
          {DIGITS.map((digit, index) => (
            <motion.span
              key={index}
              variants={digitVariants}
              className="font-display text-8xl sm:text-9xl font-bold text-text-primary"
            >
              {digit}
            </motion.span>
          ))}
        </div>

        <motion.div
          variants={riseVariants}
          className="flex flex-col gap-2 max-w-sm"
        >
          <p className="text-lg font-semibold font-display text-text-primary">
            Looks like this page wandered off
          </p>
          <p className="text-sm text-text-muted">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </motion.div>

        <motion.div variants={riseVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              to={CLIENT_ROUTES.FEED}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Home className="w-4 h-4" />
              Back to home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
