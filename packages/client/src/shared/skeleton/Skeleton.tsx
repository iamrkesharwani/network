import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-raised', className)}
      {...props}
    />
  );
};

export default Skeleton;
