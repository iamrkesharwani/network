import { ShieldAlert } from 'lucide-react';

export interface RemovedContentBannerProps {
  onAppealClick: () => void;
}

const RemovedContentBanner = ({ onAppealClick }: RemovedContentBannerProps) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-error/30 bg-error-subtle px-3 py-2">
    <div className="flex items-center gap-2 text-sm text-error">
      <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      Removed by community jury
    </div>
    <button
      type="button"
      onClick={onAppealClick}
      className="shrink-0 text-sm font-medium text-primary hover:underline"
    >
      Appeal
    </button>
  </div>
);

export default RemovedContentBanner;
