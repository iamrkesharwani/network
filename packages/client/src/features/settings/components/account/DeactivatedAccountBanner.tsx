import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import Button from '../../../../shared/ui/primitives/Button';
import { useReactivateAccountMutation } from '../../accountApi';

const DeactivatedAccountBanner = () => {
  const status = useAppSelector((state) => state.auth.user?.status);
  const [reactivateAccount, { isLoading }] = useReactivateAccountMutation();

  if (status !== 'deactivated') return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary-subtle px-4 py-2.5 text-sm">
      <span className="text-text-primary">
        Welcome back — your account is currently deactivated.
      </span>
      <Button
        size="sm"
        isLoading={isLoading}
        onClick={() => reactivateAccount()}
      >
        Reactivate
      </Button>
    </div>
  );
};

export default DeactivatedAccountBanner;
