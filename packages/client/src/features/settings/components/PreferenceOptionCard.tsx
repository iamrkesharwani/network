import type { ReactNode } from 'react';

interface PreferenceOptionCardProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const PreferenceOptionCard = ({
  label,
  description,
  children,
}: PreferenceOptionCardProps) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised p-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {description && (
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      )}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export default PreferenceOptionCard;
