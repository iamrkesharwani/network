import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../../../../shared/hooks/useAppDispatch';
import Button from '../../../../../shared/ui/primitives/Button';
import DeactivateAccountDialog from '../../../components/account/DeactivateAccountDialog';
import DeleteAccountDialog from '../../../components/account/DeleteAccountDialog';
import SignOutOtherDevicesDialog from '../../../components/account/SignOutOtherDevicesDialog';
import ChangePasswordSection from './ChangePasswordSection';
import AddPasswordSection from './AddPasswordSection';
import KeyResetModal from '../../../../message/components/KeyResetModal';
import { useLogoutMutation } from '../../../../auth/authApi';
import { clearCredentials } from '../../../../auth/authSlice';
import { setAccessToken } from '../../../../../shared/lib/axiosInstance';

const AccountTab = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSignOutOthersOpen, setIsSignOutOthersOpen] = useState(false);
  const [isKeyResetOpen, setIsKeyResetOpen] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error(
        'Server logout failed, forcing local session clear:',
        error
      );
    } finally {
      setAccessToken(null);
      dispatch(clearCredentials());
      navigate(CLIENT_ROUTES.LOGIN, { replace: true });
    }
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Account
      </h2>

      <div className="mb-8 border-b border-border pb-8">
        {user.hasPassword ? <ChangePasswordSection /> : <AddPasswordSection />}
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              Log out
            </h3>
            <p className="text-sm text-text-secondary sm:max-w-md">
              Sign out of your account on this device.
            </p>
          </div>
          <Button
            variant="outline"
            isLoading={isLoggingOut}
            onClick={handleLogout}
            className="w-full shrink-0 sm:w-auto"
          >
            Log out
          </Button>
        </div>
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              Sign out of all other devices
            </h3>
            <p className="text-sm text-text-secondary sm:max-w-md">
              Sign out everywhere except this device.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSignOutOthersOpen(true)}
            className="w-full shrink-0 sm:w-auto"
          >
            Sign out other devices
          </Button>
        </div>
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              Reset messaging key
            </h3>
            <p className="text-sm text-text-secondary sm:max-w-md">
              Set a new messaging passphrase. You'll permanently lose access
              to your previous encrypted conversations.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsKeyResetOpen(true)}
            className="w-full shrink-0 sm:w-auto"
          >
            Reset messaging key
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-error">Danger zone</h3>

        <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm text-text-secondary sm:max-w-md">
            Deactivate your account. Your profile and content will be hidden
            until you log back in.
          </p>
          <Button
            variant="danger"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setIsDeactivateOpen(true)}
          >
            Deactivate account
          </Button>
        </div>

        <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm text-text-secondary sm:max-w-md">
            Permanently delete your account and everything you own. Logging back
            in within the grace period cancels this.
          </p>
          <Button
            variant="danger"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </div>

      <DeactivateAccountDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
      />
      <DeleteAccountDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
      <SignOutOtherDevicesDialog
        isOpen={isSignOutOthersOpen}
        onClose={() => setIsSignOutOthersOpen(false)}
      />
      <KeyResetModal
        isOpen={isKeyResetOpen}
        onClose={() => setIsKeyResetOpen(false)}
        userId={user.id}
        hasPassword={user.hasPassword}
      />
    </div>
  );
};

export default AccountTab;
