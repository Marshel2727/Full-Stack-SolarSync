import React from 'react';

interface Option {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: Option[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  errorText,
  options,
  leftIcon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const fallbackId = React.useId();
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : fallbackId);

  const describedBy = errorText
    ? `${selectId}-error`
    : helperText
    ? `${selectId}-helper`
    : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slateText">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className={`relative flex min-h-11 items-center rounded-xl border bg-white focus-within:ring-2 transition-colors duration-200 ${errorText ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100' : 'border-surface-border focus-within:border-primary focus-within:ring-primary/20'}`}>
        {leftIcon && <div className="shrink-0 pl-3.5 text-slateText-muted pointer-events-none">{leftIcon}</div>}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedBy}
          className={`ui-field-control min-w-0 w-full min-h-11 rounded-xl bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-slateText focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ''}
            </option>
          ))}
        </select>
        <div className="shrink-0 pr-3.5 pointer-events-none text-slateText-muted">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {errorText && <p id={`${selectId}-error`} role="alert" className="text-xs font-medium text-rose-600">{errorText}</p>}
      {helperText && !errorText && <p id={`${selectId}-helper`} className="text-xs text-slateText-muted">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
