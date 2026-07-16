import { useState } from 'react';
import { Mail } from 'lucide-react';
import { maskEmail } from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import {
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
} from '../../../auth/authApi';
import BorderedInput from '../general/BorderedInput';
import Button from '../../../../shared/ui/primitives/Button';
import ConfirmModal from '../../../../shared/ui/overlay/ConfirmModal';
import MaskedFieldRow from './MaskedFieldRow';
import LockedFieldNotice from '../general/LockedFieldNotice';
import OtpInput from '../../../auth/components/OtpInput';

type Step = 'masked' | 'new-email' | 'otp';

const EmailChangeField = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [step, setStep] = useState<Step>('masked');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showGoogleUnlinkConfirm, setShowGoogleUnlinkConfirm] = useState(false);

  const [requestEmailChange, { isLoading: isRequesting }] =
    useRequestEmailChangeMutation();
  const [confirmEmailChange, { isLoading: isConfirming }] =
    useConfirmEmailChangeMutation();

  if (!user) return null;

  const reset = () => {
    setStep('masked');
    setNewEmail('');
    setPassword('');
    setOldOtp('');
    setNewOtp('');
    setError(null);
  };

  const handleSendCodes = async () => {
    setError(null);
    try {
      await requestEmailChange({ newEmail, password }).unwrap();
      setStep('otp');
    } catch {
      setError('Could not send codes. Check your password and try again.');
    }
  };

  const isGoogleLinked = user.authProviders.includes('google');

  const handleSendCodesClick = () => {
    if (isGoogleLinked) {
      setShowGoogleUnlinkConfirm(true);
      return;
    }
    handleSendCodes();
  };

  const handleConfirmGoogleUnlink = () => {
    setShowGoogleUnlinkConfirm(false);
    handleSendCodes();
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await confirmEmailChange({
        oldEmailOtp: oldOtp,
        newEmailOtp: newOtp,
      }).unwrap();
      reset();
    } catch {
      setError('One or both codes are incorrect.');
    }
  };

  if (!user.hasPassword) {
    return (
      <LockedFieldNotice
        label="Email"
        message="Managed by Google sign-in. Add a password in Security to change your email."
      />
    );
  }

  if (step === 'masked') {
    return (
      <MaskedFieldRow
        label="Email"
        icon={Mail}
        maskedValue={maskEmail(user.email)}
        isEditing={false}
        onEdit={() => setStep('new-email')}
      >
        {null}
      </MaskedFieldRow>
    );
  }

  if (step === 'new-email') {
    return (
      <div className="mb-6 rounded-lg border border-border p-4">
        <p className="mb-3 text-xs font-medium text-text-secondary">
          Enter your new email and current password
        </p>

        <BorderedInput
          label="New email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
        />
        <BorderedInput
          label="Current password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p role="alert" className="mb-3 text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isRequesting}
            onClick={handleSendCodesClick}
          >
            Send codes
          </Button>
        </div>

        <ConfirmModal
          isOpen={showGoogleUnlinkConfirm}
          onClose={() => setShowGoogleUnlinkConfirm(false)}
          onConfirm={handleConfirmGoogleUnlink}
          intent="warning"
          title="This will disconnect Google sign-in"
          description="Changing your email disconnects Google sign-in from this account. You'll still be able to log in with your email and password."
          confirmLabel="Continue"
          isLoading={isRequesting}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-border p-4">
      <p className="mb-3 text-xs font-medium text-text-secondary">
        Enter the codes sent to both your current and new email addresses
      </p>

      <OtpInput
        label="Code sent to current email"
        value={oldOtp}
        onChange={setOldOtp}
      />
      <OtpInput
        label="Code sent to new email"
        value={newOtp}
        onChange={setNewOtp}
      />

      {error && (
        <p role="alert" className="mb-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          isLoading={isConfirming}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default EmailChangeField;
