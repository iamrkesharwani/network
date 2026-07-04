import Contribution from '../../features/creator/components/Contribution';
import BadgeShowcase from '../../features/creator/components/BadgeShowcase';
import { useGetMyProfileQuery } from '../../features/creator/creatorApi';
import { Loader2 } from 'lucide-react';

export const Profile = () => {
  const { data, isLoading } = useGetMyProfileQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const uploadActivity = data?.data.uploadActivity ?? [];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-xl font-bold font-display text-text-primary">
        Profile
      </h1>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">
          Publishing activity
        </p>
        <Contribution uploadActivity={uploadActivity} />
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">Badges</p>
        <BadgeShowcase />
      </div>
    </div>
  );
};

export const Settings = () => <div className="p-8 text-xl">Settings</div>;
export const NotFound = () => <div className="p-8 text-xl">404</div>;
