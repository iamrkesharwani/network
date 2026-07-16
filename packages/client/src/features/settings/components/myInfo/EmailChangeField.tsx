import { useState } from 'react';
import { maskEmail } from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import {
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
} from '../../../auth/authApi';
import FloatingInput from '../../../upload/components/FloatingInput';
import Button from '../../../../shared/ui/primitives/Button';
import MaskedFieldRow from './MaskedFieldRow';

type Step = 'masked' | 'new-email' | 'otp';

const EmailChangeField = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [step, setStep] = useState<Step>('masked');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  if (step === 'masked') {
    return (
      <MaskedFieldRow
        label="Email"
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

        <FloatingInput
          label="New email"
          type="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
        />
        <FloatingInput
          label="Current password"
          type="password"
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
            onClick={handleSendCodes}
          >
            Send codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-border p-4">
      <p className="mb-3 text-xs font-medium text-text-secondary">
        Enter the codes sent to both your current and new email addresses
      </p>

      <FloatingInput
        label="Code sent to current email"
        value={oldOtp}
        onChange={(event) => setOldOtp(event.target.value)}
      />
      <FloatingInput
        label="Code sent to new email"
        value={newOtp}
        onChange={(event) => setNewOtp(event.target.value)}
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
