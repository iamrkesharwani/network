import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('rounded-md skeleton-shimmer', className)} {...props} />
);

export default Skeleton;
