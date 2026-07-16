import { useState } from 'react';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import Button from '../../../../../shared/ui/primitives/Button';
import DeactivateAccountDialog from '../../../components/DeactivateAccountDialog';
import ChangePasswordSection from './ChangePasswordSection';
import AddPasswordSection from './AddPasswordSection';

const AccountTab = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <div className="mb-8 border-b border-border pb-8">
        {user.hasPassword ? <ChangePasswordSection /> : <AddPasswordSection />}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-error">Danger zone</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Deactivate your account. Your profile and content will be hidden until
          you log back in.
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
