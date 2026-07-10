import { Loader2 } from 'lucide-react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Contribution from '../components/Contribution';
import BadgeShowcase from '../components/BadgeShowcase';
import { useGetMyProfileQuery } from '../creatorApi';

const ProfilePage = () => {
  usePageTitle('Profile');
  const { data, isLoading } = useGetMyProfileQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const uploadActivity = data?.data.uploadActivity ?? [];
  const videoPublishCount = data?.data.videoPublishCount ?? 0;
  const shortPublishCount = data?.data.shortPublishCount ?? 0;
  const postPublishCount = data?.data.postPublishCount ?? 0;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-xl font-bold font-display text-text-primary">
        Profile
      </h1>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">
          Publishing activity
        </p>
        <Contribution
          uploadActivity={uploadActivity}
          videoPublishCount={videoPublishCount}
          shortPublishCount={shortPublishCount}
          postPublishCount={postPublishCount}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">Badges</p>
        <BadgeShowcase />
      </div>
    </div>
  );
};

export default ProfilePage;
