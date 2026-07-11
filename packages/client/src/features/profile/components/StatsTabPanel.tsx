import { Loader2 } from 'lucide-react';
import { useGetMyProfileQuery } from '../../creator/creatorApi';
import Contribution from '../../creator/components/Contribution';
import BadgeShowcase from '../../creator/components/BadgeShowcase';

const StatsTabPanel = () => {
  const { data, isLoading } = useGetMyProfileQuery();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const uploadActivity = data?.data.uploadActivity ?? [];
  const videoPublishCount = data?.data.videoPublishCount ?? 0;
  const shortPublishCount = data?.data.shortPublishCount ?? 0;
  const postPublishCount = data?.data.postPublishCount ?? 0;

  return (
    <div className="space-y-8">
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

export default StatsTabPanel;
