import { motion } from 'framer-motion';
import { VIDEO_CATEGORIES, type VideoCategory } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { CategoryMeta } from '../../../shared/upload/CategoryMeta';

interface CategoryPickerProps {
  value: VideoCategory | undefined;
  onChange: (category: VideoCategory) => void;
  error?: string;
}

const CategoryPicker = ({ value, onChange, error }: CategoryPickerProps) => {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-text-secondary mb-2.5">Category</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-5">
        {VIDEO_CATEGORIES.map((category) => {
          const meta = CategoryMeta[category];
          const Icon = meta.icon;
          const selected = value === category;
          return (
            <motion.button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1 transition-colors cursor-pointer',
                selected
                  ? 'border-primary bg-primary-muted'
                  : 'border-border bg-surface-raised hover:border-primary/40'
              )}
            >
              <motion.div animate={selected ? { scale: [1, 1.15, 1] } : {}}>
                <Icon
                  className={cn(
                    'w-5 h-5',
                    selected ? 'text-primary' : 'text-icon'
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  'text-[0.65rem] font-medium leading-none text-center',
                  selected ? 'text-primary' : 'text-text-muted'
                )}
              >
                {meta.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CategoryPicker;
