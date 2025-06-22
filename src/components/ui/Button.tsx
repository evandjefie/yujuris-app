import React from 'react';
import { COLORS } from '../../constants';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: `
      bg-[${COLORS.primary}] hover:bg-[${COLORS.primaryHover}] 
      text-white focus:ring-[${COLORS.primary}]
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
      text-gray-800 dark:text-gray-200 focus:ring-gray-300 dark:focus:ring-gray-600
      border border-gray-200 dark:border-gray-600
    `,
    outline: `
      border-2 border-[${COLORS.primary}] text-[${COLORS.primary}] 
      hover:bg-[${COLORS.primary}] hover:text-white 
      focus:ring-[${COLORS.primary}] bg-transparent
      dark:border-[${COLORS.primaryLight}] dark:text-[${COLORS.primaryLight}]
      dark:hover:bg-[${COLORS.primaryLight}] dark:hover:text-white
    `,
    ghost: `
      text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
      focus:ring-gray-300 dark:focus:ring-gray-600
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white focus:ring-red-500
      shadow-sm hover:shadow-md
    `
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: variant === 'primary' ? COLORS.primary : undefined,
        borderColor: variant === 'outline' ? COLORS.primary : undefined,
        color: variant === 'outline' ? COLORS.primary : undefined
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled) {
          e.currentTarget.style.backgroundColor = COLORS.primaryHover;
        }
        if (variant === 'outline' && !disabled) {
          e.currentTarget.style.backgroundColor = COLORS.primary;
          e.currentTarget.style.color = 'white';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled) {
          e.currentTarget.style.backgroundColor = COLORS.primary;
        }
        if (variant === 'outline' && !disabled) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = COLORS.primary;
        }
      }}
    >
      {children}
    </button>
  );
};