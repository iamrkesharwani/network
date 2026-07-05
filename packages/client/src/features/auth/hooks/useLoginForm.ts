import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  type LoginInput,
  type ApiErrorResponse,
} from '@network/shared';
import { useLoginMutation } from '../authApi';
import { useToast } from '../../../shared/hooks/useToast';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? '/feed';

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: ApiErrorResponse })?.data?.error?.message ??
        'Something went wrong. Try again.';
      addToast(msg, 'error');
    }
  });

  return { register, setFocus, errors, isLoading, onSubmit };
};
