import React, { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '../../../shared/utils/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

const OtpInput = ({
  length = 6,
  value = '',
  onChange,
  error,
  label,
}: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const currentChars = value.split('');

    for (let i = 0; i < length; i++) {
      if (!currentChars[i]) currentChars[i] = '';
    }

    currentChars[index] = val.slice(-1);
    onChange(currentChars.join(''));

    if (val && index < length - 1) {
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const currentChars = value.split('');
      if (!currentChars[index]) {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
          currentChars[index - 1] = '';
          onChange(currentChars.join(''));
        }
      } else {
        currentChars[index] = '';
        onChange(currentChars.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-start w-full mb-5">
      {label && (
        <label className="mb-2.5 font-display font-semibold text-[0.7rem] tracking-[0.08em] uppercase text-[--color-text-muted]">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
              return;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              'w-full aspect-square text-center text-[1.4rem] font-display font-bold rounded-[10px] border border-white/9 bg-[--color-surface-raised] text-[--color-text-primary] focus:outline-none focus:border-[--color-primary] transition-colors',
              error ? 'border-red-500/50 focus:border-red-500' : ''
            )}
          />
        ))}
      </div>

      {error && (
        <span className="error-text text-[0.75rem] text-red-500 mt-2 text-left w-full">
          {error}
        </span>
      )}
    </div>
  );
};

export default OtpInput;
