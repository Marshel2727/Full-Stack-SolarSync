import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center text-center font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'min-h-10 text-sm px-3 py-2 rounded-xl gap-1.5',
    md: 'min-h-11 text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'min-h-12 text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-container text-white shadow-sm hover:shadow focus:ring-primary',
    secondary: 'bg-solar hover:bg-solar-container text-primary-forest shadow-sm focus-visible:ring-solar',
    outline: 'border border-primary text-primary hover:bg-primary-fixed/20 focus:ring-primary',
    ghost: 'text-slateText hover:bg-surface-muted focus:ring-primary-light',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    dark: 'bg-forest hover:bg-primary-dark text-white focus:ring-forest',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
