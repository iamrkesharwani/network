import { Lock } from 'lucide-react';

interface LockedFieldNoticeProps {
  label: string;
  message: string;
}

const LockedFieldNotice = ({ label, message }: LockedFieldNoticeProps) => (
  <div className="mb-6">
    <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
      <Lock className="h-3.5 w-3.5 shrink-0" />
      {label}
    </p>
    <div className="rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-text-muted">
      {message}
    </div>
  </div>
);

export default LockedFieldNotice;
