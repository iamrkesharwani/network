import AuthLayout from '../../features/auth/components/AuthLayout';
import Skeleton from './Skeleton';

const buttonShell =
  'w-full flex items-center justify-center gap-2.5 px-5 py-[0.825rem] rounded-[10px] border border-white/9 bg-[--color-surface-raised]';

const AuthSkeleton = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-95 flex flex-col items-center text-center">
        <div className="mb-8">
          <Skeleton className="h-[0.7rem] w-20" />
        </div>

        <div className="mb-10">
          <Skeleton className="h-[2.6rem] w-72" />
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className={buttonShell}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className={buttonShell}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className={buttonShell}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthSkeleton;
