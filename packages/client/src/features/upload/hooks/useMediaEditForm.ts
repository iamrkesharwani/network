import { useMemo, useState } from 'react';
import { useForm, type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodTypeAny } from 'zod';

export function extractErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'error' in err.data &&
    err.data.error &&
    typeof err.data.error === 'object' &&
    'message' in err.data.error &&
    typeof err.data.error.message === 'string'
  ) {
    return err.data.error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function createThumbnailUploader(
  uploadThumbnail: (formData: FormData) => {
    unwrap: () => Promise<{ data: { thumbnailUrl: string } }>;
  }
) {
  return async (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const result = await uploadThumbnail(formData).unwrap();
    return result.data.thumbnailUrl;
  };
}

export interface CompletenessRule<TValues> {
  weight: number;
  isMet: (values: TValues) => boolean;
}

export function computeCompleteness<TValues>(
  values: TValues,
  rules: CompletenessRule<TValues>[]
): number {
  const score = rules.reduce(
    (acc, rule) => acc + (rule.isMet(values) ? rule.weight : 0),
    0
  );
  return Math.min(100, score);
}

export interface MediaEditFormConfig<
  TFormValues extends FieldValues,
  TInput extends FieldValues,
> {
  schema: ZodTypeAny;
  defaultValues: TFormValues;
  completenessRules: CompletenessRule<TFormValues>[];
}

export function useMediaEditForm<
  TFormValues extends FieldValues,
  TInput extends FieldValues,
>(config: MediaEditFormConfig<TFormValues, TInput>) {
  const { schema, defaultValues, completenessRules } = config;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<TFormValues, unknown, TInput>({
    resolver: zodResolver(schema) as Resolver<TFormValues, unknown, TInput>,
    defaultValues,
  });

  const watchedValues = form.watch();

  const completeness = useMemo(
    () => computeCompleteness(watchedValues, completenessRules),
    [watchedValues, completenessRules]
  );

  const submit = (onValid: (data: TInput) => Promise<void>) =>
    form.handleSubmit(async (data) => {
      setSubmitError(null);
      try {
        await onValid(data);
      } catch (err) {
        setSubmitError(extractErrorMessage(err));
      }
    });

  return { ...form, completeness, submitError, submit };
}
