import React from 'react';
import cn from 'clsx';

export default function Input({
  variant = 'outline',
  size = 'md',
  className,
  ...props
}) {
  const base = 'rounded-md focus:outline-none focus:ring-2';
  const variants = {
    outline: 'border border-gray-300 focus:ring-indigo-300',
    ghost:   'border-none bg-gray-100 focus:ring-indigo-300'
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  return (
    <input
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
