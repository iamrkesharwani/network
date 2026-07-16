import type { UseFormRegisterReturn } from 'react-hook-form';
import FloatingInput from '../../upload/components/FloatingInput';
import { useUsernameCooldown } from '../hooks/useUsernameCooldown';

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

  return (
    <FloatingInput
      label="Username"
      {...registration}
      disabled={cooldown.isInCooldown}
      error={error}
      hint={
        cooldown.isInCooldown
          ? `You can change your username again in ${cooldown.daysRemaining} day${cooldown.daysRemaining === 1 ? '' : 's'}.`
          : undefined
      }
    />
  );
};

export default UsernameField;
