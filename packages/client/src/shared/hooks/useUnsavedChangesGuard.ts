import { useCallback, useState, type RefObject } from 'react';

export interface EditFormHandle {
  isDirty: boolean;
  submit: () => void;
}

export function useUnsavedChangesGuard(
  formRef: RefObject<EditFormHandle | null>,
  close: () => void
) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const requestClose = useCallback(() => {
    if (formRef.current?.isDirty) {
      setIsConfirmOpen(true);
    } else {
      close();
    }
  }, [formRef, close]);

  const keepEditing = useCallback(() => setIsConfirmOpen(false), []);

  const discard = useCallback(() => {
    setIsConfirmOpen(false);
    close();
  }, [close]);

  const save = useCallback(() => {
    setIsConfirmOpen(false);
    formRef.current?.submit();
  }, [formRef]);

  return { isConfirmOpen, requestClose, keepEditing, discard, save };
}
