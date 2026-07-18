import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserRound, Heart, Link2, Check, Circle } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import { cn } from '../../../../../shared/utils/cn';
import {
  BASIC_FIELDS,
  PERSONAL_FIELDS,
  LINKS_FIELDS,
  ALL_MY_INFO_FIELDS,
  computeFieldsCompletion,
} from '../../../utils/myInfoCompletion';

const TILES = [
  {
    id: 'basic',
    title: 'Basic',
    icon: UserRound,
    path: CLIENT_ROUTES.SETTINGS_MY_INFO_BASIC,
    fields: BASIC_FIELDS,
  },
  {
    id: 'personal',
    title: 'Personal',
    icon: Heart,
    path: CLIENT_ROUTES.SETTINGS_MY_INFO_PERSONAL,
    fields: PERSONAL_FIELDS,
  },
  {
    id: 'contact',
    title: 'Links',
    icon: Link2,
    path: CLIENT_ROUTES.SETTINGS_MY_INFO_CONTACT,
    fields: LINKS_FIELDS,
  },
] as const;

const MyInfoOverview = () => {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;

  const overall = computeFieldsCompletion(user, ALL_MY_INFO_FIELDS);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
          My Info
        </h2>
        <span className="text-xs font-semibold text-primary">
          {overall.percent}% complete
        </span>
      </div>

      <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${overall.percent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {TILES.map((tile, i) => {
          const completion = computeFieldsCompletion(user, tile.fields);
          const Icon = tile.icon;

          return (
            <Link
              key={tile.id}
              to={tile.path}
              className="group block h-full outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                whileHover={{ y: -2 }}
                className={cn(
                  'flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors group-hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-primary',
                  'sm:flex-col sm:items-center sm:gap-0 sm:p-6 sm:text-center'
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-raised sm:mb-4 sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
                </div>

                <div className="min-w-0 sm:w-full">
                  <h3 className="text-sm font-semibold text-text-primary sm:mb-4 sm:text-base">
                    {tile.title}
                  </h3>

                  <p className="mt-0.5 truncate text-xs text-text-muted sm:hidden">
                    {completion.missingLabels.length === 0
                      ? 'All set'
                      : `${completion.filledCount}/${completion.totalCount} complete`}
                  </p>

                  <ul className="hidden w-full space-y-2 text-left sm:block">
                    {tile.fields.map((field) => {
                      const isFilled = field.isFilled(user);
                      return (
                        <li
                          key={field.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          {isFilled ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                          )}
                          <span
                            className={
                              isFilled ? 'text-text-primary' : 'text-text-muted'
                            }
                          >
                            {field.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyInfoOverview;
