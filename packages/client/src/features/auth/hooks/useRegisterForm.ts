import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  userRegistrationSchema,
  type UserRegistrationInput,
  type ApiErrorResponse,
} from '@network/shared';
import { useRegisterMutation } from '../authApi';
import { useToast } from '../../../shared/hooks/useToast';

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [signup, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<UserRegistrationInput>({
    resolver: zodResolver(userRegistrationSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signup(data).unwrap();
      addToast('Registration successful! Please check your email.', 'success');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (err: unknown) {
      const msg =
        (err as { data?: ApiErrorResponse })?.data?.error?.message ??
        'Something went wrong. Try again.';
      addToast(msg, 'error');
    }
  });

  return { register, setFocus, errors, isLoading, onSubmit };
};
