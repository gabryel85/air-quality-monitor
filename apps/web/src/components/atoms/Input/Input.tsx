import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { input, type InputSize } from './inputStyles';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly inputSize?: InputSize;
  readonly invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, inputSize, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid ? 'true' : undefined}
      className={cn(input({ size: inputSize }), className)}
      {...rest}
    />
  );
});
