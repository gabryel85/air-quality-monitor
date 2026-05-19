/**
 * FormField — molecule.
 *
 * Wraps a labelled form control with helper text and an error slot. Wires:
 *   - <label htmlFor> → control id
 *   - <input aria-describedby> → helper + error IDs
 *   - <input aria-invalid> → presence of error
 *
 * Render-prop API (children as function) so the caller chooses the actual
 * control (Input, textarea, Select, …) and the FormField passes the wired
 * IDs in. Keeps the component generic without prop-drilling control types.
 */

import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface FormFieldRenderProps {
  readonly id: string;
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
}

export interface FormFieldProps {
  readonly label: string;
  readonly helperText?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly children: (props: FormFieldRenderProps) => ReactNode;
}

export function FormField({
  label,
  helperText,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const baseId = useId();
  const controlId = `${baseId}-control`;
  const helperId = `${baseId}-helper`;
  const errorId = `${baseId}-error`;

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="text-ink-primary text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-error ml-0.5">
            *
          </span>
        ) : null}
      </label>

      {children({ id: controlId, describedBy, invalid: Boolean(error) })}

      {helperText && !error ? (
        <p id={helperId} className="text-ink-tertiary text-sm">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-error text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
