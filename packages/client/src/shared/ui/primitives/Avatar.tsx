import { useState, type ImgHTMLAttributes } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { AvatarSize } from '@network/shared';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: AvatarSize;
  fallback?: string;
  isOnline?: boolean;
}

const Avatar = ({
  src,
  alt = 'User avatar',
  size = 'md',
  fallback,
  isOnline,
  className,
  ...props
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const indicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-full',
          'bg-surface-raised text-text-secondary font-medium overflow-hidden shrink-0',
          sizeClasses[size],
          className
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            {...props}
          />
        ) : fallback ? (
          <span className="uppercase">{fallback.substring(0, 2)}</span>
        ) : (
          <User className={iconSizes[size]} />
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface',
            isOnline ? 'bg-success' : 'bg-text-muted',
            indicatorSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
