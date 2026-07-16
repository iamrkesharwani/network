import { AtSign } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import BorderedInput from '../general/BorderedInput';
import LockedFieldNotice from '../general/LockedFieldNotice';
import { useUsernameCooldown } from '../../hooks/useUsernameCooldown';

interface UsernameFieldProps {
  registration: UseFormRegisterReturn;
  error?: string;
  usernameChangedAt: Date | string | null | undefined;
}

const UsernameField = ({
  registration,
  error,
  usernameChangedAt,
}: UsernameFieldProps) => {
  const cooldown = useUsernameCooldown(usernameChangedAt);

  if (cooldown.isInCooldown) {
    return (
      <LockedFieldNotice
        label="Username"
        message={`You can change your username again in ${cooldown.daysRemaining}d ${cooldown.hoursRemaining}h.`}
      />
    );
  }

  return (
    <BorderedInput
      label="Username"
      icon={AtSign}
      placeholder="yourusername"
      {...registration}
      error={error}
    />
  );
};

export default UsernameField;
