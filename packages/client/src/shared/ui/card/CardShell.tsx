import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardShellProps {
  header: ReactNode;
  media?: ReactNode;
  mediaBadges?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** 'split' puts media in a left column with header+footer scrolling together
   * on the right, for wide detail views (e.g. a post-detail modal). Only takes
   * effect at the lg breakpoint and above - below that it stacks like normal,
   * same as the default. */
  layout?: 'stacked' | 'split';
}

const CardShell = ({
  header,
  media,
  mediaBadges,
  footer,
  className,
  layout = 'stacked',
}: CardShellProps) => (
  <article
    className={cn(
      'group rounded-2xl border border-border bg-surface overflow-hidden',
      className
    )}
  >
    {layout === 'split' && media ? (
      <div className="lg:grid lg:grid-cols-[1fr_380px]">
        <div className="relative flex items-center justify-center overflow-hidden bg-black">
          {media}
          {mediaBadges}
        </div>
        <div className="flex flex-col border-border lg:max-h-[75vh] lg:overflow-y-auto lg:overflow-x-hidden lg:border-l">
          <div className="p-4 sm:p-5 flex flex-col gap-3">{header}</div>
          {footer && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 flex flex-col gap-3 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    ) : (
      <>
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
      </>
    )}
  </article>
);

export default CardShell;
