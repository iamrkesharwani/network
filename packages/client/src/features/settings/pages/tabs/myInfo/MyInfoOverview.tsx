import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserRound, Heart, Link2 } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import {
  BASIC_FIELDS,
  PERSONAL_FIELDS,
  CONTACT_FIELDS,
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
    title: 'Contact & Links',
    icon: Link2,
    path: CLIENT_ROUTES.SETTINGS_MY_INFO_CONTACT,
    fields: CONTACT_FIELDS,
  },
] as const;

const MyInfoOverview = () => {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;

  const overall = computeFieldsCompletion(user, ALL_MY_INFO_FIELDS);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-text-primary">
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
        {TILES.map((tile) => {
          const completion = computeFieldsCompletion(user, tile.fields);
          const Icon = tile.icon;

          return (
            <Link
              key={tile.id}
              to={tile.path}
              className="group flex h-24 flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-auto sm:aspect-4/5"
            >
              <Icon
                className="h-6 w-6 text-text-muted sm:mb-6"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {tile.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {completion.missingLabels.length === 0
                    ? 'All set'
                    : `Missing: ${completion.missingLabels.join(', ')}`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyInfoOverview;
