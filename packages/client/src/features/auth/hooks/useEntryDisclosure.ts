import { useCallback, useRef, useState } from 'react';

export const useEntryDisclosure = (onOpen: () => void) => {
  const [entryCollapsed, setEntryCollapsed] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [backVisible, setBackVisible] = useState(false);

  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailEntryBtnRef = useRef<HTMLButtonElement>(null);

  const openEmailForm = useCallback(() => {
    if (t1.current) clearTimeout(t1.current);
    (document.activeElement as HTMLElement | null)?.blur();
    setEntryCollapsed(true);
    t1.current = setTimeout(() => {
      setFormOpen(true);
      setBackVisible(true);
      onOpen();
    }, 180);
  }, [onOpen]);

  const closeEmailForm = useCallback(() => {
    if (t2.current) clearTimeout(t2.current);
    (document.activeElement as HTMLElement | null)?.blur();
    setFormOpen(false);
    setBackVisible(false);
    t2.current = setTimeout(() => {
      setEntryCollapsed(false);
      emailEntryBtnRef.current?.focus();
    }, 100);
  }, []);

  return {
    entryCollapsed,
    formOpen,
    backVisible,
    emailEntryBtnRef,
    openEmailForm,
    closeEmailForm,
  };
};
