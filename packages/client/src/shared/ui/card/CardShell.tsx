import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardShellProps {
  header: ReactNode;
  media?: ReactNode;
  mediaBadges?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const CardShell = ({
  header,
  media,
  mediaBadges,
  footer,
  className,
}: CardShellProps) => (
  <article
    className={cn(
      'group rounded-2xl border border-border bg-surface overflow-hidden',
      className
    )}
  >
    <div className="p-4 sm:p-5 flex flex-col gap-3">{header}</div>

    {media && (
      <div className="relative border-t border-border">
        {media}
        {mediaBadges}
      </div>
    )}

    {footer && (
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 flex flex-col gap-3 border-t border-border">
        {footer}
      </div>
    )}
  </article>
);

export default CardShell;
