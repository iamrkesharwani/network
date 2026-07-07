import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('rounded-md skeleton-shimmer', className)} {...props} />
);

export default Skeleton;
