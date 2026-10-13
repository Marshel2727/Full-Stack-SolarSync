import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outline' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-surface-border shadow-sm',
    glass: 'bg-white/80 backdrop-blur-glass border border-white/60 shadow-glass',
    elevated: 'bg-white border border-surface-border shadow-ambient',
    outline: 'bg-transparent border border-surface-border',
    gradient: 'bg-gradient-to-br from-primary-forest to-primary text-white border-none shadow-ambient',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-4 sm:p-6 lg:p-8',
    xl: 'p-4 sm:p-6 lg:p-10',
  };

  const hoverStyles = hoverEffect ? 'transition-shadow duration-200 hover:shadow-md' : '';

  return (
    <div
      className={`min-w-0 rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
