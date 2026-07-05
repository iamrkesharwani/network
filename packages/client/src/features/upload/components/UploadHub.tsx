import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clapperboard, Smartphone, FileText } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

const UPLOAD_OPTIONS = [
  {
    id: 'video',
    title: 'Video',
    description: 'Long-form, high quality.',
    icon: Clapperboard,
    path: '/upload/video',
    accent: 'text-primary',
    glow: 'bg-primary/25',
    iconTint: 'text-primary/30',
  },
  {
    id: 'short',
    title: 'Short',
    description: 'Vertical, under 60s.',
    icon: Smartphone,
    path: '/upload/short',
    accent: 'text-purple-500',
    glow: 'bg-purple-500/25',
    iconTint: 'text-purple-500/30',
  },
  {
    id: 'post',
    title: 'Post',
    description: 'Text, images, updates.',
    icon: FileText,
    path: '/upload/post',
    accent: 'text-emerald-500',
    glow: 'bg-emerald-500/25',
    iconTint: 'text-emerald-500/30',
  },
] as const;

const UploadHub = () => {
  return (
    <div className="mx-auto max-w-4xl pb-8 sm:pb-20 pt-12 px-4">
      <div className="text-center mb-6 sm:mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-extrabold font-display leading-tight tracking-tight text-text-primary"
        >
          What would you like to create?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-1.5 text-sm sm:text-base text-text-muted"
        >
          Choose a format to share with your audience.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {UPLOAD_OPTIONS.map((option, i) => {
          const Icon = option.icon;
          return (
            <Link
              key={option.id}
              to={option.path}
              className="group block outline-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.08,
                  type: 'spring',
                  stiffness: 300,
                  damping: 24,
                }}
                className="relative flex h-24 sm:h-auto sm:aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-sm transition-colors group-hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-primary"
              >
                <motion.div
                  className={cn(
                    'pointer-events-none absolute -top-8 -right-8 size-20 sm:size-32 rounded-full blur-3xl',
                    option.glow
                  )}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                />

                <motion.div
                  className="absolute -top-3 -right-3"
                  animate={{ rotate: [12, 4, 12] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  <Icon
                    className={cn('size-12 sm:size-20', option.iconTint)}
                    strokeWidth={1.25}
                  />
                </motion.div>

                <div className="relative">
                  <h2 className="text-lg sm:text-2xl font-bold font-display text-text-primary">
                    {option.title}
                  </h2>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-muted">
                    {option.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UploadHub;
