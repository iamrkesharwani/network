import ContributionGraph from '../../features/creator/components/ContributionGraph';
import BadgeShowcase from '../../features/creator/components/BadgeShowcase';
import { useGetMyProfileQuery } from '../../features/creator/creatorApi';

export const Explore = () => <div className="p-8 text-xl">Explore</div>;

export const Profile = () => {
  const { data } = useGetMyProfileQuery();
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
        <ContributionGraph uploadActivity={uploadActivity} />
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
