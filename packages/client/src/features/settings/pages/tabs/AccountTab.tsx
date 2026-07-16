import { useState } from 'react';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import Button from '../../../../shared/ui/primitives/Button';
import { useUsernameCooldown } from '../../hooks/useUsernameCooldown';
import DeactivateAccountDialog from '../../components/DeactivateAccountDialog';

const AccountTab = () => {
  const user = useAppSelector((state) => state.auth.user);
  const cooldown = useUsernameCooldown(user?.usernameChangedAt);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <div className="mb-8 border-b border-border pb-8">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Username
        </h3>
        <p className="text-sm text-text-secondary">
          {cooldown.isInCooldown
            ? `You can change your username again in ${cooldown.daysRemaining} day${cooldown.daysRemaining === 1 ? '' : 's'}.`
            : 'You can change your username from the My Info tab.'}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-error">Danger zone</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Deactivate your account. Your profile and content will be hidden
          until you log back in.
        </p>
        <Button variant="danger" onClick={() => setIsDeactivateOpen(true)}>
          Deactivate account
        </Button>
      </div>

      <DeactivateAccountDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
      />
    </div>
  );
};

export default AccountTab;
