import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefixText?: string;
  suffixText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorText,
  prefixText,
  suffixText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slateText">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className={`relative flex min-h-11 items-center rounded-xl border bg-white focus-within:ring-2 transition-colors duration-200 ${errorText ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100' : 'border-surface-border focus-within:border-primary focus-within:ring-primary/20'}`}>
        {leftIcon && <div className="shrink-0 pl-3.5 text-slateText-muted pointer-events-none">{leftIcon}</div>}
        {prefixText && (
          <span className="pl-3.5 pr-1 text-sm font-semibold text-slateText-muted border-r border-slate-200 mr-2 py-1">
            {prefixText}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={errorText ? true : undefined}
          className={`ui-field-control min-w-0 w-full min-h-11 rounded-xl bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-slateText placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        />
        {suffixText && (
          <span className="pr-3.5 pl-1 text-xs font-semibold text-slateText-muted border-l border-slate-200 ml-2 py-1">
            {suffixText}
          </span>
        )}
        {rightIcon && <div className="shrink-0 pr-3.5 text-slateText-muted">{rightIcon}</div>}
      </div>
      {errorText && <p className="text-xs font-medium text-rose-600 animate-fadeIn">{errorText}</p>}
      {helperText && !errorText && <p className="text-xs text-slateText-muted">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
