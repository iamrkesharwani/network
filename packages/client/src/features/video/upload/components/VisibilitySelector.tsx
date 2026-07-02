import { motion } from 'framer-motion';
import { Globe, Link2, Lock } from 'lucide-react';
import { type VideoVisibility } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';

const OPTIONS: {
  value: VideoVisibility;
  label: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can search for and watch this video.',
    icon: Globe,
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Only people with the link can watch.',
    icon: Link2,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can watch this video.',
    icon: Lock,
  },
];

interface VisibilitySelectorProps {
  value: VideoVisibility;
  onChange: (visibility: VideoVisibility) => void;
}

const VisibilitySelector = ({ value, onChange }: VisibilitySelectorProps) => {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-text-secondary mb-2.5">
        Visibility
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const Icon = option.icon;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-colors cursor-pointer',
                selected
                  ? 'border-primary bg-primary-muted'
                  : 'border-border bg-surface-raised hover:border-primary/40'
              )}
            >
              <Icon
                className={cn(
                  'w-4.5 h-4.5',
                  selected ? 'text-primary' : 'text-icon'
                )}
              />
              <span
                className={cn(
                  'text-sm font-semibold',
                  selected ? 'text-primary' : 'text-text-primary'
                )}
              >
                {option.label}
              </span>
              <span className="text-[0.7rem] text-text-muted leading-snug">
                {option.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VisibilitySelector;
