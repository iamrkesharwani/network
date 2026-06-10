export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

const Skeleton = ({ variant = 'text', className = '' }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return <div className={combinedClasses} aria-hidden="true" />;
};

export default Skeleton;
